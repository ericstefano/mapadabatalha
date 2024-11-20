import { OPEN_ROUTER_BASE_URL } from "~/constants"

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
