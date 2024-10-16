<script lang="ts" setup>
const { data: battles, status } = await useFetch('/api/rhyme-battles/points') // await aqui faz a página esperar a requisição carregar
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const isDesktop = useMediaQuery('(min-width: 1024px)')
const active = ref<string | null>(null)
const open = computed(() => Boolean(active.value))
function clearActive() {
  active.value = null
}

watchEffect(() => {
  if (status.value === 'success' && battles.value && battles.value.length) {
    loadPoints(battles.value)
  }
  else {
    loadPoints([])
  }
})
</script>

<template>
  <div v-if="status !== 'pending'" class="h-screen">
    <Map :on-move="calculateClusters" :on-load="calculateClusters" />
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
          <RhymeBattleInfo :id="active" />
        </div>
      </DrawerContent>
    </Drawer>
    <Sheet v-if="isDesktop" :open="open" @update:open="clearActive">
      <SheetContent side="right">
        <RhymeBattleInfo :id="active" />
      </SheetContent>
    </Sheet>
  </div>
</template>
