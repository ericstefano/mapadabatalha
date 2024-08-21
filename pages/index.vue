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
  <div v-if="status !== 'pending'" class="h-screen">
    <Map :on-move="calculateClusters" :on-load="calculateClusters"></Map>
    <template v-for="cluster in clusters" :key="cluster.id">
      <BattleMarker v-if="!cluster.properties.cluster" :coordinates="cluster.geometry.coordinates" />
      <ClusterMarker v-if="cluster.properties.cluster" :coordinates="cluster.geometry.coordinates"
        :count="cluster.properties.point_count" :zoom="supercluster.getClusterExpansionZoom(cluster.id)" />
    </template>
  </div>
</template>
