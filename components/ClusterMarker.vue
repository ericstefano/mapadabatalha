<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

interface ClusterMarkerProps {
  latAndLong: LngLatLike
  count: number
  zoom: number
}
const { latAndLong } = defineProps<ClusterMarkerProps>()

const { flyTo } = useMap()
const markerRef = shallowRef<HTMLElement | null>(null)
const { initializeMarker, terminateMarker } = useMarker()

onMounted(() => {
  initializeMarker({ latAndLong, ref: markerRef })
})
onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <div
    ref="markerRef" z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-red-600 text-lg shadow-lg
    @click="() => flyTo({ zoom, center: latAndLong, speed: 3 })"
  >
    {{ count }}
  </div>
</template>
