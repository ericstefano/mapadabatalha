<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

interface MarkerProps {
  latAndLong: LngLatLike
}

const { latAndLong } = defineProps<MarkerProps>()

const { map, loaded } = useMap()
const { initializeMarker, terminateMarker, markerRef, markers } = useMarker()

const bearing = ref(map.value?.getBearing())
const timestamp = ref(0)
const direction = -1 // 1 = left, -1 = right
const speed = 12
const { resume, pause, isActive } = useRafFn(() => {
  if (!map.value?.isMoving()) {
    const calc = (((timestamp.value * speed) / 100) % 360) - 180
    map.value?.rotateTo(calc * direction, { duration: 0 })
    timestamp.value++
  }
}, { immediate: false })

map.value?.on('rotate', (event) => {
  console.log(bearing.value)
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

// map.value?.on('dragstart', () => {
//   if (!isActive.value)
//     pause()
// })

map.value?.on('zoomstart', () => {
  if (isActive.value)
    pause()
})
// map.value?.on('pitchstart', () => {
//   if (isActive.value)
//     pause()
// })

onMounted(() => {
  initializeMarker({ latAndLong })
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

      // Request the next frame of the animation.
      // requestAnimationFrame(rotateCamera);

    }"
  />
</template>
