<script setup lang='ts'>
import type { initializeMapOptions } from '~/composables/useMap'
import 'maplibre-gl/dist/maplibre-gl.css'

const { onMove, onLoad, center, zoom, pitch } = defineProps<Pick<initializeMapOptions, 'onMove' | 'onLoad' | 'center' | 'zoom' | 'pitch'>>()
const { short } = useLanguage()
const mapRef = shallowRef<HTMLElement | null>(null)
const { initializeMap, terminateMap, loaded } = useMap()
const language = ref(`name:${short.value}`)

onMounted(() => {
  initializeMap({ language: language.value, onLoad, onMove, ref: mapRef, center, zoom, pitch })
})
onUnmounted(() => {
  terminateMap()
})
</script>

<template>
  <div class="relative h-full w-full" :class="{ invisible: !loaded }">
    <div class="absolute flex flex-col right-[10px] top-[146px] z-30">
      <NuxtLink to="/manage" custom>
        <template #default="{ navigate }">
          <Button
            variant="default"
            size="icon" class="w-[29px] h-[29px] p-[5px] shadow-maplibre text-[30px] leading-[36px]"
            @click="navigate"
          >
            <Icon class="text-primary-foreground" name="lucide:table-properties" />
          </Button>
        </template>
      </NuxtLink>
    </div>
    <div ref="mapRef" class="absolute h-full w-full" />
    <slot />
  </div>
</template>
