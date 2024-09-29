<script lang="ts" setup>
const { data: battles, status } = await useFetch('/api/battles/getAllPoints')
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const isDesktop = useMediaQuery('(min-width: 768px)')
const active = ref<string | null>(null)
const open = computed(() => Boolean(active.value))

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
        v-if="point.properties?.cluster" :coordinates="point.geometry.coordinates"
        :count="point.properties.point_count" :zoom="supercluster.getClusterExpansionZoom(point.id)"
      />
    </template>
    <Drawer v-if="!isDesktop" :open="open">
      <DrawerContent @interact-outside="active = null" @escape-key-down="active = null">
        <div class="mx-auto w-full max-w-sm h-[350px]">
          <DrawerHeader>
            <DrawerTitle>{{ battles?.find((battle) => battle.id === active)?.properties }}</DrawerTitle>
            <DrawerDescription>Detalhes da Batalha</DrawerDescription>
          </DrawerHeader>
        </div>
      </DrawerContent>
    </Drawer>
    <Sheet v-if="isDesktop" :open="open" @update:open="active = null">
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{{ battles?.find((battle) => battle.id === active)?.properties }}</SheetTitle>
          <SheetDescription>
            Detalhes da batalha
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  </div>
</template>
