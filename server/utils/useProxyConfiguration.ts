import { ProxyConfiguration } from 'crawlee'

interface UseProxyConfigurationParams {
  proxyUrls: string[]
}
export function useProxyConfiguration({ proxyUrls }: UseProxyConfigurationParams) {
  return new ProxyConfiguration({
    proxyUrls,
  })
}
