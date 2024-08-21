<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl';

interface BattleMarkerProps {
  coordinates: LngLatLike
}

const { coordinates } = defineProps<BattleMarkerProps>()
const markerRef = shallowRef<HTMLElement | null>(null)
const active = ref(false)
const { getZoom, flyTo, startRotateAround, stopRotateAround, loaded } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

function handleClick() {
  active.value = !active.value
  const maxZoom = 17.5
  const currentZoom = getZoom() ?? maxZoom

  if (currentZoom < maxZoom)
    flyTo({ center: coordinates, zoom: maxZoom, speed: 1.5, pitch: 85 })
  else
    flyTo({ center: coordinates, speed: 1.5 })

  // prototype
  if (active.value)
    startRotateAround()
  else
    stopRotateAround()
  // end of prototype
}

onMounted(() => {
  initializeMarker({ latAndLong: coordinates, ref: markerRef })
})

onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <div v-show="loaded && coordinates" ref="markerRef"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-sky-600 text-lg shadow-lg"
    @click="handleClick"></div>
</template>
