import type { BBox } from 'geojson'
import type { MapLibreEvent } from 'maplibre-gl'
import Supercluster from 'supercluster'

export function useCluster() {
  const supercluster = new Supercluster({ radius: 50, maxZoom: 16 })
  const clusters = useState(() => shallowRef<(Supercluster.PointFeature<Supercluster.AnyProps> | Supercluster.ClusterFeature<Supercluster.AnyProps>)[]>([]))

  function calculateClusters(event: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | unknown | undefined>) {
    const bounds = event.target.getBounds().toArray().flat() as BBox
    const zoom = event.target.getZoom()
    clusters.value = supercluster.getClusters(bounds, zoom)
  }

  function loadPoints(points: Supercluster.PointFeature<Supercluster.AnyProps>[]) {
    supercluster.load(points)
  }

  return { clusters, supercluster, calculateClusters, loadPoints }
}
