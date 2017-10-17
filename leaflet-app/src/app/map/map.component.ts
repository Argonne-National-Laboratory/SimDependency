import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

// Interfaces
import { LeafletMapInterface, CriticalInfrastructureLayer } from '../interfaces/interfaces';
import { Location } from '../interfaces/location';

// Directives
import { MarkerComponent } from '../marker/marker.component';
import { LayerlistComponent } from '../layer/layerlist.component';

// Services
import { MapService } from '../services/map.service';
import { GeocodingService } from '../services/geocoding.service';

// 3rd Party
import { MouseEvent, Map, Marker } from 'leaflet';
declare var $: JQueryStatic;

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

	private mapService: MapService;
	private geocoder: GeocodingService;
	private fileParser: any;

	@Input() markerCount: number;
	@Output('basemapchange') baseMapChange = new EventEmitter();

	@ViewChild(MarkerComponent) markerComponent: MarkerComponent;
	@ViewChild(LayerlistComponent) layerListComponent: LayerlistComponent;

	constructor(mapService: MapService, geocoder: GeocodingService) {

		// Geocoder and mapService initialization
		this.mapService = mapService;
		this.geocoder = geocoder;

	}

	ngOnInit() {

		var mymapOptions = {
			zoomControl: false,
			center: L.latLng(this.mapService.initLat, this.mapService.initLong),
			layers: [this.mapService.baseMaps.MapboxDark],
			zoom: this.mapService.defaultZoom,
			maxZoom: this.mapService.maxZoom,
			contextmenu: true,	
			contextmenuWidth: 215,
			contextmenuItems: [{ text: 'Show Coordinates', callback: this.showCoordinates }]
		};

		var mymap = L.map('mapid',mymapOptions);

		mymap.on('layeradd', this.onLayerAddOrRemove);
		mymap.on('layerremove', this.onLayerAddOrRemove);

		L.control.zoom({ position: 'topright' }).addTo(mymap);
		L.control.layers(this.mapService.baseMaps).addTo(mymap);
		L.control.scale().addTo(mymap);

		this.mapService.map = mymap;

		this.mapService.map.on('baselayerchange', (e: L.MouseEvent) => {
			this.baseMapChange.emit(e);
		});

	}

	onMarkerRemove(markerCount: number) {
		this.markerCount = markerCount;
		console.log("Number of Markers On Map: " + this.markerCount);
	}

	onMarkerAdd(markerCount: number) {
		this.markerCount = markerCount;
		console.log("Number of Markers On Map:" + this.markerCount);
	}

	showCoordinates(event) {
		console.log(event.latlng.lng + "," + event.latlng.lat);
		alert(event.latlng.lng + "," + event.latlng.lat);
	}

	onLayerAddOrRemove(layerEvent: L.LayerEvent) {
		// if (layerEvent.layer instanceof L.Marker) {
		// 	//check to see if marker is also a marker cluster
		// 	if (layerEvent.layer instanceof L.MarkerCluster) {
		// 		// console.log("marker cluster");
		// 	}
		// 	else {
		// 		// console.log("marker");}
		// 	}
		// } 
		// else if (layerEvent.layer instanceof L.MarkerClusterGroup) {
		// 	// console.log("markercluster group");
		// } 

		// else if (layerEvent.layer instanceof L.Polygon) {
		// 	// console.log("polygon layer"); 
		// } else if (layerEvent.layer instanceof L.MultiPolygon) {
		// 	// console.log("multipolygon layer");
		// } else if (layerEvent.layer instanceof L.Polyline) {
		// 	// console.log("polyline");
		// } 
		
		// else if (layerEvent.layer instanceof L.GeoJSON) {
		// 	// console.log("geojson layer");
		// } else {
		// 	// console.log("some layer");
		// }
	}

	/**
	 * Adds new layer to LayerListComponent which in turn adds new layer to Map Control
	 * @argument ciLayer:CriticalInfrastructureLayer - the instance of the CritialInfrastructureLayer to add as a layer
	 */
	addToLayerList(ciLayer: CriticalInfrastructureLayer) {
		//ciLayer is passed down from app component and received by this component
		//ciLayer will be passed down from this component to the LayerListComponent
		console.log("calling layerListComponent addLayer");
		this.layerListComponent.addLayer(ciLayer);
	}

	/** fires when layerQueried  */
	/** changing event to any to avoid typing errors*/
	onLayerQueried(event: any) {
		let cursorState: string = event;
		document.getElementById('mapid').style.cursor = cursorState;
	}

	/** test callback for context menu */
	onTest(event: L.Event) {
		console.log("Test");
	}

	/** open bottom Modal */
	openModal() {
		$('#modal1').openModal();
	}

}
