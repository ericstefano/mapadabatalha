<script setup lang='ts'>
import 'maplibre-gl/dist/maplibre-gl.css'
import type { initializeMapOptions } from '~/composables/map'

const { onMove, onLoad } = defineProps<Pick<initializeMapOptions, 'onMove' | 'onLoad'>>()

const { short } = useLanguage()
const mapRef = shallowRef<HTMLElement | null>(null)
const { initializeMap, terminateMap, loaded, setLanguage } = useMap()
const language = ref(`name:${short.value}`)

onMounted(() => {
  initializeMap({ language: language.value, onLoad, onMove, ref: mapRef })
})
onUnmounted(() => {
  terminateMap()
})
</script>

<template>
  <div class="relative h-full w-full" :class="{ invisible: !loaded }">
    <div ref="mapRef" class="absolute h-full w-full"></div>
    <slot></slot>
  </div>
</template>
