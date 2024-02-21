import { Marker } from 'maplibre-gl'
import type { LngLatLike } from 'maplibre-gl'

export function useMarker() {
  const { addMarker: addMarkerToMap } = useMap()
  const marker = shallowRef<Marker | null>(null)
  const markerRef = shallowRef<HTMLElement | null>(null)
  const markers = useState(() => shallowRef<Marker[]>([]))

  function initializeMarker({ latAndLong }: { latAndLong: LngLatLike }) {
    if (!markerRef.value)
      throw new Error('\'markerRef\' must be a HTMLElement')

    const instance = new Marker({ element: markerRef.value })
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

  return { marker, markers, markerRef, initializeMarker, terminateMarker }
}
