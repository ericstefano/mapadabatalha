import { KeyValueStore } from 'crawlee'

interface UseKeyValueStoreParams {
  name: string
}

export async function useKeyValueStore({ name }: UseKeyValueStoreParams) {
  return KeyValueStore.open(name)
}
