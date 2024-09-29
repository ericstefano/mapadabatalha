import type { LngLatLike } from 'maplibre-gl'
import type { ShallowRef } from 'vue'
import { Marker } from 'maplibre-gl'

interface initializeMarkerOptions {
  ref: ShallowRef<HTMLElement | null> | Ref<HTMLElement | null>
  latAndLong: LngLatLike
}

export function useMarker() {
  const { addMarker: addMarkerToMap } = useMap()
  const marker = shallowRef<Marker | null>(null)
  const markers = useState(() => shallowRef<Marker[]>([]))

  function initializeMarker(options: initializeMarkerOptions) {
    const { ref, latAndLong } = options
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
