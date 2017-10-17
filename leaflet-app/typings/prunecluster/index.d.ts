/// <reference types="leaflet" />
declare module PruneCluster {
	interface Position {
		lat: number;
		lng: number;
	}
	class Point {
		public x: number;
		public y: number;
	}
	interface Bounds {
		minLat: number;
		maxLat: number;
		minLng: number;
		maxLng: number;
	}
	class ClusterObject {
		public position: Position;
		public data: any;
	}
	class Marker extends ClusterObject {
		public category: number|string;
		public weight: number;
		public filtered: boolean;
		constructor(lat: number, lng: number, data?: {}, category?: number|string, weight?: number, filtered?: boolean);
		public Move(lat: number, lng: number): void;
	}
	class Cluster extends ClusterObject {
		public bounds: Bounds;
		public population: number;
		public averagePosition: Position;
		public stats: number[];
		public totalWeight: number;
		public lastMarker: Marker;
		private _clusterMarkers;
		static ENABLE_MARKERS_LIST: boolean;
		constructor(marker?: Marker);
		public AddMarker(marker: Marker): void;
		public Reset(): void;
		public ComputeBounds(cluster: PruneCluster): void;
		public GetClusterMarkers(): Marker[];
		public ApplyCluster(newCluster: Cluster): void;
	}
	class PruneCluster {
		private _markers;
		private _nbChanges;
		private _clusters;
		public Size: number;
		public ViewPadding: number;
		public Project: (lat: number, lng: number) => Point;
		public UnProject: (x: number, y: number) => Position;
		public RegisterMarker(marker: Marker): void;
		private _sortMarkers();
		private _sortClusters();
		private _indexLowerBoundLng(lng);
		private _resetClusterViews();
		public ProcessView(bounds: Bounds): Cluster[];
		public RemoveMarkers(markers?: Marker[]): void;
		public FindMarkersInArea(area: Bounds): Marker[];
		public ComputeBounds(markers: Marker[]): Bounds;
		public FindMarkersBoundsInArea(area: Bounds): Bounds;
		public ComputeGlobalBounds(): Bounds;
		public GetMarkers(): Marker[];
		public ResetClusters(): void;
	}
}
declare module PruneCluster {
	class LeafletAdapter implements L.ILayer {
		public Cluster: PruneCluster;
		public onAdd: (map: L.Map) => void;
		public onRemove: (map: L.Map) => void;
		public RegisterMarker: (marker: Marker) => void;
		public RemoveMarkers: (markers: Marker[]) => void;
		public ProcessView: () => void;
		public FitBounds: () => void;
		public GetMarkers: () => Marker[];
		public BuildLeafletCluster: (cluster: Cluster, position: L.LatLng) => L.ILayer;
		public BuildLeafletClusterIcon: (cluster: Cluster) => L.Icon;
		public BuildLeafletMarker: (marker: Marker, position: L.LatLng) => L.Marker;
		public PrepareLeafletMarker: (marker: L.Marker, data: {}, category: number|string) => void;
	}
}
declare var PruneClusterForLeaflet: any;
declare var PruneClusterLeafletSpiderfier: any;