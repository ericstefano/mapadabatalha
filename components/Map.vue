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
  <div relative h-100dvh w-100dvw :class="{ invisible: !loaded }">
    <div ref="mapRef" absolute h-full w-full />
    <slot />
    <button
      h-12 w-12 rounded-full bg-red-500 @click="() => {
        const _lan = language === 'name:pt' ? 'name:ja' : 'name:pt'
        language = _lan;
        setLanguage(_lan);
      }"
    >
      test
    </button>
  </div>
</template>
