import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter, ElementRef, Renderer } from '@angular/core'
import { Http, Response } from '@angular/http';

// Interfaces
import { CriticalInfrastructureLayer, MapIcon } from '../interfaces/interfaces';

// Classes
import { CriticalInfrastructureMarker } from '../marker/CriticalInfrastructureMarker';
import { CIPruneCluster } from '../marker/CIPruneClusterForLeaflet';
import { PruneCriticalInfrastructureMarker, HighlightableCluster } from '../marker/CriticalInfrastructureClusters'

// Services & Directives
import { LayerDirective } from './layer.directive';
import { MapService } from '../services/map.service';
import { FileparserService } from '../services/fileparser.service';

// 3rd Party
import { Observable } from 'rxjs/Rx';
import { Map as LeafletMap, Point } from 'leaflet';
declare var $: JQueryStatic;

@Component({
    selector: 'app-layer',
    templateUrl: './layer.component.html',
    styleUrls: ['./layer.component.css']
})
export class LayerComponent implements OnInit {

    @Input('layerToWatch') ciLayer: CriticalInfrastructureLayer;

    @Output('added') add = new EventEmitter();
    @Output('removed') remove = new EventEmitter();
    @Output('markerClicked') markerClick = new EventEmitter();
    @Output('downstreamClicked') downstreamClick = new EventEmitter();
    @Output('upstreamClicked') upstreamClick = new EventEmitter();
    @Output('infoClicked') infoClick = new EventEmitter();

    private fileExtension: string;

    private json: any;                                                        // changing type from JSON to any for the time being to get around typing errors
    private mapService: MapService;
    private loading: boolean;                                                 // may use to display loading process, currently not used
    private markerMap: any;                                                   // provides quick access to PruneCriticalInfrastructureMarkers of layer indexed by id 
    private selectedMarkersMap: any;                                          // provides quick access to currently selected PruneCriticalInfrastructureMarker - useful for clearing icons
    //private selectedMarkers: Array<any>;                                      // Array of selected markers clusters, set to any for now, change to L.Markers when typing issues resolved
    private selectedMarkers: any;
    private previouslySelectedMarkers: Array<L.Marker>                        // Array of previously selected marker cluster
    private markers: L.MarkerClusterGroup;                                    // reference to markerClusterGroup if layer is point data
    private static prevClickedMarker: L.Marker;                               // used to save the reference to the current marker that fired click event (must be static!!)
    private static prevClickedMarkerIcon: L.Icon;                             // used to save the reference to the current marker's icon style that fired click event (must be static!!) 

    private rebuildClusterIcons: boolean;                                    // set to true initially for dependency query as cluster icons already built won't be modified otherwise
    // used this to call markers.refreshClusters once then set to false until next dependency query.


    private rebuildParentIcons: boolean;                                     // going to try this for rebuilding the parents of the selected icons

    private cluster: any;                                                    // PruneCluster object

    private isPointLayer: boolean = false;

    constructor(mapService: MapService, private fileparser: FileparserService, private elRef: ElementRef, private renderer: Renderer) {
        this.mapService = mapService;
        this.loading = true;

        //map of all markers for this layer
        this.markerMap = new Map();
        // this.markerMap = {};

        // map of currently selected markers selected by getDependencies
        this.selectedMarkersMap = new Map();

        // initialize marker array
        // Setting this to accept type any for the time being
        // When typing issue figured out set back to <L.Marker>
        this.selectedMarkers = [];
        //this.selectedMarkers = new Array<L.Marker>();

        // initialize previous marker array
        this.previouslySelectedMarkers = new Array<L.Marker>();

        // set to true in preparation for a dependency query
        // should probably make a check for maxzoom as in this case the clusters won't need to be refreshed
        this.rebuildClusterIcons = true;

        // setting to false for now, but will be set to true on each call to findDependencies
        this.rebuildParentIcons = false;

        /** fired when the map zoom changes (after zoom animation) */
        this.mapService.map.on('zoomend', (event: L.Event) => {
            console.log("onZoomEnd");
            console.log(this.ciLayer.humanName);
            console.log(this.getMarkerMap());
            //this.cluster.GetLeafletClusters(this.ciLayer);
        });

        // trying out this event as a possible place to check for looking at leaflet markers from clusters
        this.mapService.map.on('moveend', (event: L.Event) => {
            console.log("onMoveEnd");
            //this.cluster.GetLeafletClusters(this.ciLayer);
            
            // just wanting to see that our markers area associated with clusters
            //console.log(this.getMarkerMap());
            console.log(this.ciLayer.humanName);
            console.log(this.getMarkerMap());
            //this.cluster.GetLeafletClusters(this.ciLayer);
        });

        // If you want list of markers inside the cluster
        // (you must enable the option using PruneCluster.Cluster.ENABLE_MARKERS_LIST = true)
        PruneCluster.Cluster.ENABLE_MARKERS_LIST = true;

        // Initalizing PruneCluster object
        this.cluster = new CIPruneCluster().PruneClusterForLeaflet();

    }

    ngOnInit() {

        this.fileparser.getData(this.ciLayer.fileUrl, this.ciLayer.layerData).subscribe(jsonData => {
            this.json = jsonData;
            // console.log('attaching geoJson to map');
            this.attachGeoJsonToMap();
        },
            err => console.error(err),
            () => {
                console.log('done');
            }
        );
    }

    restyle(e: any) {

        switch (e.name) {
            case "MapboxDark":
                console.log(this.ciLayer.layerData);
                break;
            case "Esri":
                console.log(this.ciLayer.layerData);
                break;
            case "CartoDB":
                console.log(this.ciLayer.layerData);
                break;
            case "Satellite":
                console.log(this.ciLayer.layerData);
                break;
            default:
                break;
        }
    }

    onClick() {
        if (this.ciLayer.visible) {

            if (!this.isPointLayer) {
                // Remove statement for objects parsed by L.GeoJSON
                this.mapService.map.removeLayer(this.ciLayer.layerData);
            } else {
                // Remove statement for PruneCluster
                this.mapService.map.removeLayer(this.cluster);
                this.cluster.ProcessView();
            }

            this.ciLayer.visible = false;
        }
        else {

            if (!this.isPointLayer) {
                // Remove statement for objects parsed by L.GeoJSON
                this.mapService.map.addLayer(this.ciLayer.layerData);
            } else {
                // Remove statement for PruneCluster
                this.mapService.map.addLayer(this.cluster);
                this.cluster.ProcessView();
            }

            this.ciLayer.visible = true;
        }
    }

    onAdd() {
        this.add.emit(this.ciLayer.layerData);
        this.loading = false;
    }

    onRemove() {
        this.remove.emit(this.ciLayer.layerData);
    }

    getFileType() {
        return this.ciLayer.fileUrl.substring(this.ciLayer.fileUrl.lastIndexOf(".") + 1, this.ciLayer.fileUrl.length);
    }

    /**
     * Adds markers to the PruneCluster object
     * @param {JSON} data - Features of a GeoJSON object
     */
    renderMarkers(data) {

        var hasIcon: boolean = this.ciLayer.icon != undefined || this.ciLayer.icon != null;
        var hasIdField: boolean = this.ciLayer.idField != undefined || this.ciLayer.icon != null;
        var hasPopup: boolean = true; //setting this to true for now, but we'll want to develop a property here perhaps?

        let markerId = "";
        let markerType = "";

        // Passing through features, instantiating a PruneCluster.Marker object
        for (var i = 0; i < data.length; i++) {

            //var marker = new PruneCluster.Marker(data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]);
            var marker = new PruneCriticalInfrastructureMarker(data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]);
            
            if (hasIdField) {
                markerId = data[i].properties[this.ciLayer.idField];
                markerType = this.ciLayer.layerName;
            }

            var markerText = "<span class='info-popup'><table><tr><td><B>Category: </B>" + this.ciLayer.humanName + "</td></tr><tr><td><B>ID: </B>" + markerId + "</td></tr><tr><td style='text-align: center;'><a id='infoButton' class='btn infoBtn' onClick=$('#modal1').openModal();>More Info</a></td></tr></table></span>";
            // Add click event handler to marker text link
            var infoButtonElement = $('#infoButton');
            $('.modal-content')[0].innerText = this.markerPropertiesToString(data[i].properties);

            // bind the popup here
            marker.data.popup = markerText;

            // Assign unique ID to marker
            marker.data.ID = markerId;

            // Get Label for this layer so we can use it for our queries
            marker.data.label = this.ciLayer.label;


            // Assign some styles that we'll use to determine whether icon is selected or not
            // normal icon
            marker.data.iconColor = this.ciLayer.icon.iconColor;
            marker.data.iconShape = this.ciLayer.icon.iconShape;
            marker.data.symbol = this.ciLayer.icon.symbol;
            marker.data.symbolColor = this.ciLayer.icon.symbolColor;

            // Marker is added to a Map that links ID and PruneCluster.Marker object
            this.indexMarker(marker);

            this.cluster.RegisterMarker(marker);
        }

        var transparentIcon = L.divIcon({
            className: "custom-icon",
            html: this.customIconSemiTransparent(),
            iconSize: L.point(30, 30),
            iconAnchor: L.point(15, 15),
            popupAnchor: L.point(0, 0)
        });

        var opaqueIcon = L.divIcon({
            className: "custom-icon",
            html: this.customIcon(),
            iconSize: L.point(30, 30),
            iconAnchor: L.point(15, 15),
            popupAnchor: L.point(0, 0),
        });

        var selectedIcon = L.divIcon({
             className: "custom-icon",
             html: this.selectedCustomIcon(),
             iconSize: L.point(30,30),
             iconAnchor: L.point(15,15),
             popupAnchor: L.point(0,0)
        });

        this.cluster.BuildLeafletMarker = (marker: PruneCluster.Marker, position: L.LatLng) => {
            // debug to see how often this is called
            console.log("building leaflet marker - " + marker.data.ID);
            
             // L.divIcon style to be set determined on whether marker is highlighted or not.
            var iconStyle: string;

            // assume all leaflet markers are un-highlighted unless 
            // PruneCluster.Marker is an instance of PruneCriticalInfrastructureMarker 
            // and is explicitly set to highlighted.
            var isHighlighted = false;

            if(marker instanceof PruneCriticalInfrastructureMarker){
                var pciMarker:PruneCriticalInfrastructureMarker = marker;
                isHighlighted = pciMarker.isHighlighted();
            }

            // if highlighted create highlighted style for icon
            // otherwise create normal style icon.
            if(isHighlighted)
                iconStyle = this.selectedCustomIcon();
            else
                iconStyle = this.customIcon();
            
            var mOptions: L.MarkerOptions = ({icon: L.divIcon({className: "custom-icon", html: iconStyle, iconSize: L.point(30,30), iconAnchor: L.point(15,15), popupAnchor: L.point(0,0)}),
                                              contextmenu: true,
                                              contextmenuItems : [{
                                                  text: 'Show Down Stream Dependencies',
                                                  index: 0,
                                                  callback: this.findDownStreamDependencies
                                              },
                                              {
                                                  text: 'Show Up Stream Dependencies',
                                                  index: 1,
                                                  callback: this.findUpStreamDependencies
                                              }]
                                            });
            var m = new CriticalInfrastructureMarker(position, mOptions,this.selectedCustomIcon());
            this.cluster.PrepareLeafletMarker(m, marker.data, marker.category);
            return m;
        }

        this.cluster.PrepareLeafletMarker = (leafletMarker, data) => {
           
            if (data.popup) {
                leafletMarker.bindPopup(data.popup);
            }

            leafletMarker.addEventListener('findDownstreamDependencies', (event) => {
                 
                // mark this leaflet marker's associated CriticalInfrastructureMarker and
                // HighlightableCluster to highlighted
                var nodeMarker: PruneCriticalInfrastructureMarker = this.getPruneCriticalInfrastructureMaker(data.ID);
                nodeMarker.setHighlight(true);
                // add it to our list of selected markers
                this.selectedMarkersMap.set(<number>nodeMarker.data.ID,nodeMarker);


                // send the leaflet marker and some properties of it to the layerlist component
                // in order to trigger the neo4j service to get back dependencies
                var featureProperties = {marker: leafletMarker, data: data, downstream: true};
                this.downstreamClick.emit(featureProperties);
            });

            leafletMarker.addEventListener('findUpstreamDependencies', (event) => {
        
                // mark this leaflet marker's associated CriticalInfrastructureMarker and
                // HighlightableCluster to highlighted
                var nodeMarker: PruneCriticalInfrastructureMarker = this.getPruneCriticalInfrastructureMaker(data.ID);
                nodeMarker.setHighlight(true);

                // send the leaflet marker and some properties of it to the layerlist component
                // in order to trigger the neo4j service to get back dependencies
                var featureProperties = {marker: leafletMarker, data: data, downstream: false};
                this.upstreamClick.emit(featureProperties);

            });

            
            // leafletMarker.on("click", (event:MouseEvent) => {
            //     leafletMarker.toggleHighLight();
                
            //     // mark this leaflet marker's associated CriticalInfrastructureMarker and
            //     // HighlightableCluster to highlighted
            //     var nodeMarker: PruneCriticalInfrastructureMarker = this.getPruneCriticalInfrastructureMaker(data.ID);
            //     nodeMarker.setHighlight(true);
            //     // add it to our list of selected markers
            //     this.selectedMarkersMap.set(<number>nodeMarker.data.ID,nodeMarker);


            //     // send the leaflet marker and some properties of it to the layerlist component
            //     // in order to trigger the neo4j service to get back dependencies
            //     var featureProperties = {marker: leafletMarker, data: data};
            //     this.markerClick.emit(featureProperties);
            // });


        }

        

        this.cluster.BuildLeafletClusterIcon = (cluster) => {
            var population = cluster.population;
            var stats = cluster.stats;
            var markers = cluster.GetClusterMarkers();
            // get access to the highlightable cluster properties
            var highlightableCluster = <HighlightableCluster>cluster;
            
            if(highlightableCluster.isHighlighted())
                return L.divIcon({
                    className: "custom-icon",
                    html: this.getHighlightedIconStyle(population),
                    iconSize: L.point(30, 30),
                    iconAnchor: L.point(15, 15)
                });
                
            else
                return L.divIcon({
                    className: "custom-icon",
                    html: this.getUnHighlightedIconStyle(population),
                    iconSize: L.point(30, 30),
                    iconAnchor: L.point(15, 15)
                });
        };

        // this.cluster is actually a PruneClusterForLeaflet Object
        // it encapsulates the actual PruneClusters inside it internally
        // it extends the L.Layer/L.Class object and therefore is added to the map like any other layer.
        this.mapService.map.addLayer(this.cluster);
        this.cluster.ProcessView();
    }

    attachGeoJsonToMap() {

        var featureType = this.ciLayer.featureType;
        var iconUrl = "default";
        var iconString: string;


        switch (this.json.features[0].geometry.type) {
            case "Point":

                // this.markers = new L.MarkerClusterGroup({
                //     chunkedLoading: true,
                //     iconCreateFunction: (cluster) => {

                //         // default icon string 
                //         // covers cases when no dependencies are found
                //         // but a query was made

                //         if (this.rebuildParentIcons) {
                //             iconString = this.customClusterIconSemiTransparent(cluster.getChildCount());
                //         } else {
                //             iconString = this.customClusterIcon(cluster.getChildCount());
                //         }

                //         // we have to check if any of the new clusters contain selected nodes
                //         if (this.selectedMarkers.length > 0) {

                //             if (this.selectedMarkers.includes(cluster))
                //                 iconString = this.selectedCustomClusterIcon(cluster.getChildCount());
                //             else
                //                 iconString = this.customClusterIconSemiTransparent(cluster.getChildCount());
                //         }


                //         return L.divIcon({
                //             className: "custom-icon",
                //             html: iconString,
                //             iconSize: L.point(30, 30),
                //             iconAnchor: L.point(15, 15)

                //         });
                //     }
                // });

                // Added to debug geojson function

                // let tempPoints = L.geoJson(this.json, {
                //     pointToLayer: (feature, latlng) => {
                //         var markerToReturn: L.Marker;

                //         let markerId = "";
                //         let markerType = "";

                //         // if (hasIdField) {
                //         //     markerId = feature.properties[this.ciLayer.idField];
                //         //     markerType = this.ciLayer.layerName;
                //         // }


                //         if (iconUrl != "default" && iconUrl.length > 0) {
                //             var icon = L.icon({
                //                 iconUrl: iconUrl,
                //                 iconSize: [32, 32],
                //                 iconAnchor: [16, 16],
                //                 popupAnchor: [16, 0],
                //             })


                //             markerToReturn = new L.Marker(latlng, {contextmenu: true, contextmenuItems:[{text: markerType + ' ' + markerId, index:0}, {separator: true, index:1}], icon: icon });
                //         } else if (iconUrl == "default" && hasIcon) {

                //             var icon = L.divIcon({
                //                 className: "custom-icon",
                //                 html: iconString,
                //                 iconSize: L.point(30, 30),
                //                 iconAnchor: L.point(15, 15)

                //             });

                //             markerToReturn = new L.Marker(latlng, {contextmenu: true, contextmenuItems:[{text: markerType + ' ' + markerId, index:0}, {separator: true, index:1}], icon: icon });

                //         } else {
                //             markerToReturn = new L.Marker(latlng);
                //         }

                //         return markerToReturn;
                //     }
                // });

                this.renderMarkers(this.json.features);
                this.isPointLayer = true;

                // var points = L.geoJson(this.json, {

                //     // Adds custom icons to map
                //     // Add popups to markers
                //     pointToLayer: (feature, latlng) => {

                //         var markerToReturn: L.Marker;

                //         let markerId = "";
                //         let markerType = "";

                //         if (hasIdField) {
                //             markerId = feature.properties[this.ciLayer.idField];
                //             markerType = this.ciLayer.layerName;
                //         }


                //         if (iconUrl != "default" && iconUrl.length > 0) {
                //             var icon = L.icon({
                //                 iconUrl: iconUrl,
                //                 iconSize: [32, 32],
                //                 iconAnchor: [16, 16],
                //                 popupAnchor: [16, 0],
                //             })


                //             //markerToReturn = new L.Marker(latlng, {contextmenu: true, contextmenuItems:[{text: markerType + ' ' + markerId, index:0}, {separator: true, index:1}], icon: icon });
                //             markerToReturn = new L.CriticalInfrastructureMarker(latlng, { contextmenu: true, contextmenuItems: [{ text: markerType + ' ' + markerId, index: 0 }, { separator: true, index: 1 }], icon: icon });
                //         } else if (iconUrl == "default" && hasIcon) {

                //             var icon = L.divIcon({
                //                 className: "custom-icon",
                //                 html: iconString,
                //                 iconSize: L.point(30, 30),
                //                 iconAnchor: L.point(15, 15)

                //             });

                //             //markerToReturn = new L.Marker(latlng, { icon: icon })
                //             //markerToReturn = new L.Marker(latlng, {contextmenu: true, contextmenuItems:[{text: markerType + ' ' + markerId, index:0}, {separator: true, index:1}], icon: icon });
                //             markerToReturn = new L.CriticalInfrastructureMarker(latlng, { contextmenu: true, contextmenuItems: [{ text: markerType + ' ' + markerId, index: 0 }, { separator: true, index: 1 }], icon: icon });

                //         } else {
                //             //markerToReturn = new L.Marker(latlng);
                //             markerToReturn = new L.CriticalInfrastructureMarker(latlng);
                //         }

                //         if (hasPopup) {

                //             //var markerText = this.markerPropertiesToString(feature.properties);

                //             if (hasIdField) {
                //                 var attribute = this.ciLayer.idField
                //                 var value = feature.properties[this.ciLayer.idField];

                //             }

                //             // create a popup
                //             /*let popup = L.popup()
                //                 .setLatLng(latlng)
                //                 .setContent(markerText);
                //            */

                //             let markerText = "<span class='info-popup'><table><tr><td><B>Category: </B>" + this.ciLayer.humanName + "</td></tr><tr><td><B>ID: </B>" + value + "</td></tr><tr><td style='text-align: center;'><a id='infoButton' class='btn infoBtn' onClick=$('#modal1').openModal();>More Info</a></td></tr></table></span>";
                //             // Add click event handler to marker text link
                //             //let infoButtonElement = $('#infoButton');

                //             $('.modal-content')[0].innerText = this.markerPropertiesToString(feature.properties);

                //             /*this.elRef.nativeElement.querySelector('#infoButton').addEventListener('click', (event) => {
                //                  console.log("info button clicked!");
                //                  $('#modal1').openModal();
                //             });*/

                //             /*if(infoButtonElement != null){
                //                 infoButtonElement.click( (event) => {
                //                     console.log("info button clicked!");
                //                     $('#modal1').openModal();
                //                 });
                //             }*/

                //             // setting x_bound and y_bound to fixed 300 px for now...hoping to have an internal method
                //             // called adjustPosition take care of this dynamically
                //             let popup: L.Rrose = <L.Rrose>new L.Rrose({ autoPan: false, x_bound: 300, y_bound: 300 }).setLatLng(latlng).setContent(markerText);

                //             // this lets me bind the popup to the markers
                //             markerToReturn.bindPopup(popup, { showOnMouseOver: true, closeButton: false });
                //         }


                //         /**  
                //          * 
                //          * if idField definied in ciLayer add to markerMap
                //          * for faster access to a node's dependencies
                //          * 
                //          */
                //         if (hasIdField) {
                //             var key = feature.properties[this.ciLayer.idField];
                //             this.markerMap.set(key, markerToReturn);
                //         }

                //         // add click event to markers
                //         markerToReturn.addEventListener('click', function (event: L.LeafletMouseEvent) {
                //             // clear previously click marker if not null
                //             if (LayerComponent.prevClickedMarker != null) {
                //                 LayerComponent.prevClickedMarker.setIcon(LayerComponent.prevClickedMarkerIcon);
                //             }

                //             $('.leaflet-popup-content').addClass('wait');
                //             let marker: L.Marker = event.target;

                //             // save static reference for marker in order to reset icon on next click event
                //             LayerComponent.prevClickedMarker = marker;
                //             // save static reference for marker's icon in order to reset icon style on next click event
                //             LayerComponent.prevClickedMarkerIcon = marker.options.icon;

                //             marker.setIcon(this.applyPulseIcon());
                //             var id = event.target.feature.properties[this.ciLayer.idField];
                //             var featureProperties: Object = { label: this.ciLayer.label, id: id, marker: marker };

                //             //Emit event for clicking on marker sending feature's properties up to layerlist
                //             this.markerClick.emit(featureProperties);
                //         }, this);

                //         return markerToReturn
                //     },

                //     style: function (feature) {
                //         {
                //             return {
                //                 className: featureType
                //             }
                //         }
                //     },

                // });

                // this.ciLayer.layerData = this.markers;
                // this.markers.addLayer(points);
                // this.markers.addTo(this.mapService.map);

                // Added to debug geojson function
                // tempPoints.addTo(this.mapService.map);

                this.onAdd();
                break;
            case "Polygon":
                var polygon = L.geoJSON(this.json, {

                    style: function (feature) {
                        {
                            return { className: featureType }
                        }
                    }
                });
                this.ciLayer.layerData = polygon;
                polygon.addTo(this.mapService.map);
                this.onAdd();
                break;
            case "MultiPolygon":
                var polygon = L.geoJSON(this.json, {

                    style: function (feature) {
                        {
                            return { className: featureType }
                        }
                    }
                });
                this.ciLayer.layerData = polygon;
                polygon.addTo(this.mapService.map);
                this.onAdd();
                break;
            case "LineString":
                var lineString = L.geoJSON(this.json, {

                    style: function (feature) {
                        if (feature.properties.LDLOSTPCT == 1) {
                            return { className: featureType + " power-off" };
                        } else {
                            return { className: featureType }
                        }
                    }
                });
                this.ciLayer.layerData = lineString;
                lineString.addTo(this.mapService.map);
                this.onAdd();
                break;
            default:
                break;
        }

    }

    private markerPropertiesToString(properties: Object): string {
        var valueToReturn: string = "";
        $.each(properties, function (key, value) {
            valueToReturn += key + ": " + value + "<BR>";
        });
        return valueToReturn;
    }

    customIcon() {
        var htmlString = '<div class="shape"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:' + this.ciLayer.icon.symbolColor + ';" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    customIconSemiTransparent() {
        var htmlString = '<div class="shape" style="opacity: 0.2;"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:' + this.ciLayer.icon.symbolColor + '; opacity:0.2;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    selectedCustomIcon() {
        var htmlString = '<div class="shape"><div style="background:#ED190E;" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    customClusterIcon(count: any) {
        var htmlString = '<div class="shape"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div class="notification"><span>' + count + '</span></div><div style="color:' + this.ciLayer.icon.symbolColor + ';" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    customClusterIconSemiTransparent(count: any) {
        var htmlString = '<div class="shape" style="opacity: 0.2"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div class="notification-semitransparent"><span>' + count + '</span></div><div style="color:' + this.ciLayer.icon.symbolColor + '; opacity:0.2;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    selectedCustomClusterIcon(count: any) {
        var htmlString = '<div class="shape"><div style="background:#ED190E;" class="' + this.ciLayer.icon.iconShape + '"></div></div><div class="notification"><span>' + count + '</span></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        return htmlString;
    }

    getHighlightedIconStyle(population): string {
        if(population == 1)
            return '<div class="shape"><div style="background:#ED190E;" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        else
            return '<div class="shape"><div style="background:#ED190E;" class="' + this.ciLayer.icon.iconShape + '"></div></div><div class="notification"><span>' + population + '</span></div><div style="color:#EFE553;" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
    }

    getUnHighlightedIconStyle(population): string {
        if(population == 1)
            return '<div class="shape"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:' + this.ciLayer.icon.symbolColor + ';" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div>';
        else
            return '<div class="shape"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' +  this.ciLayer.icon.iconShape + '"></div></div><div class="notification"><span>' + population + '</span></div><div style="color:' +  this.ciLayer.icon.symbolColor + ';" class="symbol"><i class="fa fa-' +  this.ciLayer.icon.symbol + '"></i></div>';
    }


    onAddToMap(event: L.LayerEvent) {
        console.log("onAddToMap called");
    }

    onLoadComplete() {
        console.log("loading complete");
        this.loading = false;
    }

    /**
     * Show Dependencies, invoked by callback from neo4j service
     */
    showDependencies(listOfDependencies: any) {

        // Set all icons to semi-transparent
        //this.setMarkersToSemiTransparent();

        // if selectedMarkers is already size > 0
        // save selectedMarkers as previouslySelectedMarkers
        // create new array to store newly selected Markers
        if (this.selectedMarkers.length > 0) {
            // save previous selectedMarkers
            this.previouslySelectedMarkers = this.selectedMarkers;
            // initial space in anticipation for new selected markers
            this.selectedMarkers = new Array<L.Marker>();
        }

        console.log("showing dependencies for " + this.ciLayer.humanName);

       //let markerClusterCollection: Array<L.MarkerCluster> = new Array();

        //let iconString: string = this.customIcon();

        // marker and parent marker if applicable
        //let selectedMarkerAndParent: Object

        if (listOfDependencies != null) {
            listOfDependencies.forEach(dependency => {
                
                var nodeMarker: PruneCriticalInfrastructureMarker = this.getPruneCriticalInfrastructureMaker(<number>dependency);
                
                // find the population of the cluster and then create an icon to show population 
                // if cluster has more than one marker contained in it, otherwise don't display population
                var highlightIcon = L.divIcon({
                    className: "custom-icon",
                    html: this.getHighlightedIconStyle(nodeMarker.GetParentCluster().population),
                    iconSize: L.point(30, 30),
                    iconAnchor: L.point(15, 15)
                });

                //set highlighted attribute to true for PruneCriticalInfrastructureMarker
                // and associated cluster also set icon of cluster to highlightIcon.
                nodeMarker.setHighlight(true, highlightIcon);
                
                // keep track of the markers that are highlighted
                this.selectedMarkersMap.set(<number>nodeMarker.data.ID,nodeMarker);
                
                //debug message
                console.log(this.selectedMarkersMap);

                //visibleParent should be a MarkerCluster Object
                //let visibleParent = this.markers.getVisibleParent(nodeMarker);

                // trying this
                //let parents = this.markers.getParents(nodeMarker);

                // If there is a visible parent and it's a MarkerCluster
                // Apply MarkerCluster selected style
                // if (visibleParent != null && visibleParent instanceof L.MarkerCluster) {
                //     var parentChildCount = visibleParent.getChildCount();
                //     iconString = this.selectedCustomClusterIcon(parentChildCount);
                //     var selectedClusterIcon = L.divIcon({
                //         className: "custom-icon",
                //         html: iconString,
                //         iconSize: L.point(30, 30),
                //         iconAnchor: L.point(15, 15)
                //     });
                //     visibleParent.setIcon(selectedClusterIcon);
                //     visibleParent.setOpacity(1);
                    // add parent node/marker to selectedMarkerMap

                    // create an object that holds the nodeMarker
                    // and its parent
                //     selectedMarkerAndParent = { marker: nodeMarker, parent: visibleParent };
                // }
                // else {
                    // create object that holds the node marker, parentless
                //     selectedMarkerAndParent = { marker: nodeMarker, parent: null };
                // }

                // nodeMarker.setHighlight("#ED190E", "#EFE553");
                // set to queried
                // used for mouseover mouseout logic
                // nodeMarker.setQueried();

                // turn off previous events 
                // for these markers

                /*
                nodeMarker.off('mouseover');
                nodeMarker.off('mouseout');

                // attach events to highlighted markers
                nodeMarker.on('mouseover', (event:L.LeafletMouseEvent) => {
                    //nodeMarker.openPopup();
                });

                nodeMarker.on('mouseout', (event:L.LeafletMouseEvent) => {
                    //nodeMarker.closePopup();
                });
                */


                // add marker and nodeId to selectedMarkersMap
                // this.selectedMarkersMap.set(dependency[0], selectedMarkerAndParent);
                // lets try just keeping track of nodeMarker instead of nodeMarker and parent
                // apparently the markers collection can be passed to refreshClusters
                // and it will just refresh the parents however how does that work if 
                // icons not built already ?

                // keeping track of parent cluster nodes for each node marker
                // if parents isn't nulll
                // if (parents != null) {
                //     this.selectedMarkers = new Array().concat(this.selectedMarkers, parents);
                // }
            });
        }
        // let's try rebuilding the icons
        //this.rebuildParentIcons = true;

        /********* THIS SHOULD BE REVISITED *********
         *  rebuild only the currently selected and previously 
         * selected cluster icons if there is a previous selection 
         * else for the first time rebuild all the icons
         * this may not be working correctly...still need to test
         * if(this.previouslySelectedMarkers.length > 0)
         * this.markers.refreshClusters(new Array().concat(this.selectedMarkers, this.previouslySelectedMarkers));
         * else
         ******** THIS SHOULD BE REVISITED ***********/

        //this.markers.refreshClusters();
    }

    // unhighlight highlighted markers
    deselectHighlightedMarkers(){
        this.selectedMarkersMap.forEach((nodeMarker) => {
            console.log(nodeMarker);
        });
    }

    findDownStreamDependencies(event){
        let leafletMarker:CriticalInfrastructureMarker = event.relatedTarget;
        leafletMarker.fireEvent('findDownstreamDependencies');
    }

    findUpStreamDependencies(event){
        let leafletMarker:CriticalInfrastructureMarker = event.relatedTarget;
        leafletMarker.fireEvent('findUpstreamDependencies');
    }

    getMarkerMap(): Map<Number, L.Marker> {
        return this.markerMap;
    }

    getPruneCriticalInfrastructureMaker(id: number): PruneCriticalInfrastructureMarker {
        var marker:PruneCriticalInfrastructureMarker = this.markerMap.get(id);
        return marker;
    }

    /* Old Code Needs to be removed eventually */
    getMarker(id: any): L.Marker {
        var marker: L.Marker = this.markerMap.get(id);
        return marker;
    }

    applyPulseIcon(): L.Icon {
        let pulseIcon = L.divIcon({
            className: 'pulse-effect',
            html: '<div style="margin: auto; top:0; bottom:0; left:0; right:0;" class="custom-icon"><div class="shape"><div style="background:' + this.ciLayer.icon.iconColor + ';" class="' + this.ciLayer.icon.iconShape + '"></div></div><div style="color:' + this.ciLayer.icon.symbolColor + ';" class="symbol"><i class="fa fa-' + this.ciLayer.icon.symbol + '"></i></div></div>',
            iconSize: L.point(58, 58)
        });
        return pulseIcon;
    }


    indexMarker(marker: PruneCluster.Marker): void {
        // casting here to make sure marker is a PruneCriticalInfrastructureMarker
        this.markerMap.set(<number>marker.data.ID, <PruneCriticalInfrastructureMarker>marker);
    }

    // make all markers semitransparent
    // this.markerMap should be built before calling this function
    setMarkersToSemiTransparent(): void {
        this.markerMap.forEach(marker => {

            // get semitransparent icon style
            //let iconString:string = this.customIconSemiTransparent();

            //if marker has a visible parent we need to set this to semitransparent too
            let visibleParent = this.markers.getVisibleParent(marker);

            // check first to see if visible parent exists and that it is a MarkerCluster
            if (visibleParent != null && visibleParent instanceof L.MarkerCluster) {

                // find out how many markers are clustered in this marker cluster
                // used for numbering aka notification style
                let parentChildCount = visibleParent.getChildCount();

                // get the style
                let iconString = this.customClusterIconSemiTransparent(parentChildCount);

                // create the custom div icon for marker cluster
                let semiTransparentClusterIcon = L.divIcon({
                    className: "custom-icon",
                    html: iconString,
                    iconSize: L.point(30, 30),
                    iconAnchor: L.point(15, 15)
                });

                // set visible parent to semiTransparent
                visibleParent.setIcon(semiTransparentClusterIcon);

                // applies transparency twice
                //visibleParent.setOpacity(0.2);
            }

            // if marker is the marker we just clicked on, don't apply semi-transparent style
            if (marker != LayerComponent.prevClickedMarker) {

                // otherwise see if it is already highlighted
                // if so clear the highlighted

                if (marker.isHighligthed()) {
                    marker.clearHighlight();
                }

                // make semi-transparent
                marker.setOpacity(0.2);

                // set to queried
                // used for mouseover mouseout logic
                // to work correctly before 
                // issuing a click event
                marker.setQueried();
            }
        });
    }

}
