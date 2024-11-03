import type { FlyToOptions, LngLatBoundsLike, LngLatLike, MapLibreEvent, Marker } from 'maplibre-gl'
import type { ShallowRef } from 'vue'
import { GeolocateControl, Map, NavigationControl } from 'maplibre-gl'

const BRAZIL_CENTER_COORDINATES: LngLatLike = [-43.93420430483323, -19.91665382890247]
const BRAZIL_MAX_BOUNDS: LngLatBoundsLike = [
  [-76, -36],
  [-23.60, 8],
]

// Languages:
// https://github.com/maptiler/maptiler-sdk-js/blob/main/src/language.ts#L4
// name:pt
// name:ja

export interface initializeMapOptions {
  onLoad?: (event: MapLibreEvent<unknown>) => void
  onMove?: (event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => void
  language?: string
  center?: LngLatLike
  zoom?: number
  pitch?: number
  maxBounds?: LngLatBoundsLike
  ref: ShallowRef<HTMLElement | null> | Ref<HTMLElement | null>
}

export function useMap() {
  const map = useState(() => shallowRef<Map | null>(null))
  const loaded = useState(() => false)
  const bearing = ref(map.value?.getBearing() ?? 0)
  const speed = ref(0.08)
  const direction = ref(-1)
  const rotateAroundBearing = computed(() => bearing.value + (speed.value) * direction.value)

  const { resume, pause, isActive } = useRafFn(() => {
    if (map.value?.isMoving())
      return
    map.value?.rotateTo(rotateAroundBearing.value, { duration: 0 })
  }, { immediate: false })

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
    map.value?.setCenter(value)
  }

  function addMarker(marker: Marker) {
    if (map.value)
      marker.addTo(map.value)
  }

  function flyTo(options: FlyToOptions) {
    map.value?.flyTo(options)
  }

  function getZoom() {
    return map.value?.getZoom()
  }

  function startRotateAround(options: { speed?: number, direction?: 1 | -1 } = {}) {
    if (options.direction)
      direction.value = options.direction

    if (options.speed)
      speed.value = options.speed

    resume()
  }

  function stopRotateAround() {
    pause()
  }

  function handleMapLoad(language: string) {
    return () => {
      setLanguage(language)
    }
  }

  const { public: {
    maptilerKey,
  } } = useRuntimeConfig()

  function initializeMap(options: initializeMapOptions) {
    const { ref, onLoad, onMove, center = BRAZIL_CENTER_COORDINATES, zoom = 1, pitch = 0, language = 'visitor', maxBounds = BRAZIL_MAX_BOUNDS } = options

    map.value = markRaw(new Map({
      container: ref.value!,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`,
      center,
      zoom,
      pitch,
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

    // map.value.addControl(new FullscreenControl())
    map.value.addControl(new NavigationControl())
    map.value.addControl(new GeolocateControl({
      trackUserLocation: true,
      positionOptions: {
        enableHighAccuracy: true,
      },
      showAccuracyCircle: false,
    }))
  }

  function terminateMap() {
    map.value?.remove()
  }

  map.value?.on('rotate', (event) => {
    bearing.value = event.target.getBearing()
  })

  map.value?.on('mousedown', (event) => {
    if (isActive.value && (event.originalEvent.button === 0 || event.originalEvent.button === 2))
      pause()
  })

  map.value?.on('touchstart', () => {
    if (isActive.value)
      pause()
  })

  map.value?.on('zoomstart', () => {
    if (isActive.value)
      pause()
  })

  return { map, initializeMap, terminateMap, loaded, setLanguage, setCenter, addMarker, flyTo, startRotateAround, stopRotateAround, getZoom }
}
