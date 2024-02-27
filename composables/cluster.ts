import type { MapLibreEvent } from 'maplibre-gl'
import Supercluster, { type AnyProps, type ClusterFeature, type PointFeature } from 'supercluster'
import type { BBox } from 'geojson'

const supercluster = new Supercluster({ radius: 50, maxZoom: 16 })
export function useCluster() {
  const clusters = useState(() => shallowRef<(PointFeature<AnyProps> | ClusterFeature<AnyProps>)[]>([]))

  function calculateClusters(event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | unknown | undefined>) {
    const bounds = event.target.getBounds().toArray().flat() as BBox
    const zoom = event.target.getZoom()
    clusters.value = supercluster.getClusters(bounds, zoom)
  }

  function loadPoints(points: PointFeature<AnyProps>[] | null) {
    supercluster.load(points!)
  }

  return { clusters, supercluster, calculateClusters, loadPoints }
}
