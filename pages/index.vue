<script lang="ts" setup>
import type { LngLatLike } from 'maplibre-gl'
import type { AnyProps, PointFeature } from 'supercluster'

const { data: points, pending, status } = await useFetch<PointFeature<AnyProps>[]>('http://localhost:3001/points', { server: true })
const { clusters, calculateClusters, supercluster, loadPoints } = useCluster()

watchEffect(() => {
  if (status.value === 'success')
    loadPoints(points.value)
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
