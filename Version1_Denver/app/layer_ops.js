var layer = new Map();
var file = new Map();
var divID = new Map();
var layerGroups = new Array();

/**
 * class to represent a critical infrastructure layer.
 *
 * A layer can be markers or shapes.  If icon is null, we expect it to
 * be a shape.  Otherwise, icon should be an icon object.
 *
 * @author thompsonm@anl.gov
 * @constructor
 * @param {string} layerName - programmatic name, no spaces or special chars
 * @param {boolean} humanName - human readable name for display
 * @param {string} fileName - file name to a shape file .zip
 * @param {string} divId - div id for associated html entities
 * @param {string} color - color to display the shape using
 * @param {object} icon - if a markers layer, the icon object for the markers
 * @param {boolean} enable - whether or not to be enabled on load
 */
function ciLayer(layerName, humanName, layer, enable) {
	this.layerName = layerName;
	this.humanName = humanName;
	this.layer = layer;
	// this.divId = divId;
	// this.color = color;
	// if (icon) {
	//   this.icon = icon
	//   this.isMarkers = true;
	// } else {
	//   this.isMarkers = false;
	// }
	this.enable = enable
};

/**
 * Toggles a particular layer on or off
 *
 * @param {String} layerName
 */
function toggleLayer(layerName) {
  layerObj = ourLayers.get(layerName);
  id = "#"+layerObj.divId;
  if (map.hasLayer(layerObj.layer)) {
    map.removeLayer(layerObj.layer);
  } else {
    map.addLayer(layerObj.layer);
  }
  jQuery(id).toggleClass("enabled", 500, "swing");
}

/**
 * Toggle all layers on or off.
 *
 * @param {boolean} onoff
 */

function toggleAll(onoff) {
	if (onoff == 1) {
	  ourLayers.forEach(function(layerObj, layerName) {
		  map.removeLayer(layerObj.layer);
		  jQuery("#"+layerObj.divId).removeClass("enabled", 500, "swing");
	  });
	} else {
	  ourLayers.forEach(function(layerObj, layerName) {
	    if (!map.hasLayer(layerObj.layer)) {
		  layerObj.layer.addTo(map);
		  jQuery("#"+layerObj.divId).addClass("enabled", 500, "swing");
	    }
	  });
    }
}

/**
 * after the layers are placed, we go back through them and add popups
 * based on what information exists inside the marker object that was created
 * from the shape file.
 *
 * This has to be called after the layers are placed and loaded, so probably
 * inside a setTimeout call
 *
 * @author thompsonm@anl.gov
 */
function setIcons() {
  window.tmpMarkers = new Array();
  ourLayers.forEach(function(layerObj, layerName) {
	if (layerObj.isMarkers) {
	  layerObj.layer.eachLayer(function(marker) {
	    marker.setIcon(layerObj.icon);
		window.tmpMarkers.push(marker);
	    lat = marker.getLatLng()["lat"];
	    lng = marker.getLatLng()["lng"];
	    if (marker.feature.properties.FACILITY) {
	      text = marker.feature.properties.FACILITY;
	      //jQuery.get("get_wikipedia_info/"+marker.feature.properties.FACILITY, function(data) {
			//text += "<br/>"+data;
		  //})
		} else if (marker.feature.properties.COMMONNAME) {
		  text = marker.feature.properties.COMMONNAME;
	    } else if (marker.feature.properties.COMPANY) {
		  text = marker.feature.properties.NAME+"<br />"+marker.feature.properties.COMPANY;
	    } else if (marker.feature.properties.SWITCH) {
		  text = "Switch: "+marker.feature.properties.SWITCH+"<br />Addr: "
		  +marker.feature.properties.SW_STREET;
	    } else {
		  text = marker.feature.properties
		}
	    marker.bindPopup(text);

	    //jQuery.get("is_in_electric_outage/"+lat+"/"+lng, function(data) {
		  if (window.inorout.get(lat) == "True") {
			marker.isOut = true;
		  } else {
			marker.isOut = false;
		  }
		//});
      });
    }
  });
}

/**
 * This is a one off function to display the power popup in the upper left.
 * may be useful for other projects or possibly in combination with the image
 * data member in timeSlice
 *
 * @author thompsonm@anl.gov
 */
function displayPowerDetails() {
  jQuery("#power_details").show(400, "swing");
}

/**
 * Slides the layer controls in and out.
 *
 * @author thompsonm@anl.gov
 */
function toggleLayerControls() {
    if (!window.controlsOn) {
        jQuery("#controlsX").css({
            "display": "inline"
        });
        //jQuery("#controls").css({"background-color": "rgba(25, 25, 25, 0.70)"});
        jQuery("#layer_control").css({
            "right": "330px"
        });
        window.controlsOn = true;
    } else {
        jQuery("#controlsX").css({
            "display": "none"
        });
        jQuery("#layer_control").css({
            "right": "0px"
        });
        window.controlsOn = false;
    }
}

// Removed computeNearestFiberLines, relocating to catline worker ajscilingo@anl.gov

function highlightNearestFiberLines(refLat, refLong, fiberArray, maxResults) {

    var lat = refLat;
    var long = refLong;
    var tempArray = fiberArray;
    var max = maxResults;

    var nearestFiberWorker = cw({
        computeNearestFiberLines: function(a) {
            var lat = a[0];
            var long = a[1];
            var array = a[2];
            var maxResults = a[3];

            var max;

            // Allows user to specify maximum number of returned results from sorted array
            if (maxResults === "undefined" || !maxResults || maxResults > array.length) {
                max = array.length;
            } else {
                max = maxResults;
            }

            // Regular expression to pull lat/long from array of fiber lines
            var regexp = /(\-?\d+(\.\d+)?)\,\s*(\-?\d+(\.\d+)?)/g;

            var tempArray = [],
                arrayToReturn = [];

            array.forEach(parseObject);

            // Each array entry is passed as a string, parsed for lat long
            // lat and long values are then computed relative to reference
            // location and the closest location is then computed
            function parseString(element, index, array) {
                var itemString = element;
                var shortestDistance = -1;
                var tempLat, tempLong;
                var result;

                do {
                    result = regexp.exec(itemString);
                    if (result) {

                        tempLat = parseFloat(result[0].split(",")[0].trim());
                        tempLong = parseFloat(result[0].split(",")[1].trim());

                        // console.log(typeof(tempLat) + ", " + typeof(tempLong));

                        var tempDistance = distance(lat, long, tempLat, tempLong);

                        if (shortestDistance == -1 || shortestDistance > tempDistance) {
                            shortestDistance = tempDistance;
                        }

                    }
                } while (result);

                tempArray.push({
                    indexInOriginalArray: index,
                    relativeDistance: shortestDistance
                })
            }

            function parseObject(element, index, array) {
                var arrayOfObjects = element;
                var shortestDistance = -1;
                var tempLat, tempLong;

                arrayOfObjects.forEach(function(element, index, array) {
                    tempLat = element.lat;
                    tempLong = element.lng;

                    var tempDistance = distance(lat, long, tempLat, tempLong);

                    if (shortestDistance == -1 || shortestDistance > tempDistance) {
                        shortestDistance = tempDistance;
                    }

                });

                tempArray.push({
                    indexInOriginalArray: index,
                    relativeDistance: shortestDistance
                })
            }
            // Computes the shortest distance on the globe between lat/long points
            function distance(lat1, long1, lat2, long2) {

                if (lat1 < 0) {
                    lat1 += 360;
                }

                if (lat2 < 0) {
                    lat2 += 360;
                }

                if (long1 < 0) {
                    long1 += 360;
                }

                if (long2 < 0) {
                    long2 += 360;
                }

                // console.log(typeof(lat1) + ", " + typeof(long1) + ", " + typeof(lat2) + ", " + typeof(long2));

                var R = 6371000.0; // metres
                var phi1 = lat1 * Math.PI / 180;
                var phi2 = lat2 * Math.PI / 180;
                var deltaPhi = (lat2 - lat1) * Math.PI / 180;
                var deltaLambda = (long2 - long1) * Math.PI / 180;

                // console.log("phi1: " + phi1 + "phi2: " + phi2 + "deltaPhi: " + deltaPhi + "deltaLambda: " + deltaLambda);

                var a = (Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2)) + (Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2));
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return (R * c);
            }

            function compare(a, b) {
                if (a.relativeDistance < b.relativeDistance)
                    return -1;
                if (a.relativeDistance > b.relativeDistance)
                    return 1;
                return 0;
            }

            tempArray.sort(compare);

            for (var i = 0; i < max; i++) {
                arrayToReturn.push(tempArray[i]);
            }

            return arrayToReturn;

        }
    });

    nearestFiberWorker.computeNearestFiberLines([lat, long, tempArray, max]).then(function(a) {

        var nearestFiber;
        var polylineArray = new Array();

        nearestFiber = a;

        nearestFiber.forEach(getPolyline);


        function getPolyline(element, index, array) {
            var i = element.indexInOriginalArray;

            polylineArray.push(L.polyline(tempArray[i], {
                color: 'red'
            }));
        }

        var l_group_instance = L.layerGroup(polylineArray);
        layerGroups.push(l_group_instance);
        l_group_instance.addTo(map);

    }, function(err) {
        console.log(err);
    });
}

// Uses references from layerGroups to clear groups of fiber lines from map
function clearFiberLayerGroups() {
    while (layerGroups.length > 0) {
        map.removeLayer(layerGroups.pop());
    };
}
