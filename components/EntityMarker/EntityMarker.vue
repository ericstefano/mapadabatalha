<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'
import { HORIZON_PITCH, MAX_ZOOM } from '~/constants';

const { coordinates, id } = defineProps<EntityMarkerProps>()
const RENDER_ANIMATION_DELAY_MS = 50

interface EntityMarkerProps {
  coordinates: LngLatLike
  id: string
}

const active = defineModel<string | null>('active', {
  required: true,
})
const markerRef = shallowRef<HTMLElement | null>(null)
const urlParams = useUrlSearchParams()

const { getZoom, flyTo, startRotateAround, stopRotateAround, loaded } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

function goToMarker() {
  setTimeout(() => {
    const currentZoom = getZoom() ?? MAX_ZOOM
    if (currentZoom < MAX_ZOOM)
      flyTo({ center: coordinates, zoom: MAX_ZOOM, speed: 1.5, pitch: HORIZON_PITCH })
    else
      flyTo({ center: coordinates, speed: 1.5 })
    startRotateAround()
  }, RENDER_ANIMATION_DELAY_MS)
}

async function toggleActive() {
  active.value === id ? active.value = null : active.value = id
}

async function handleClick() {
  await toggleActive()
  if (active.value) {
    urlParams.id = active.value
    goToMarker()
  }
}

function handleMount() {
  initializeMarker({ latAndLong: coordinates, ref: markerRef })
  if (urlParams.id === id) {
    active.value = id
    goToMarker()
  }
}

watch(active, () => {
  if (active.value !== id) {
    stopRotateAround()
    delete urlParams.id
  }
})

onMounted(() => {
  handleMount()
})

onUnmounted(() => {
  terminateMarker()
})
</script>

<template>
  <!-- <img
    v-show="loaded && coordinates" ref="markerRef"
    :src="`/${id}/profile.jpeg`"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full text-lg shadow-xl drop-shadow-xl"
    @click="handleClick"
    @error="handleImageError"
  > -->

  <div
    v-show="loaded && coordinates" ref="markerRef"
    class="z-10 h-12 w-12 flex cursor-pointer items-center justify-center rounded-full text-lg shadow-xl drop-shadow-xl bg-blue-600"
    @click="handleClick"
  />
</template>
