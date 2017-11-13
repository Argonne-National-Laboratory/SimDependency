mapLink =
 '<a href="http://openstreetmap.org">OpenStreetMap</a>';
var osm = L.tileLayer(
 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 // For Offline: 'osm/{z}/{x}/{y}.png', {
   attribution: 'Map data &copy; ' + mapLink
 , });

var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &cosy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
 center: [39.748419, -104.991075]
 , zoom: 15
 , layers: [esri]
 , contextmenu: true
 , contextmenuWidth: 140
 , contextmenuItems: [{
   text: 'Show coordinates'
   , callback: showCoordinates
  }, {
   text: 'Center map here'
   , callback: centerMap
  }, '-', {
   text: 'Zoom in'
   , icon: img_prefix+'media/images/zoom-in.png'
   , callback: zoomIn
  }, {
   text: 'Zoom out'
   , icon: img_prefix+'media/images/zoom-out.png'
   , callback: zoomOut
  }]
});
var baseMaps = {
  "Esri": esri,
 "OpenStreetMaps": osm
 , "Satellite": sat
}

var markers = new Map;
var lines = new Map;
var overlayMaps = null
L.control.scale().addTo(map);

var markerCluster = new L.markerClusterGroup({
 iconCreateFunction: function (cluster) {
   var markers = cluster.getAllChildMarkers();
   var n = 0;
   for (var i = 0; i < markers.length; i++) {
     n += 1; //markers[i].number;
   }
   ourIcon = new L.NumberedDivIcon({
     number: n
   });
   return ourIcon;
 }
});

var layercontrol = L.control.layers(
 baseMaps
 , overlayMaps, {
   position: 'bottomleft'
 }).addTo(map);
var userpins = new L.FeatureGroup();
var total_count = 0;
var placed = 0;

// Reference to buffer used to determined if location is within 805m (0.6 mi) radius of beaumeade circle
// buffer object instantiated in playEMAnimation
var beaumeadeBuffer;

// center point for beaumeadeBuffer
const beaumeadeCenter = L.latLng(39.01945, -77.45996);  

// making a universal starting point for this app,
// Village at Leesburg
const startingLocation = L.latLng(39.090824, -77.522368);

function disableMapInteraction(mapId) {
    mapId.dragging.disable();
    mapId.touchZoom.disable();
    mapId.doubleClickZoom.disable();
    mapId.scrollWheelZoom.disable();
    mapId.boxZoom.disable();
    mapId.keyboard.disable();
    if (mapId.tap) mapId.tap.disable();
    // document.getElementById('mapId').style.cursor = 'default';
}

function enableMapInteraction(mapId) {
  mapId.dragging.enable();
  mapId.touchZoom.enable();
  mapId.doubleClickZoom.enable();
  mapId.scrollWheelZoom.enable();
  mapId.boxZoom.enable();
  mapId.keyboard.enable();
  if (mapId.tap) mapId.tap.enable();
  // document.getElementById('mapId').style.cursor='grab';
}

function countdown(kfnum, length) {
  $("#countdown-kf"+kfnum).attr("data-timer", length);

  $("#countdown-kf"+kfnum).TimeCircles({
    time: {
      Days: {
        show: false
      }
      , Hours: {
        show: false
      }
      , Minutes: {
        show: false
      }
      , Seconds: {
        color: "#aeaeae"
      }
    }
    , total_duration: length
    , use_background: true
    , circle_bg_color: "#ffffff"
    , bg_width: 1
    , fg_width: .2
    , direction: "Clockwise"
    , start: false
    , count_past_zero: false
  });

  $("#countdown-kf"+kfnum).TimeCircles().addListener(countdownCallback);
  $("#countdown-kf"+kfnum).TimeCircles().start();
}

function countdownCallback(unit, value, total) {
  if (total == 0) {
    //$("#countdown").attr("data-timer", 0);   
    //$("#countdown").TimeCircles().destroy();
    this.TimeCircles().rebuild();
  }
}

/**
 * Shows the current coordinates in an alert.
 * 
 * @param {object} e event object
 */
function showCoordinates(e) {
 alert(e.latlng);
}

/**
 * Centers the map on the clicked point
 * 9
 * @param {object} e event object
 */
function centerMap(e) {
 map.panTo(e.latlng);
}

/**
 * Zooms on the current mouse location
 * 
 * @param {object} e event object
 */
function zoomIn(e) {
 map.zoomIn();
}

/**
 * Zooms on the current mouse location
 * 
 * @param {object} e event object
 */
function zoomOut(e) {
 map.zoomOut();
}
