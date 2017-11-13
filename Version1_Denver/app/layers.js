var ourLayers = new Map();

/**
 * Global List of Coordinates From CSV Layers
 * Used to obtain list of coordinates for EM Animation
 */
var pointLayerEntries = new Array();


// Defaults and Globals.
jQuery("button").button();
window.controlsOn = false;

var cavalier = new L.geoJson();
cavalier.addTo(map);
$.ajax({
dataType: "json",
url: "data/Colorado/distributable-combined-networks-cavalier-fiber-CO-IF.geojson",
success: function(data) {
    $(data.features).each(function(key, data) {
        cavalier.addData(data);
    });
    cavalier.setStyle({color:"darkblue"});
}
}).error(function() {});

var integra = new L.geoJson();
integra.addTo(map);
$.ajax({
dataType: "json",
url: "data/Colorado/integra-network-fiber-network-CO-IF.geojson",
success: function(data) {
    $(data.features).each(function(key, data) {
        integra.addData(data);
    });
    integra.setStyle({color:"#2D882d"});
}
}).error(function() {});

var upn = new L.geoJson();
upn.addTo(map);
$.ajax({
dataType: "json",
url: "data/Colorado/upn-networks-fiber-external-CO-IF.geojson",
success: function(data) {
    $(data.features).each(function(key, data) {
        upn.addData(data);
    });
    upn.setStyle({color:"steelblue"});
}
}).error(function() {});

var zayometro = new L.geoJson();
zayometro.addTo(map);
$.ajax({
dataType: "json",
url: "data/Colorado/zayo-us-network-metro-consolidated-CO.geojson",
success: function(data) {
    $(data.features).each(function(key, data) {
        zayometro.addData(data);
    });
    zayometro.setStyle({color:"#226666"});
}
}).error(function() {});

ourLayers.set("ZayoMetroFiber", new ciLayer(
  "ZayoMetroFiber",
  "Zayo Metro Fiber",
  zayometro,
  true));

ourLayers.set("Integra", new ciLayer(
  "Integra",
  "Integra Fiber",
  integra,
  true));

ourLayers.set("UPN", new ciLayer(
  "UPN",
  "UPN Fiber",
  upn,
  true));
// This adds the shapefile to the window object to be accessed later.
// // This builds markers from a datacenter spreadsheet.  the csv should be sanitized to only
// // include the needed columns on the web server.
d3.csv(prefix+'denver.csv')
  .get(function (error, rows) {

    // Array of coords
    var coords = new Array();

    for (i = 0; i < rows.length; i++) {
      if (rows[i].LatLng) {
        try {
          latlng = rows[i].LatLng.split(",");
          lat = parseFloat(latlng[0])
          lng = parseFloat(latlng[1])

          // add coordinates to coords array
          coords.push([lat, lng]);

          var marker = L.marker([lat, lng], {
            icon: dcIcon
          });

          marker.bindPopup("<table class=popup><tr><td colspan=3><img class=logo src=" + rows[i].Logo + " /></td></tr>" +
            "<td><a href=# onclick=openSidebar(\"" + rows[i].Callname + "\");><img src=logos/info.png /></a></td>" +
            "<td><a target=_blank href=" + rows[i].Wikipedia + "><img src=logos/wikipedia.png /></a></td>" +
            "<td><a target=_blank href=" + rows[i].Homepage + "><img src=logos/home.png /></a></td></tr></table>");


          // add Marker to markerClusterGroup
          markerCluster.addLayer(marker);
          placed++;
        } catch(err) {
          console.log("garbage in latlng field");
        }
      }
    }
    total_count = rows.length;
    // create PointLayerEntry for layer
    createPointLayerEntry("ashburn_FOUO", coords);
  });

// add markerClusterGroup to map
markerCluster.addTo(map);

/**
 * Used to create an entry in the global list of point layer entries
 * layerName - string key used to identify array of coordiantes in pointLayerEntries
 * coords - array of floating point lat and lon entries
*/
function createPointLayerEntry(layerName, coords) {
  pointLayerEntries [layerName] = coords;
}

/**
 * Returns array of coordinates for given layerName
 */
function getCoordinatesFrom(layerName) {
  return pointLayerEntries [layerName];
}

/**
 * Create Point Layer Entry for Paths
 */
function createPointLayerEntryForPath(layerName, path){

   // array of coordinates
    var coords = new Array();

    // array of timings
    var timings = new Array();

  for(i=0; i<path.length; i++){
     // add path coordinate to array
     coords.push(path[i]);
  }
   // add point layer entry for layerName
    createPointLayerEntry(layerName, coords);
}
