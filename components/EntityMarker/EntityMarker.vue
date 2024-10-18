<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

const { coordinates, id } = defineProps<EntityMarkerProps>()
const RENDER_ANIMATION_DELAY_MS = 50
const MAX_ZOOM = 17.5

interface EntityMarkerProps {
  coordinates: LngLatLike
  id: string
}

const active = defineModel<string | null>('active', {
  required: true,
})
const markerRef = shallowRef<HTMLElement | null>(null)

const { getZoom, flyTo, startRotateAround, stopRotateAround, loaded } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

async function setActive() {
  active.value === id ? active.value = null : active.value = id
}

async function handleClick() {
  await setActive()
  if (active.value) {
    setTimeout(() => {
      const currentZoom = getZoom() ?? MAX_ZOOM
      if (currentZoom < MAX_ZOOM)
        flyTo({ center: coordinates, zoom: MAX_ZOOM, speed: 1.5, pitch: 85 })
      else
        flyTo({ center: coordinates, speed: 1.5 })
      startRotateAround()
    }, RENDER_ANIMATION_DELAY_MS)
  }
}

watchEffect(() => {
  if (active.value !== id) {
    stopRotateAround()
  }
})

onMounted(() => {
  initializeMarker({ latAndLong: coordinates, ref: markerRef })
})

onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <!-- <img
    v-show="loaded && coordinates" ref="markerRef"
    :src="`/posts/${id}/profile.jpeg`"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full text-lg shadow-xl drop-shadow-xl"
    @click="handleClick"
  > -->

  <div
    v-show="loaded && coordinates" ref="markerRef"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full text-lg shadow-xl drop-shadow-xl bg-blue-600"
    @click="handleClick"
  />
</template>
