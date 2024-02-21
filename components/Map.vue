<script setup lang='ts'>
import 'maplibre-gl/dist/maplibre-gl.css'
import type { initializeMapOptions } from '~/composables/map'

const { onMove, onLoad } = defineProps<initializeMapOptions>()

const { short } = useLanguage()
// const { coords, pause } = useGeolocation({ immediate: false, enableHighAccuracy: true })

const { mapRef, initializeMap, terminateMap, loaded, setLanguage } = useMap()
const language = ref(`name:${short.value}`)

onMounted(() => {
  initializeMap({ language: language.value, center: [-43.93420430483323, -19.91665382890247], onLoad, onMove })
})
onUnmounted(() => {
  terminateMap()
})
// watchOnce(coords, () => {
//   setCenter([coords.value.longitude, coords.value.latitude])
//   pause()
// })
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
        // console.log(language);
      }"
    >
      test
    </button>
  </div>
</template>
