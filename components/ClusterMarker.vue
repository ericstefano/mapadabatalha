<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

interface ClusterMarkerProps {
  latAndLong: LngLatLike
  count: number
  zoom: number
}

const { latAndLong } = defineProps<ClusterMarkerProps>()

const { map } = useMap()
const { initializeMarker, terminateMarker, markerRef } = useMarker()

onMounted(() => {
  initializeMarker({ latAndLong })
})
onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <div
    ref="markerRef" h-12 w-12 flex cursor-pointer items-center justify-center rounded-full bg-red-600 text-lg shadow-lg
    @click="() => map?.flyTo({ zoom, center: latAndLong, speed: 3 })"
  >
    {{ count }}
  </div>
</template>
