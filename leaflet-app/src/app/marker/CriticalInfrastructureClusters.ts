import {CriticalInfrastructureMarker} from './CriticalInfrastructureMarker';

export class PruneCriticalInfrastructureMarker extends PruneCluster.Marker {

    // Attribute to determine whether highlighted or not
    // as a set of dependencies 
    private highlighted: boolean;
    
    // reference to the PruneCluster.Cluster based-object that
    // contains this PruneClusterInfrastructureMarker
    //private parentCluster: PruneCriticalInfrastructureClusterInformation;
    private parentCluster: HighlightableCluster;

    constructor(lat: number, lng: number, data: {} = {},
        category?: number, weight: number = 1, filtered: boolean = false, highlighted: boolean = false){
        super(lat,lng,data,category,weight,filtered);
        this.highlighted = highlighted;
        this.parentCluster = null;
    }

    // public toggleHighLight():void {

    //     if(this.parentCluster){
    //         if(this.highlighted){
    //             this.highlighted = false;
    //             this.parentCluster.toggleHighLight();
    //         }
    //         else{
    //             this.highlighted = true;
    //             this.parentCluster.toggleHighLight();
    //         }
    //     }
    // }

    // set state of highlight and pass icon to parent cluster
    // if not undefined.
    public setHighlight(state: boolean, icon: L.Icon = undefined){
        this.highlighted = state;
        this.parentCluster.setHighlight(state, icon);
    }

    // set the parentCluster of this marker
    public SetParentCluster(parentCluster: HighlightableCluster){
        //this.parentCluster = new PruneCriticalInfrastructureClusterInformation(parentCluster, false, this.data);
        this.parentCluster = parentCluster;
    }

    public GetParentCluster(){
        return this.parentCluster;
    }

    public isHighlighted(): boolean{
        return this.highlighted;
    }
}

export class HighlightableCluster extends PruneCluster.Cluster {

    // Attribute to determine whether highlighted or not
    // as a set of dependencies, if any of the child markers
    // are selected in this cluster we need to highlight the specific marker icon
    protected highlighted: boolean;
    
    // leaflet marker that represents this cluster
    protected leafletMarker: CriticalInfrastructureMarker;


    constructor(marker?: PruneCluster.Marker, highlighted : boolean = false){
        super(marker);
        this.highlighted = highlighted;
    }

    public isHighlighted(): boolean{
        return this.highlighted;
    }

    // should only be called after the cluster is fully built
    // if icon passed then alter the associated leaflet
    // icon too, else just set state of highlight
    public setHighlight(state: boolean, icon: L.Icon = undefined){
        
        this.highlighted = state;
        if(icon)
            this.data._leafletMarker.setIcon(icon);
    }

    public Reset() {
        super.Reset();
        
        // if highlighted isn't reset
        // clusters that no longer contain
        // highlighted markers remain highlighted
        this.highlighted = false;
	}

}

// export class PruneCriticalInfrastructureClusterInformation {

//     // Attribute to determine whether highlighted or not
//     // as a set of dependencies 
//     private highlighted: boolean;
//     // instance of original cluster object for downcasting purposes;
//     private cluster: PruneCluster.Cluster;
//     // leaflet marker for the original cluster
//     private leafletMarker: L.Marker;
//     public data: {};

//     // leaflet selected icon style
//     private selectedIconStyle: string;
//     // leaflet unselected icon style
//     private unselectedIconStyle: string;

//     constructor(cluster: PruneCluster.Cluster,  highlighted: boolean = false, data: {} = {}){
//         this.highlighted = highlighted;
//         this.cluster = cluster;
//         this.leafletMarker = cluster.data._leafletMarker;
//         this.data = data;
//     }

//     public toggleHighLight():void {
        
//         // reference to the leaflet marker for this cluster
//         var criticalInfrastructureMarker:CriticalInfrastructureMarker = <CriticalInfrastructureMarker> this.leafletMarker;

//         if(this.highlighted){
//             this.highlighted = false;
//             criticalInfrastructureMarker.toggleHighLight();
//         }
//         else{
//             this.highlighted = true;
//             criticalInfrastructureMarker.toggleHighLight();
//         }
//     }

//     public setHighlight(state: boolean):void {
//         this.highlighted = state;
//         if(state)
//             this.leafletMarker.setIcon(this.getHighlightedIcon(this.cluster.population));
//         else
//             this.leafletMarker.setIcon(this.getUnHighlightedIcon(this.cluster.population));

//     }

//     private getHighlightedIcon(population: number): L.Icon {
//             return  L.divIcon({
//                 className: "custom-icon",
//                 html: this.getHighlightedIconStyle(population),
//                 iconSize: L.point(30, 30),
//                 iconAnchor: L.point(15, 15),
//                 popupAnchor: L.point(0, 0)
//             });
//     }

//     private getUnHighlightedIcon(population: number): L.Icon {
//          return  L.divIcon({
//                 className: "custom-icon",
//                 html: this.getUnHighlightedIconStyle(population),
//                 iconSize: L.point(30, 30),
//                 iconAnchor: L.point(15, 15),
//                 popupAnchor: L.point(0, 0)
//             });
//     } 

//     private getHighlightedIconStyle(population): string {
//         if(population == 1)
//             return '<div class="shape"><div style="background:#ED190E;" class="' + (<any>this.data).iconShape + '"></div></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + (<any>this.data).symbol + '"></i></div>';
//         else
//             return '<div class="shape"><div style="background:#ED190E;" class="' + (<any>this.data).iconShape + '"></div></div><div class="notification"><span>' + population + '</span></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + (<any>this.data).symbol + '"></i></div>';
//     }

//     private getUnHighlightedIconStyle(population): string {
//         if(population == 1)
//             return '<div class="shape"><div style="background:' + (<any>this.data).iconColor + ';" class="' + (<any>this.data).iconShape + '"></div></div><div style="color:' + (<any>this.data).symbolColor + ';" class="symbol"><i class="fa fa-' + (<any>this.data).symbol + '"></i></div>';
//         else
//             return '<div class="shape"><div style="background:' + (<any>this.data).iconColor + ';" class="' +  (<any>this.data).iconShape + '"></div></div><div class="notification"><span>' + population + '</span></div><div style="color:' +  (<any>this.data).symbolColor + ';" class="symbol"><i class="fa fa-' +  (<any>this.data).symbol + '"></i></div>';
//     }

// }

export class PruneCriticalInfrastructureCluster extends PruneCluster.PruneCluster {

    // original implementation of PruneCluster had these fields 
    // as private, making them protected to make it easier
    // to extend class in the future
    protected ciClusters: PruneCluster.Cluster[] = [];
    protected ciMarkers: PruneCluster.Marker [] = [];
    protected highlightedClusterCount = 0;
    
    // Represent the number of marker added or deleted since the last sort
    protected ciNbChanges: number;

    // Adding ability to plug-in custom sort functions into our implementation of PruneCluster.PruneCluster
    constructor(){
        super();
    }
    
    public RegisterMarker(marker: PruneCluster.Marker){
        if( (<any>marker)._removeFlag) {
            delete (<any>marker)._removeFlag
        }
        // add new marker to internal collection
        this.ciMarkers.push(marker);
        // increment the number of changes to the marker collection
        this.ciNbChanges +=1;
    }

    protected CheckPositionInsideBounds(a: PruneCluster.Position, b: PruneCluster.Bounds) : boolean {
        return (a.lat >= b.minLat && a.lat <= b.maxLat) &&
			    a.lng >= b.minLng && a.lng <= b.maxLng;
    }

    protected IndexLowerBoundingLng(lng: number) : number {
        // It's a binary search algorithm
			var markers = this.ciMarkers,
				it,
				step,
				first = 0,
				count = markers.length;

			while (count > 0) {
				step = Math.floor(count / 2);
				it = first + step;
				if (markers[it].position.lng < lng) {
					first = ++it;
					count -= step + 1;
				} else {
					count = step;
				}
			}

			return first;
    }


    protected ResetClusterViews(){
        // Reset all the clusters
        this.ciClusters.forEach( (ciCluster) => {
            
            ciCluster.Reset();

            // The projection changes in accordance with the view's zoom level
			// (at least with Leaflet.js)
			ciCluster.ComputeBounds(this);

        });
    }
     
    // Determine Sorting Algorithm to use based off the number of changes or the number 
    // of changes as a ratio to the total number of markers.
    // If number of changes is greater than 300 don't do insertion sort
    // If number of changes / total number of markers is less than 20%
    // do insertion sort
    protected SortMarkers() {
        var markers = this.ciMarkers,
            total = markers.length;

        if(this.ciNbChanges && !this.ShouldUseInsertionSort(total, this.ciNbChanges)){
            CISort.PruneClusterSortByLongitude(this.ciMarkers);
        }
        else{
            CISort.PruneClusterInsertionSort(this.ciMarkers);
        }

        // Once the list of markers is sorted reset number of changes back to 0
        this.ciNbChanges = 0;
        
    }
    
    protected ShouldUseInsertionSort(total: number, numOfChanges: number): boolean {
		if (numOfChanges > 300) {
			return false;
		} else {
			return (numOfChanges / total) < 0.2;
		}
	}

    public ProcessView(bounds: PruneCluster.Bounds): PruneCluster.Cluster[]{

        // Compute the extended bounds of the view
			var heightBuffer = Math.abs(bounds.maxLat - bounds.minLat) * this.ViewPadding,
				widthBuffer = Math.abs(bounds.maxLng - bounds.minLng) * this.ViewPadding;

			var extendedBounds: PruneCluster.Bounds = {
				minLat: bounds.minLat - heightBuffer - heightBuffer,
				maxLat: bounds.maxLat + heightBuffer + heightBuffer,
				minLng: bounds.minLng - widthBuffer - widthBuffer,
				maxLng: bounds.maxLng + widthBuffer + widthBuffer
			};

            // We keep the list of all markers sorted
			// It's faster to keep the list sorted so we can use
			// a insertion sort algorithm which is faster for sorted lists
            this.SortMarkers();

            // Reset the Cluster for the new view
            this.ResetClusterViews();

            // Binary search for the first interesting marker
			var firstIndex = this.IndexLowerBoundingLng(extendedBounds.minLng);

            // Just some shortcuts
			var markers = this.ciMarkers,
			    clusters = this.ciClusters;

            // Makes a shallow copy of the cluster list 
            var workingClusterList = clusters.slice(0);

            for(var i = firstIndex, len = markers.length; i < len; ++i){
                // make the marker a PruneCriticalInfrastructureMarker so we can set a reference to the parent cluster
                var marker:PruneCriticalInfrastructureMarker = <PruneCriticalInfrastructureMarker>markers[i],
                    markerPosition = marker.position;

                // If the marker longitute is higher than the view longitude,
				// we can stop to iterate
				if (markerPosition.lng > extendedBounds.maxLng) {
					break;
				}

                // If the marker is inside the view and is not filtered
				if (markerPosition.lat > extendedBounds.minLat &&
					markerPosition.lat < extendedBounds.maxLat &&
					!marker.filtered) {

                    var clusterFound = false, cluster: PruneCluster.Cluster;

                    // For every active cluster
					for (var j = 0, ll = workingClusterList.length; j < ll; ++j) {
						cluster = workingClusterList[j];

                        // If the cluster is far away the current marker
						// we can remove it from the list of active clusters
						// because we will never reach it again
						if (cluster.bounds.maxLng < marker.position.lng) {
							workingClusterList.splice(j, 1);
							--j;
							--ll;
							continue;
						}

                        if (this.CheckPositionInsideBounds(markerPosition, cluster.bounds)) {
							
                            var highlightableCluster:HighlightableCluster = <HighlightableCluster>cluster;

                            // set the parent of this marker to the cluster
                            marker.SetParentCluster(highlightableCluster);
                            
                            // if the marker is highlighted we need to highlight the cluster too
                            if(marker.isHighlighted()){
                               highlightableCluster.setHighlight(true);
                            }
                            cluster.AddMarker(marker);
							// We found a marker, we don't need to go further
							clusterFound = true;
							break;
						}
                    }

                    // If the marker doesn't fit in any cluster,
					// we must create a brand new cluster.
					if (!clusterFound) {
						
                        // if marker that is being added to the cluster is highlighted we need to tell the cluster
                        // that it gets highlighted too by passing in the state of the marker highlight.
                        
                        // get the highlighted state of the marker
                        var markerHighlightState:boolean = marker.isHighlighted();
                        
                        // then create new cluster and pass the state of the marker to it
                        cluster = new HighlightableCluster(marker, markerHighlightState);
                        cluster.ComputeBounds(this);
						clusters.push(cluster);
						workingClusterList.push(cluster);
                        
                        // set this marker's parent cluster to cluster
                        marker.SetParentCluster(<HighlightableCluster>cluster);
                    }
            }
        }

        // Time to remove empty clusters
        var newClustersList: PruneCluster.Cluster[] = [];
        for( i = 0, len = clusters.length; i < len; ++i){
            
            cluster = clusters[i];
            
            var highlightableCluster:HighlightableCluster = <HighlightableCluster>cluster;
            if(highlightableCluster.isHighlighted()){
                console.log("highlighted cluster found!");
            }

            if(cluster.population > 0){
                newClustersList.push(cluster);
            }
        }

        this.ciClusters = newClustersList;
        CISort.PruneClusterInsertionSort(this.ciClusters);

        return this.ciClusters;
    }

    public FindMarkersInArea(area: PruneCluster.Bounds): PruneCluster.Marker[] {
            var aMinLat = area.minLat,
				aMaxLat = area.maxLat,
				aMinLng = area.minLng,
				aMaxLng = area.maxLng,
                markers = this.ciMarkers,
                result = [];

            var firstIndex = this.IndexLowerBoundingLng(aMinLng);

            for (var i = firstIndex, l = markers.length; i < l; ++i) {
				var pos = markers[i].position;

				if (pos.lng > aMaxLng) {
					break;
				}

				if (pos.lat >= aMinLat && pos.lat <= aMaxLat &&
					pos.lng >= aMinLng) {

					result.push(markers[i]);
				}
			}

			return result;

    }

    public GetMarkers(): PruneCluster.Marker [] {
        return this.ciMarkers;
    }

    public GetPopulation(): number {
        return this.ciMarkers.length;
    }

    public ResetClusters() {
        this.ciClusters = [];
    }



}


module CISort{

    // Sort Prunecluster using Insertion Sort algorithm 
    // Use only when PruneClusters are partially in order
    export function PruneClusterInsertionSort(items: PruneCluster.ClusterObject[]): void{
            for(var i: number = 1, 
                    j: number,
                    tmp: PruneCluster.ClusterObject,
                    tmpLng: number,
                    length = items.length; i < length; i++) {
                    tmp = items[i];
                    tmpLng = tmp.position.lng;
                    for( j = i - 1; j >= 0 && items[j].position.lng > tmpLng; --j){
                            items[j + 1] = items[j];
                    }
                    items[j + 1] = tmp;     
            }
        }

    // Sort Pruneclusters in place using a comparison function 
    // to determine which has the greater longitude 
    export function PruneClusterSortByLongitude (items: PruneCluster.Marker[]): void {   
            items.sort( (a: PruneCluster.Marker, b: PruneCluster.Marker) => a.position.lng - b.position.lng);
    }

}