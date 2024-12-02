import type { Buffer } from 'node:buffer'
import { sleep } from 'crawlee'
import * as v from 'valibot'
import { MODEL_TO_USE } from '~/constants/llm'
import { postIndentificationsTable } from '~/server/database/schema'
import { bufferToBase64 } from '~/utils/file'
import { sanitizeId } from '~/utils/id'
import { hasMessage, parseIdentify } from '~/utils/llm'

export const identifySystemPrompt = {
  role: 'system' as const,
  content: `
You are a hip hop flyer identification tool.
- ONLY RESPOND true OR false
- ONLY RESPOND WITH ONE WORD TOKEN
`,
}

const identifyPostRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(identifyPostRouterParams, data)
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
    const identification = await db.query.postIndentificationsTable.findFirst({
      where: (identifications, { eq }) => (eq(identifications.instagramPostId, parsed.output.id)),
    })
    if (identification) {
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
      systemPrompt: identifySystemPrompt,
      userPrompt: {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Is the next image a flyer? Answer true or false.',
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
      await db.insert(postIndentificationsTable).values({
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

    const parsedLine = parseIdentify({ raw: choice.message.content })

    await db.insert(postIndentificationsTable).values({
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
      error: parsedLine.error,
    })

    return sendNoContent(event)
  },
)
