import { Marker } from 'maplibre-gl'
import type { LngLatLike } from 'maplibre-gl'
import type { ShallowRef } from 'nuxt/dist/app/compat/capi'

export function useMarker() {
  const { addMarker: addMarkerToMap } = useMap()
  const marker = shallowRef<Marker | null>(null)
  const markers = useState(() => shallowRef<Marker[]>([]))

  function initializeMarker({ latAndLong, ref }: { ref: ShallowRef<HTMLElement | null> | Ref<HTMLElement | null>, latAndLong: LngLatLike }) {
    if (!ref.value)
      throw new Error('\'markerRef\' must be a HTMLElement')

    const instance = new Marker({ element: ref.value })
    instance.setLngLat(latAndLong)
    addMarkerToMap(instance)
    marker.value = markRaw(instance)
    markers.value = [...markers.value, instance]
  }

  function terminateMarker() {
    if (!marker.value)
      return

    markers.value = markers.value.filter(element => element !== marker.value)
    marker.value.remove()
  }

  return { marker, markers, initializeMarker, terminateMarker }
}
