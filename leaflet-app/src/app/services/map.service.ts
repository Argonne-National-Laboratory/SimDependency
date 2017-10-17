// Angular Core
import { Injectable } from '@angular/core';

// Interfaces
import { Location } from '../interfaces/location';

// 3rd Party
import { Map, TileLayer } from 'leaflet';

@Injectable()
export class MapService {

    map: Map;
    baseMaps: any;

    initLat: number;
    initLong: number;
    mapboxUrl: string;
    defaultZoom: number;
    maxZoom: number;
    accessToken: string;
    baseMap: any;
    mymap: any;

    constructor() {

        // This initializes the configuration vars for the leaflet map
        this.initLat = INITLAT;
        this.initLong = INITLONG

        this.mapboxUrl = MAPBOXURL;
        this.defaultZoom = DEFAULTZOOM;
        this.maxZoom = MAXZOOM;
        this.accessToken = ACCESSTOKEN;

        // Creates basemap tile layers
        this.baseMaps = {
            MapboxDark: L.tileLayer(this.mapboxUrl, {
                maxZoom: this.maxZoom,
                accesToken: this.accessToken,
                noWrap: true
            }), Esri: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                noWrap: true,
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            }),
            CartoDB: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                noWrap: true,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }),
            Satellite: L.tileLayer('https://api.mapbox.com/styles/v1/dfd0226/ciqyasj7k0004bnnf07z51btl/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGZkMDIyNiIsImEiOiJLTXhzZTk4In0.xiaueIBVCflW2St0LLlRMg', {
                noWrap: true,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            })
        };
    }

    disableMouseEvent(tag: string) {
        var html = L.DomUtil.get(tag);

        L.DomEvent.disableClickPropagation(html);
        L.DomEvent.on(html, 'mousewheel', L.DomEvent.stopPropagation);
    };

}

var INITLAT = 29.050768;
var INITLONG = -82.463379;
var MAPBOXURL = '//api.mapbox.com/styles/v1/dfd0226/cioyudtb6002abjnkh1v30m39/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGZkMDIyNiIsImEiOiJLTXhzZTk4In0.xiaueIBVCflW2St0LLlRMg';
var DEFAULTZOOM = 7, MAXZOOM = 18;
var ACCESSTOKEN = 'pk.eyJ1IjoiZGZkMDIyNiIsImEiOiJLTXhzZTk4In0.xiaueIBVCflW2St0LLlRMg';