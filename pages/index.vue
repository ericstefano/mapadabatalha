<script lang="ts" setup>
import type { LngLatLike } from 'maplibre-gl'
import { HORIZON_PITCH, MAX_ZOOM } from '~/constants'

const { data: battles, status } = await useFetch('/api/rhyme-battles/points') // await aqui faz a página esperar a requisição carregar
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const isDesktop = useMediaQuery('(min-width: 768px)')
const urlParams = useUrlSearchParams()
const active = ref<string | null>(null)
const open = computed(() => Boolean(active.value))
const mapProps = computed(() => {
  const base = {
    onMove: calculateClusters,
    onLoad: calculateClusters,
  }
  const found = battles.value?.data?.find(({ id }) => id === urlParams.id)
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
  if (status.value === 'success' && battles.value && battles.value.data && battles.value.data.length) {
    loadPoints(battles.value.data)
  }
  else {
    loadPoints([])
  }

  // #TODO: Healt-Check, remove it.
  setTimeout(async () => {
    const response = await $fetch('/api/health-check')
    console.log(response?.data)
  }, 66000)
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
    <!-- Made it not dismissible because of buggy behavior with scroll / carousel -->
    <Drawer v-if="!isDesktop" :open="open" :dismissible="false" @release="clearActive">
      <DrawerContent class="h-3/4 px-6 pb-6" @interact-outside="clearActive" @escape-key-down="clearActive" @open-auto-focus.prevent>
        <div class="mx-auto h-full max-w-2xl w-full">
          <RhymeBattleInfo v-model:active="active" />
        </div>
      </DrawerContent>
    </Drawer>

    <Sheet v-if="isDesktop" :open="open" @update:open="clearActive">
      <SheetContent side="left" @open-auto-focus.prevent>
        <RhymeBattleInfo v-model:active="active" />
      </SheetContent>
    </Sheet>
  </div>
</template>
