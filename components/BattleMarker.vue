<script setup lang="ts">
const RENDER_ANIMATION_DELAY_MS = 50;
const MAX_ZOOM = 17.5
import type { LngLatLike } from 'maplibre-gl';

interface BattleMarkerProps {
  coordinates: LngLatLike
  id: string;
}

const props = defineProps<BattleMarkerProps>()
const active = defineModel<string | null>('active', {
  required: true
})
const markerRef = shallowRef<HTMLElement | null>(null)

const { getZoom, flyTo, startRotateAround, stopRotateAround, loaded } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

async function setActive() {
  active.value === props.id ? active.value = null : active.value = props.id
}

async function handleClick() {
  await setActive()
  if (active.value) {
    setTimeout(() => {
      const currentZoom = getZoom() ?? MAX_ZOOM
      if (currentZoom < MAX_ZOOM)
        flyTo({ center: props.coordinates, zoom: MAX_ZOOM, speed: 1.5, pitch: 85 })
      else
        flyTo({ center: props.coordinates, speed: 1.5 })
      startRotateAround()
    }, RENDER_ANIMATION_DELAY_MS)
  }
}

watchEffect(() => {
  if (active.value !== props.id) {
    stopRotateAround();
  }
})

onMounted(() => {
  initializeMarker({ latAndLong: props.coordinates, ref: markerRef })
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
