<script lang="ts" setup>
const { data: battles, status } = await useFetch('/api/rhymeBattles/getAllPoints')
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
      <DrawerContent @interact-outside="clearActive" @escape-key-down="clearActive">
        <div class="mx-auto w-full max-w-sm h-[250px]">
          <DrawerHeader>
            <DrawerTitle>{{ battles?.find((battle) => battle.id === active)?.properties }}</DrawerTitle>
            <DrawerDescription>Detalhes da Batalha</DrawerDescription>
          </DrawerHeader>
        </div>
        <RhymeBattleInfo :id="active" />
      </DrawerContent>
    </Drawer>
    <Sheet v-if="isDesktop" :open="open" @update:open="clearActive">
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{{ battles?.find((battle) => battle.id === active)?.properties }}</SheetTitle>
          <SheetDescription>
            Detalhes da batalha
          </SheetDescription>
        </SheetHeader>
        <RhymeBattleInfo :id="active" />
      </SheetContent>
    </Sheet>
  </div>
</template>
