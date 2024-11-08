import type { StorageManagerOptions } from 'crawlee'
import { MemoryStorage } from '@crawlee/memory-storage'
import { RequestQueue } from 'crawlee'

interface UseRequestQueueParams {
  queueIdOrName?: string | null
  options?: StorageManagerOptions
}

export async function useRequestQueue(params?: UseRequestQueueParams) {
  return RequestQueue.open(params?.queueIdOrName, params?.options)
}

// For some reason, this doesn't change the localDataDirectory. It only works applying at crawlee.json.
// const memoryStorage = new MemoryStorage({ persistStorage: false, writeMetadata: false, localDataDirectory: './server/storage/' })
// export async function useRequestQueue(params?: UseRequestQueueParams) {
//   return RequestQueue.open(params?.queueIdOrName, { ...params?.options, storageClient: memoryStorage })
// }
