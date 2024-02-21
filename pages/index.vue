<script lang="ts" setup>
import type { AnyProps, PointFeature } from 'supercluster'

const { data: points, pending } = await useFetch<PointFeature<AnyProps>[]>('http://localhost:3001/points')
const { clusters, calculateClusters, supercluster } = useCluster({ points: points.value })
</script>

<template>
  <Map :on-move="calculateClusters" :on-load="calculateClusters" />
  <template v-if="!pending && clusters && clusters.length">
    <template v-for="cluster in clusters" :key="cluster.id">
      <Marker
        v-if="!cluster.properties.cluster"
        :lat-and-long="cluster.geometry.coordinates"
      />
      <ClusterMarker v-if="cluster.properties.cluster" :lat-and-long="cluster.geometry.coordinates" :count="cluster.properties.point_count" :zoom="supercluster.getClusterExpansionZoom(cluster.id)" />
    </template>
  </template>
  <!-- <div class="fixed left-1/2 top-0 h-full w-px transform bg-sky-600 -translate-x-1/2" /> -->
</template>
