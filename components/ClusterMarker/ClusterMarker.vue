<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

interface ClusterMarkerProps {
  coordinates: LngLatLike
  count: number
  zoom: number
}

const { zoom, coordinates, count } = defineProps<ClusterMarkerProps>()
const markerRef = shallowRef<HTMLElement | null>(null)
const { flyTo } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

function handleClick() {
  flyTo({ zoom, center: coordinates, speed: 3 })
}

onMounted(() => {
  initializeMarker({ latAndLong: coordinates, ref: markerRef })
})

onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <div
    ref="markerRef"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-red-600 text-lg shadow-lg"
    @click="handleClick"
  >
    {{ count }}
  </div>
</template>
