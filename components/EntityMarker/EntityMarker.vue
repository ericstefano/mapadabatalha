<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'
import { HORIZON_PITCH, MAX_ZOOM } from '~/constants'

const props = defineProps<EntityMarkerProps>()
const emits = defineEmits<{
  'update:active': [active: string | null]
}>()
const RENDER_ANIMATION_DELAY_MS = 200
// const RENDER_ANIMATION_DELAY_MS = 200 + 50

interface EntityMarkerProps {
  coordinates: LngLatLike
  id: string
  active: string | null
}

const markerRef = shallowRef<HTMLElement | null>(null)
const urlParams = useUrlSearchParams()

const active = useVModel(props, 'active', emits, {
  passive: true,
})

const { getZoom, flyTo, startRotateAround, stopRotateAround, loaded } = useMap()
const { initializeMarker, terminateMarker } = useMarker()

function goToMarker() {
  setTimeout(() => {
    const currentZoom = getZoom() ?? MAX_ZOOM
    if (currentZoom < MAX_ZOOM)
      flyTo({ center: props.coordinates, zoom: MAX_ZOOM, speed: 1.5, pitch: HORIZON_PITCH })
    else
      flyTo({ center: props.coordinates, speed: 1.5 })
    startRotateAround()
  }, RENDER_ANIMATION_DELAY_MS)
}

async function toggleActive() {
  active.value === props.id ? active.value = null : active.value = props.id
}

async function handleClick() {
  toggleActive()
  if (active.value) {
    urlParams.id = active.value
    goToMarker()
  }
}

function handleMount() {
  initializeMarker({ latAndLong: props.coordinates, ref: markerRef })
  if (urlParams.id === props.id) {
    active.value = props.id
    goToMarker()
  }
}

watch(active, () => {
  if (active.value !== props.id) {
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
