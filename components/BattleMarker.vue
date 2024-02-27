<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

interface BattleMarkerProps {
  latAndLong: LngLatLike
}

const { latAndLong } = defineProps<BattleMarkerProps>()

const { map, loaded } = useMap()
const markerRef = shallowRef<HTMLElement | null>(null)
const { initializeMarker, terminateMarker, markers } = useMarker()

const speed = 0.12
const direction = -1 // 1 = left, -1 = right
const bearing = ref(map.value?.getBearing() ?? 0)
const { resume, pause, isActive } = useRafFn(() => {
  if (!map.value?.isMoving())
    map.value?.rotateTo(bearing.value + (speed) * direction, { duration: 0 })
}, { immediate: false })

map.value?.on('rotate', (event) => {
  bearing.value = event.target.getBearing()
})

map.value?.on('mousedown', (event) => {
  if (isActive.value && event.originalEvent.button === 0 || event.originalEvent.button === 2)
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

onMounted(() => {
  initializeMarker({ latAndLong, ref: markerRef })
})
onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <div
    v-show="loaded && latAndLong"
    ref="markerRef" h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-sky-600 text-lg shadow-lg @click="() => {

      const currentZoom = map?.getZoom();
      const maxZoom = 17.5;

      if (currentZoom < maxZoom) {
        map?.flyTo({ center: latAndLong, zoom: maxZoom, speed: 1.5, pitch: 85 })
      }
      else {
        map?.flyTo({ center: latAndLong, speed: 1.5, pitch: 85 })
      }

      resume();

    }"
  />
</template>
