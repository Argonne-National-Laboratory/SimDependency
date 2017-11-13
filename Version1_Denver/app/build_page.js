// This adds all the layers built in layers.js
// ourLayers.forEach(function(layerObj, layerName) {
//   if (layerObj.enable) {
//     layerObj.layer.addTo(map);
//     jQuery("#"+layerObj.divId).addClass("enabled", 400, "swing");
//   }
// });


// This sets up the upper right layer show/hide navigation
function buildControls(ourLayers) {
  var layers = ""
  ourLayers.forEach(function(layerObj, layerName) {
    layers+="<span class=\"toggle\" id='"
        +layerObj.divId+"' onclick=\"toggleLayer('"
        +layerObj.layerName+"');\">"
        +layerObj.humanName+"</span><br />";
  });
jQuery("#layer_content").html(layers);
}

// This sets up sidebars for company information
window.sidebar = false;

/**
 * Open a sidebar loading the content from the ashburn spreadsheet based on the callname
 *
 * @param {String} callname as it appears in ashburn_FOUO.csv
 */
function openSidebar(callname) {
 if (!window.sidebar) {
   jQuery("#sidebar").show(400, "swing");
   jQuery("#sidebar_close").show(400, "swing");
   window.sidebar = true;
 }
 jQuery("#sidebar").load(img_prefix + "companies/" + callname + ".html");
}

/**
 * Close the sidebar
 */
function closeSidebar() {
 jQuery("#sidebar").hide(400, "swing");
 jQuery("#sidebar_close").hide(400, "swing");
 window.sidebar = false;
}

// this fills in the layer content div (currently hidden by default)


// This builds the rest of the page on a 1 second delay
setTimeout(function() {
 jQuery("#loading").hide(400, "swing");
 jQuery("#fwrw").show(400, "swing");
 jQuery("button").button();
 jQuery("#fouo").hide(400, "swing");
 buildControls(window.ourLayers);
}, 4000);
