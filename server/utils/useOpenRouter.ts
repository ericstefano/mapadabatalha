import { OPEN_ROUTER_BASE_URL } from '~/constants'
import type { Message, Request } from '~/types/openrouter'

export function useOpenRouter() {
  const { openRouterAuthToken } = useRuntimeConfig()
  if (!openRouterAuthToken)
    throw new Error('Missing \'NUXT_OPEN_ROUTER_AUTH_TOKEN\' in .env')
  const client = $fetch.create<unknown, Endpoints>({
    baseURL: OPEN_ROUTER_BASE_URL,
    headers: {
      'Authorization': `Bearer ${openRouterAuthToken}`,
      'Content-Type': 'application/json',
    },
  })
  return client
}

interface UseOpenRouterRequestBodyParams {
  model: string
  systemPrompt: {
    role: 'system'
    content: string
  }
  userPrompt: Message

}
export function useOpenRouterRequestBody({ model, systemPrompt, userPrompt }: UseOpenRouterRequestBodyParams) {
  const requestBody: Request = {
    model,
    messages: [
      systemPrompt,
      userPrompt,
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
  return requestBody
}
