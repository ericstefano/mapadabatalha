<script lang="ts" setup>
import type { AnyProps, PointFeature } from 'supercluster';
interface Battle {
  name: string
  instagram: string
  id: string
  lat: number
  lon: number
}

const { data: battles, status } = await useFetch<Battle[]>('http://localhost:3000/battles', { server: true })
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()
const active = ref<string | null>(null)

watchEffect(() => {
  if (status.value === 'success' && battles.value) {
    const fromBattlesToPoints: PointFeature<AnyProps>[] = battles.value.map(value => ({
      type: 'Feature',
      properties: {
        cluster: false,
        name: value.name,
        instagram: value.instagram
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.lon,
          value.lat,
        ],
      },
      id: value.id,
    }))
    loadPoints(fromBattlesToPoints)
  } else {
    loadPoints([])
  }
})

</script>

<template>
  <div v-if="status !== 'pending'" class="h-screen" :class="{ 'grid grid-rows-2': active !== null }">
    <Map :on-move="calculateClusters" :on-load="calculateClusters"></Map>
    <template v-for="point in clusters" :key="point.id">
      <BattleMarker v-if="!point.properties?.cluster" :id="point.id" :coordinates="point.geometry.coordinates" v-model:active="active" />
      <ClusterMarker v-if="point.properties?.cluster" :coordinates="point.geometry.coordinates"
        :count="point.properties.point_count" :zoom="supercluster.getClusterExpansionZoom(point.id)" />
    </template>
    <div class="flex justify-center items-center text-lg px-12  flex-col" v-if="active !== null">
      <button class="mb-4 rounded-lg font-sans bg-red-500 py-2 px-4 text-white" @click="() => active = null">Fechar</button>
      <p class="font-mono">{{ battles?.find((battle) => battle.id === active) }}</p>
    </div>
  </div>
</template>
