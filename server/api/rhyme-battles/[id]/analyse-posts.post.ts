import type { Buffer } from 'node:buffer'
import { format, isBefore, parseISO } from 'date-fns'
import * as v from 'valibot'
import type { POST_ANALYSIS_ERRORS } from '~/constants/errors'
import { postAnalysesTable } from '~/server/database/schema'
import type { Endpoints, NonStreamingChoice, Request, Responses } from '~/server/utils/useOpenRouter/types'
import { sanitizeId } from '~/utils/id'

const ISO_DATE_TIME_REGEX: RegExp = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])T(?:0\d|1\d|2[0-3]):[0-5]\d$/u
const QUOTES_REGEX = /['"]/g

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
interface ParseLineParams {
  rawLine?: string | null
  postDate: Date
}
function parseLine({ rawLine, postDate }: ParseLineParams) {
  const errors: Partial<Record<keyof typeof POST_ANALYSIS_ERRORS, true>> = {}
  const line = rawLine || ''
  const split = line.split(',')
  if (split.length !== 2) {
    errors.INVALID_LINE_FORMAT = true
    return { rawLine, result: 'null, null', errors }
  }
  const rawDateTime = split[0].trim().replace(QUOTES_REGEX, '')
  const rawLocation = split[1].trim().replace(QUOTES_REGEX, '')
  let dateTime: string | null = rawDateTime
  let location: string | null = rawLocation

  if (rawDateTime === 'null' || rawDateTime === 'undefined') {
    dateTime = null
    errors.NULL_DATETIME = true
  }

  if (rawLocation === 'null' || rawLocation === 'undefined') {
    location = null
    errors.NULL_LOCATION = true
  }

  const dateTimeIsValid = typeof dateTime === 'string' && Boolean(dateTime.match(ISO_DATE_TIME_REGEX))

  if (dateTime && !dateTimeIsValid) {
    errors.INVALID_DATETIME = true
  }

  if (dateTimeIsValid && isBefore(parseISO(dateTime!), postDate)) {
    errors.PAST_DATETIME = true
  }

  const result = `${dateTime},${location}`
  return { rawLine, result, errors }
}

function hasMessage(obj: Record<string, any>): obj is NonStreamingChoice {
  return 'message' in obj
}

function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64String = buffer.toString('base64')
  return `data:${mimeType};base64,${base64String}`
};

const systemPrompt = {
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

Required format: YYYY-MM-DDTHH:mm, location

Valid response examples:
null, null
2024-03-15T14:30, Parque Central 
`,
}
// const modelToUse = 'meta-llama/llama-3.2-1b-instruct:free'
// const modelToUse = 'meta-llama/llama-3.2-11b-vision-instruct'
const modelToUse = 'meta-llama/llama-3.2-90b-vision-instruct'

const rhymeBattleRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(rhymeBattleRouterParams, data)
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
    const battleWithPosts = await db.query.rhymeBattlesTable.findFirst({
      columns: { id: true, isActive: true, weekDay: true, startTime: true },
      where: (battles, { eq }) => (eq(battles.id, parsed.output.id)),
      with: {
        instagramPosts: {
          columns: { id: true, timestamp: true, description: true, alt: true, href: true },
          orderBy: (battles, { desc }) => [desc(battles.timestamp)],
          // where: (posts, { gt }) => (gt(posts.timestamp, subDays(new Date(), 15))),
          limit: 3,
        },
      },
    })
    if (!battleWithPosts) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsed.output.id}" was not found.`,
      })
    }
    if (!battleWithPosts.instagramPosts.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsed.output.id}" has no recent Instagram posts to be analyzed.`,
      })
    }

    const storage = useStorage('images')
    const openRouterClient = useOpenRouter()
    await Promise.all(
      battleWithPosts.instagramPosts.map(async (post) => {
        const battleId = battleWithPosts.id
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
        const requestBody: Request = {
          model: modelToUse,
          messages: [
            systemPrompt,
            {
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
          ],
          provider: {
            order: [
              'Together',
            ],
            allow_fallbacks: false,
          },
          stream: false,
          max_tokens: 250,
          temperature: 0.1,
          top_p: 0.1,
          top_k: 10,
          frequency_penalty: 0,
          presence_penalty: 0,
          repetition_penalty: 1.1,
        }

        const completionsEndpoint: Endpoints = '/chat/completions' as const
        const completionsResponse = await openRouterClient<Responses[typeof completionsEndpoint]>(completionsEndpoint, {
          method: 'POST',
          body: requestBody,
        })

        await sleep(3000)

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
            rhymeBattleId: parsed.output.id,
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

        const parsedLine = parseLine({ rawLine: choice.message.content, postDate: post.timestamp })

        await db.insert(postAnalysesTable).values({
          id: completionsResponse.id,
          instagramPostId: post.id,
          rhymeBattleId: parsed.output.id,
          model: completionsResponse.model,
          provider: completionsResponse.provider,
          nativeTokensPrompt: generationResponse.data.native_tokens_prompt,
          nativeTokensCompletion: generationResponse.data.native_tokens_completion,
          totalCost: generationResponseData.total_cost,
          generationTime: generationResponseData.generation_time,
          latency: generationResponseData.latency,
          rawContent: parsedLine.rawLine,
          parsedContent: parsedLine.result,
          errors: parsedLine.errors,
        })
      }),
    )
    return sendNoContent(event)
  },
)
