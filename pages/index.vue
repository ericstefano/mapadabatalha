<script lang="ts" setup>
import type { LngLatLike } from 'maplibre-gl'
import { HORIZON_PITCH, MAX_ZOOM } from '~/constants'

const { data: battles, status } = await useFetch('/api/rhyme-battles/points') // await aqui faz a página esperar a requisição carregar
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const urlParams = useUrlSearchParams()
const active = ref<string | null>(null)
const open = computed(() => Boolean(active.value))
const mapProps = computed(() => {
  const base = {
    onMove: calculateClusters,
    onLoad: calculateClusters,
  }
  const found = battles.value?.find(({ id }) => id === urlParams.id)
  if (!found) {
    return base
  }

  return {
    ...base,
    center: found.geometry.coordinates as LngLatLike,
    zoom: MAX_ZOOM,
    pitch: HORIZON_PITCH,
  }
})

function clearActive() {
  active.value = null
}

onMounted(() => {
  if (status.value === 'success' && battles.value && battles.value.length) {
    loadPoints(battles.value)
  }
  else {
    loadPoints([])
  }
})

// watch(status, () => {
//   if (status.value === 'success' && battles.value && battles.value.length) {
//     loadPoints(battles.value)
//   }
//   else {
//     loadPoints([])
//   }
// }, {
//   immediate: true,
//   deep: true,
// })
</script>

<template>
  <div v-if="status !== 'pending'" class="h-screen">
    <Map v-bind="mapProps" />
    <template v-for="point in clusters" :key="point.id">
      <EntityMarker
        v-if="!point.properties?.cluster" :id="point.id" v-model:active="active"
        :coordinates="point.geometry.coordinates"
      />
      <ClusterMarker
        v-if="point.properties?.cluster" :count="point.properties.point_count"
        :zoom="supercluster.getClusterExpansionZoom(point.id)" :coordinates="point.geometry.coordinates"
      />
    </template>
    <Drawer v-if="!isDesktop" :open="open" @release="clearActive">
      <DrawerContent class="h-[450px]" @interact-outside="clearActive" @escape-key-down="clearActive">
        <div class="mx-auto w-full max-w-xl px-6 h-[250px]">
          <RhymeBattleInfo v-model:active="active" />
        </div>
      </DrawerContent>
    </Drawer>
    <Sheet v-if="isDesktop" :open="open" @update:open="clearActive">
      <SheetContent side="right">
        <RhymeBattleInfo v-model:active="active" />
      </SheetContent>
    </Sheet>
  </div>
</template>
