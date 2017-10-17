/// <reference types="leaflet" />
/// <reference path="../../../typings/leaflet.util/index.d.ts" />

import {PruneCriticalInfrastructureCluster} from './CriticalInfrastructureClusters';
import {CriticalInfrastructureMarker} from './CriticalInfrastructureMarker';

export class CIPruneCluster {



    constructor() {

    }

    // Internal Class Definition 
    private CIPruneClusterClass = PruneClusterForLeaflet.extend({
        initialize: function(size: number = 120, clusterMargin: number = 20) {
            this.Cluster = new PruneCriticalInfrastructureCluster();

            // Important to make sure this public member variable is capitalized Size
            this.Cluster.Size = size;
            this.clusterMargin = Math.min(clusterMargin, size / 4);

		    // Bind the Leaflet project and unproject methods to the cluster
		    this.Cluster.Project = (lat: number, lng: number) =>
			    this._map.project(L.latLng(lat, lng), Math.floor(this._map.getZoom()));

		    this.Cluster.UnProject = (x: number, y: number) =>
			    this._map.unproject(L.point(x, y), Math.floor(this._map.getZoom()));

		    this._objectsOnMap = [];

            this.spiderfier = new PruneClusterLeafletSpiderfier(this);

            this._hardMove = false;
            this._resetIcons = false;

            this._removeTimeoutId = 0;
            this._markersRemoveListTimeout = [];

        },
        RegisterMarker: function(marker: PruneCluster.Marker) {
		this.Cluster.RegisterMarker(marker);
	},

    GetLeafletClusters: function (ciLayer) {

        // Get the PruneCluster.Clusters that are on the map
        var objectsOnMap: Array<PruneCluster.Cluster> = this._objectsOnMap;

        this._leafletMarkersOnMap = [];

        if (objectsOnMap) {

            objectsOnMap.forEach((cluster: PruneCluster.Cluster) => {

                var data = cluster.data;
                var leafletMarker = data._leafletMarker;
                var selectedClusterIcon = {};

                // set leaflet marker to red for now..
                if(cluster.population > 1){
                   selectedClusterIcon = L.divIcon({
                        className: "custom-icon",
                        html: '<div class="shape"><div style="background:#ED190E;" class="' + ciLayer.icon.iconShape + '"></div></div><div class="notification"><span>' + cluster.population + '</span></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + ciLayer.icon.symbol + '"></i></div>',
                        iconSize: L.point(30, 30),
                        iconAnchor: L.point(15, 15),
                        popupAnchor: L.point(0, 0)
                    });
                }
                else
                {
                    selectedClusterIcon = L.divIcon({
                        className: "custom-icon",
                        html: '<div class="shape"><div style="background:#ED190E;" class="' + ciLayer.icon.iconShape + '"></div></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + ciLayer.icon.symbol + '"></i></div>',
                        iconSize: L.point(30, 30),
                        iconAnchor: L.point(15, 15),
                        popupAnchor: L.point(0, 0)
                    });
                }

                leafletMarker.setIcon(selectedClusterIcon);
                this._leafletMarkersOnMap.push(leafletMarker);
            });
        }

        return this._leafletMarkersOnMap;
    },

    ProcessView: function () {
        var _this = this;
        if (!this._map || this._zoomInProgress || this._moveInProgress) {
            return;
        }
        var map = this._map, bounds = map.getBounds(), zoom = Math.floor(map.getZoom()), marginRatio = this.clusterMargin / this.Cluster.Size, resetIcons = this._resetIcons;
        var southWest = bounds.getSouthWest(), northEast = bounds.getNorthEast();
        var clusters = this.Cluster.ProcessView({
            minLat: southWest.lat,
            minLng: southWest.lng,
            maxLat: northEast.lat,
            maxLng: northEast.lng
        });
        var objectsOnMap = this._objectsOnMap, newObjectsOnMap = [], markersOnMap = new Array(objectsOnMap.length);
        for (var i = 0, l = objectsOnMap.length; i < l; ++i) {
            var marker = objectsOnMap[i].data._leafletMarker;
            markersOnMap[i] = marker;
            marker._removeFromMap = true;
        }
        var clusterCreationList = [];
        var clusterCreationListPopOne = [];
        var opacityUpdateList = [];
        var workingList = [];
        for (i = 0, l = clusters.length; i < l; ++i) {
            var icluster = clusters[i], iclusterData = icluster.data;
            var latMargin = (icluster.bounds.maxLat - icluster.bounds.minLat) * marginRatio, lngMargin = (icluster.bounds.maxLng - icluster.bounds.minLng) * marginRatio;
            for (var j = 0, ll = workingList.length; j < ll; ++j) {
                var c = workingList[j];
                if (c.bounds.maxLng < icluster.bounds.minLng) {
                    workingList.splice(j, 1);
                    --j;
                    --ll;
                    continue;
                }
                var oldMaxLng = c.averagePosition.lng + lngMargin, oldMinLat = c.averagePosition.lat - latMargin, oldMaxLat = c.averagePosition.lat + latMargin, newMinLng = icluster.averagePosition.lng - lngMargin, newMinLat = icluster.averagePosition.lat - latMargin, newMaxLat = icluster.averagePosition.lat + latMargin;
                if (oldMaxLng > newMinLng && oldMaxLat > newMinLat && oldMinLat < newMaxLat) {
                    iclusterData._leafletCollision = true;
                    c.ApplyCluster(icluster);
                    break;
                }
            }
            if (!iclusterData._leafletCollision) {
                workingList.push(icluster);
            }
        }
        clusters.forEach(function (cluster) {
            var m = undefined;
            var data = cluster.data;
            if (data._leafletCollision) {
                data._leafletCollision = false;
                data._leafletOldPopulation = 0;
                data._leafletOldHashCode = 0;
                return;
            }
            var position = L.latLng(cluster.averagePosition.lat, cluster.averagePosition.lng);
            var oldMarker = data._leafletMarker;
            if (oldMarker) {
                if (cluster.population === 1 && data._leafletOldPopulation === 1 && cluster.hashCode === oldMarker._hashCode) {
                    if (resetIcons || oldMarker._zoomLevel !== zoom || cluster.lastMarker.data.forceIconRedraw) {
                        _this.PrepareLeafletMarker(oldMarker, cluster.lastMarker.data, cluster.lastMarker.category);
                        if (cluster.lastMarker.data.forceIconRedraw) {
                            cluster.lastMarker.data.forceIconRedraw = false;
                        }
                    }
                    oldMarker.setLatLng(position);
                    m = oldMarker;
                }
                else if (cluster.population > 1 && data._leafletOldPopulation > 1 && (oldMarker._zoomLevel === zoom ||
                    data._leafletPosition.equals(position))) {
                    oldMarker.setLatLng(position);
                    if (resetIcons || cluster.population != data._leafletOldPopulation ||
                        cluster.hashCode !== data._leafletOldHashCode) {
                        var boundsCopy = {};
                        L.Util.extend(boundsCopy, cluster.bounds);
                        oldMarker._leafletClusterBounds = boundsCopy;
                        oldMarker.setIcon(_this.BuildLeafletClusterIcon(cluster));
                    }
                    data._leafletOldPopulation = cluster.population;
                    data._leafletOldHashCode = cluster.hashCode;
                    m = oldMarker;
                }
            }
            if (!m) {
                if (cluster.population === 1) {
                    clusterCreationListPopOne.push(cluster);
                }
                else {
                    clusterCreationList.push(cluster);
                }
                data._leafletPosition = position;
                data._leafletOldPopulation = cluster.population;
                data._leafletOldHashCode = cluster.hashCode;
            }
            else {
                m._removeFromMap = false;
                newObjectsOnMap.push(cluster);
                m._zoomLevel = zoom;
                m._hashCode = cluster.hashCode;
                m._population = cluster.population;
                data._leafletMarker = m;
                data._leafletPosition = position;
            }
        });
        clusterCreationList = clusterCreationListPopOne.concat(clusterCreationList);
        for (i = 0, l = objectsOnMap.length; i < l; ++i) {
            icluster = objectsOnMap[i];
            var idata = icluster.data;
            marker = idata._leafletMarker;
            if (idata._leafletMarker._removeFromMap) {
                var remove = true;
                if (marker._zoomLevel === zoom) {
                    var pa = icluster.averagePosition;
                    latMargin = (icluster.bounds.maxLat - icluster.bounds.minLat) * marginRatio,
                        lngMargin = (icluster.bounds.maxLng - icluster.bounds.minLng) * marginRatio;
                    for (j = 0, ll = clusterCreationList.length; j < ll; ++j) {
                        var jcluster = clusterCreationList[j], jdata = jcluster.data;
                        if (marker._population === 1 && jcluster.population === 1 &&
                            marker._hashCode === jcluster.hashCode) {
                            if (resetIcons || jcluster.lastMarker.data.forceIconRedraw) {
                                this.PrepareLeafletMarker(marker, jcluster.lastMarker.data, jcluster.lastMarker.category);
                                if (jcluster.lastMarker.data.forceIconRedraw) {
                                    jcluster.lastMarker.data.forceIconRedraw = false;
                                }
                            }
                            marker.setLatLng(jdata._leafletPosition);
                            remove = false;
                        }
                        else {
                            var pb = jcluster.averagePosition;
                            var oldMinLng = pa.lng - lngMargin, newMaxLng = pb.lng + lngMargin;
                            oldMaxLng = pa.lng + lngMargin;
                            oldMinLat = pa.lat - latMargin;
                            oldMaxLat = pa.lat + latMargin;
                            newMinLng = pb.lng - lngMargin;
                            newMinLat = pb.lat - latMargin;
                            newMaxLat = pb.lat + latMargin;
                            if ((marker._population > 1 && jcluster.population > 1) &&
                                (oldMaxLng > newMinLng && oldMinLng < newMaxLng && oldMaxLat > newMinLat && oldMinLat < newMaxLat)) {
                                marker.setLatLng(jdata._leafletPosition);
                                marker.setIcon(this.BuildLeafletClusterIcon(jcluster));
                                var poisson = {};
                                L.Util.extend(poisson, jcluster.bounds);
                                marker._leafletClusterBounds = poisson;
                                jdata._leafletOldPopulation = jcluster.population;
                                jdata._leafletOldHashCode = jcluster.hashCode;
                                marker._population = jcluster.population;
                                remove = false;
                            }
                        }
                        if (!remove) {
                            jdata._leafletMarker = marker;
                            marker._removeFromMap = false;
                            newObjectsOnMap.push(jcluster);
                            clusterCreationList.splice(j, 1);
                            --j;
                            --ll;
                            break;
                        }
                    }
                }
                if (remove) {
                    if (!marker._removeFromMap)
                        console.error("wtf");
                }
            }
        }
        for (i = 0, l = clusterCreationList.length; i < l; ++i) {
            icluster = clusterCreationList[i],
                idata = icluster.data;
            var iposition = idata._leafletPosition;
            var creationMarker;
            if (icluster.population === 1) {
                creationMarker = this.BuildLeafletMarker(icluster.lastMarker, iposition);
            }
            else {
                creationMarker = this.BuildLeafletCluster(icluster, iposition);
            }
            creationMarker.addTo(map);
            creationMarker.setOpacity(0);
            opacityUpdateList.push(creationMarker);
            idata._leafletMarker = creationMarker;
            creationMarker._zoomLevel = zoom;
            creationMarker._hashCode = icluster.hashCode;
            creationMarker._population = icluster.population;
            newObjectsOnMap.push(icluster);
        }
        window.setTimeout(function () {
            for (i = 0, l = opacityUpdateList.length; i < l; ++i) {
                var m = opacityUpdateList[i];
                if (m._icon)
                    L.DomUtil.addClass(m._icon, "prunecluster-anim");
                if (m._shadow)
                    L.DomUtil.addClass(m._shadow, "prunecluster-anim");
                
                // Need to figure out a cast that works.
                //if(m.isHighlighted())
                //    m.setOpacity(1.0);
                //else
                m.setOpacity(0.5);
            }
        }, 1);
        if (this._hardMove) {
            for (i = 0, l = markersOnMap.length; i < l; ++i) {
                marker = markersOnMap[i];
                if (marker._removeFromMap) {
                    map.removeLayer(marker);
                }
            }
        }
        else {
            if (this._removeTimeoutId !== 0) {
                window.clearTimeout(this._removeTimeoutId);
                for (i = 0, l = this._markersRemoveListTimeout.length; i < l; ++i) {
                    map.removeLayer(this._markersRemoveListTimeout[i]);
                }
            }
            var toRemove = [];
            for (i = 0, l = markersOnMap.length; i < l; ++i) {
                marker = markersOnMap[i];
                if (marker._removeFromMap) {
                    marker.setOpacity(0);
                    toRemove.push(marker);
                }
            }
            if (toRemove.length > 0) {
                this._removeTimeoutId = window.setTimeout(function () {
                    for (i = 0, l = toRemove.length; i < l; ++i) {
                        map.removeLayer(toRemove[i]);
                    }
                    _this._removeTimeoutId = 0;
                }, 300);
            }
            this._markersRemoveListTimeout = toRemove;
        }
        this._objectsOnMap = newObjectsOnMap;
        this._hardMove = false;
        this._resetIcons = false;
    }
        // Associating clusters with markers 

        // GetClusterMarkerMap: function () {
        //     var mapToReturn = new Map();

        //     var objectsOnMap: Array<PruneCluster.Cluster> = this._objectsOnMap;

        //     if (objectsOnMap) {
        //         objectsOnMap.forEach( (cluster: PruneCluster.Cluster) => {
        //             cluster.GetClusterMarkers().forEach( (value) => {
        //                 mapToReturn.set(value, cluster);
        //             });
        //         });
        //     }
            
        //     return mapToReturn;
        // }

    });

    public PruneClusterForLeaflet() {
        var CIPruneCluster = new this.CIPruneClusterClass();
        return CIPruneCluster;
    }
}

