<script lang="ts" setup>
import type { LngLatLike } from 'maplibre-gl'
import type { AnyProps, PointFeature } from 'supercluster'

interface Battle {
  name: string
  instagram: string
  id: string
  lat: number
  lon: number
}

const { data: battles, status, pending } = await useFetch<Battle[]>('http://localhost:3030/battles', { server: true })
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()

watchEffect(() => {
  if (status.value === 'success' && battles.value) {
    const fromBattlesToPoints: PointFeature<AnyProps>[] = battles.value.map(value => ({
      type: 'Feature',
      properties: {
        cluster: false,
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
  }
})
</script>

<template>
  <div v-if="!pending">
    <Map :on-move="calculateClusters" :on-load="calculateClusters" />
    <template v-for="cluster in clusters" :key="cluster.id">
      <BattleMarker
        v-if="!cluster.properties.cluster"
        :lat-and-long="cluster.geometry.coordinates as LngLatLike"
      />
      <ClusterMarker v-if="cluster.properties.cluster" :lat-and-long="cluster.geometry.coordinates as LngLatLike" :count="cluster.properties.point_count" :zoom="supercluster.getClusterExpansionZoom(cluster.id)" />
    </template>
  </div>
</template>
