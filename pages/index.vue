<script lang="ts" setup>
const { data: battles, status } = await useFetch('/api/battles/getAllPoints')
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const active = ref<string | null>(null)

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
  <div v-if="status !== 'pending'" class="h-screen" :class="{ 'grid grid-rows-2': active !== null }">
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
    <div v-if="active !== null" class="flex justify-center items-center text-lg px-12  flex-col">
      <p class="font-mono">
        {{ battles?.find((battle) => battle.id === active) }}
      </p>
      <button class="mt-4 rounded-lg font-sans bg-red-500 py-2 px-4 text-white" @click="() => active = null">
        Fechar
      </button>
    </div>
  </div>
</template>
