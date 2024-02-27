import { FullscreenControl, GeolocateControl, Map, NavigationControl } from 'maplibre-gl'
import type { FlyToOptions, LngLatBoundsLike, LngLatLike, MapLibreEvent, Marker } from 'maplibre-gl'

// Languages:
// https://github.com/maptiler/maptiler-sdk-js/blob/main/src/language.ts#L4
// name:pt
// name:ja

export interface initializeMapOptions {
  onLoad?: (event: MapLibreEvent<unknown>) => void
  onMove?: (event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => void
  language?: string
  center?: LngLatLike
  maxBounds?: LngLatBoundsLike
}

export function useMap() {
  const map = useState(() => shallowRef<Map | null>(null))
  const mapRef = useState(() => shallowRef<HTMLElement | null>(null))
  const loaded = useState(() => false)

  function setLanguage(value: string) {
    const layers = map?.value?.getStyle().layers
    layers?.forEach(({ layout, id }) => {
      const textField = layout['text-field'] as string | Array<string>

      if (layout && Object.prototype.hasOwnProperty.call(layout, 'text-field')) {
        if (Array.isArray(textField)) {
          map.value?.setLayoutProperty(
            id,
            'text-field',
            ['coalesce', ['get', value], ['get', 'name']],
          )
        }
        else if (typeof textField === 'string' && textField.includes('name:')) {
          map.value?.setLayoutProperty(
            id,
            'text-field',
            `{${value}}`,
          )
        }
      }
    })
  }

  function setCenter(value: LngLatLike) {
    if (map.value)
      map.value.setCenter(value)
  }

  function handleMapLoad(language: string) {
    return () => {
      setLanguage(language)
    }
  }

  function addMarker(marker: Marker) {
    if (map.value)
      marker.addTo(map.value)
  }

  function flyTo(options: FlyToOptions) {
    if (map.value)
      map.value.flyTo(options)
  }

  function initializeMap(options: initializeMapOptions) {
    const { onLoad, onMove, center = [-43.93420430483323, -19.91665382890247], language = 'visitor', maxBounds = [
      [-76, -36],
      [-23.60, 8],
    ] } = options
    map.value = markRaw(new Map({
      container: mapRef.value!,
      // style: 'https://api.maptiler.com/maps/527155c9-29bf-4a29-b0f6-7f7d31386352/style.json?key=U2r8rW378rl0OijWPkJB',
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=U2r8rW378rl0OijWPkJB',
      center,
      // zoom: 4.5,
      zoom: 1,
      // pitch: 85,
      antialias: true,
      maxBounds,
    }))

    map.value.once('load', handleMapLoad(language))

    map.value.once('idle', () => {
      loaded.value = true
    })

    if (onLoad)
      map.value.on('load', onLoad)

    if (onMove)
      map.value.on('move', onMove)

    map.value.addControl(new FullscreenControl())
    map.value.addControl(new NavigationControl(), 'top-right')
    map.value.addControl(new GeolocateControl({
      trackUserLocation: true,
      positionOptions: {
        enableHighAccuracy: true,
      },
    }))
  }

  function terminateMap() {
    map.value?.remove()
  }

  return { map, mapRef, initializeMap, terminateMap, loaded, setLanguage, setCenter, addMarker, flyTo }
}
