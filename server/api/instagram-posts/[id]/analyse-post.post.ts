import type { Buffer } from 'node:buffer'
import { sleep } from 'crawlee'
import { format } from 'date-fns'
import * as v from 'valibot'
import { MODEL_TO_USE } from '~/constants/llm'
import { postAnalysesTable } from '~/server/database/schema'
import { bufferToBase64 } from '~/utils/file'
import { sanitizeId } from '~/utils/id'
import { hasMessage, parseAnalysis } from '~/utils/llm'

const analyseSystemPrompt = {
  role: 'system' as const,
  content: `
You are a flyer image analysis tool that extracts and structures temporal and spatial information.
- ANSWER in pt-br (brazilian portuguese)
- ONLY RESPOND THE CSV LINE
- ALWAYS validate dates:
  * ONLY accept dates between current date and next 12 months
  * If date is in the past or more than 12 months in future, return null
- ONLY extract location if you are highly confident it's an event venue
- If either date OR location is invalid/uncertain, return null for BOTH
- ALWAYS ANSWER ONLY WITH A SINGLE LINE IN CSV FORMAT
- ALWAYS USE ; AS THE SEPARATOR FOR THE CSV LINE

Required format: YYYY-MM-DDTHH:mm;location

Valid response examples:
null;null
2024-03-15T14:30;Parque Central 
`,
}
const analysePostRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(analysePostRouterParams, data)
}

export default defineEventHandler(
  async (event) => {
    const parsed = await getValidatedRouterParams(event, validateRouterParams)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    const post = await db.query.instagramPostsTable.findFirst({
      where: (posts, { eq }) => (eq(posts.id, parsed.output.id)),
    })
    if (!post) {
      throw createError({
        status: 404,
        statusMessage: 'Not Found',
        message: `The instagram post id "${parsed.output.id}" was not found.`,
      })
    }
    const analysis = await db.query.postAnalysesTable.findFirst({
      where: (analyses, { eq }) => (eq(analyses.instagramPostId, parsed.output.id)),
    })
    if (analysis) {
      return sendNoContent(event)
    }
    const storage = useStorage('images')
    const openRouterClient = useOpenRouter()
    const battleId = post.rhymeBattleId
    const imageKey = `${battleId}:${sanitizeId(post.id)}.jpeg`
    const image = await storage.getItemRaw<Buffer>(imageKey)

    if (!image) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: `Could not open image "${imageKey}".`,
      })
    }

    const base64image = bufferToBase64(image)

    const requestBody = useOpenRouterRequestBody({
      model: MODEL_TO_USE,
      systemPrompt: analyseSystemPrompt,
      userPrompt: {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `
                The current year is ${new Date().getFullYear()}. 
                The image content will be in brazilian format.
                It was posted on ${format(post.timestamp, 'yyyy-MM-dd')}
                Extract the datetime and location information from the next image.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: base64image,
            },
          },
        ],
      },
    })

    const completionsEndpoint: Endpoints = '/chat/completions' as const
    const completionsResponse = await openRouterClient<Responses[typeof completionsEndpoint]>(completionsEndpoint, {
      method: 'POST',
      body: requestBody,
    })

    await sleep(3000) // Generation ID not generating fast enough.

    const generationEndpoint: Endpoints = '/generation' as const
    const generationResponse = await openRouterClient<Responses[typeof generationEndpoint]>(generationEndpoint, {
      method: 'GET',
      params: {
        id: completionsResponse.id,
      },
    })
    const generationResponseData = generationResponse.data

    const choice = completionsResponse.choices.at(0)

    if (!choice || !hasMessage(choice)) {
      await db.insert(postAnalysesTable).values({
        id: completionsResponse.id,
        instagramPostId: post.id,
        rhymeBattleId: post.rhymeBattleId,
        model: completionsResponse.model,
        provider: completionsResponse.provider,
        nativeTokensPrompt: generationResponse.data.native_tokens_prompt,
        nativeTokensCompletion: generationResponse.data.native_tokens_completion,
        totalCost: generationResponseData.total_cost,
        generationTime: generationResponseData.generation_time,
        latency: generationResponseData.latency,
      })
      return
    }

    const parsedLine = parseAnalysis({ raw: choice.message.content })

    await db.insert(postAnalysesTable).values({
      id: completionsResponse.id,
      instagramPostId: post.id,
      rhymeBattleId: post.rhymeBattleId,
      model: completionsResponse.model,
      provider: completionsResponse.provider,
      nativeTokensPrompt: generationResponse.data.native_tokens_prompt,
      nativeTokensCompletion: generationResponse.data.native_tokens_completion,
      totalCost: generationResponseData.total_cost,
      generationTime: generationResponseData.generation_time,
      latency: generationResponseData.latency,
      rawContent: parsedLine.raw,
      parsedContent: parsedLine.result,
      errors: parsedLine.errors,
    })

    return sendNoContent(event)
  },
)
