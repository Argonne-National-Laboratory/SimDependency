// This is a hack for juniper pulse os compatibility.  See:
// https://wiki.inside.anl.gov/riscops/AJAX_Heavy_Websites_On_the_Juniper
/*  prefix = "https://ipgateway.dhs.gov/,DanaInfo=ashburnjuniper.risc.anl.gov,CT=zip,data/";
  img_prefix = "https://ipgateway.dhs.gov/,DanaInfo=ashburnjuniper.risc.anl.gov,/"
  coar_prefix = "https://ipgateway.dhs.gov/,DanaInfo=coar-staging.risc.anl.gov,";*/
// if (window.location.href.search("juniper") != -1) {
//   prefix = "https://iacd.iac.anl.gov/,DanaInfo=ashburnjuniper.risc.anl.gov,CT=zip,data/";
//   img_prefix = "https://iacd.iac.anl.gov/,DanaInfo=ashburnjuniper.risc.anl.gov,/"
//   coar_prefix = "https://iacd.iac.anl.gov/,DanaInfo=coar.risc.anl.gov,";
// } else {
  prefix = "data/";
  img_prefix = "/";
//  coar_prefix = "http://coar-staging.risc.anl.gov";
//}
var divTruck = L.divIcon({
  className: 'avatar'
  , html: '<img src=' + img_prefix + 'media/images/truck.png>'
  , iconSize: [48, 48]
  , iconAnchor: [32, 32]
})

var divPulse = L.divIcon({
  className: 'avatar'
  , iconSize: [128, 128]
})

var hatMan = L.icon({
  iconUrl: img_prefix+'media/images/construction-helmet.svg'
  , shadowUrl: null
  , iconSize: [64, 64]
  , shadowSize: [64, 64]
  , iconAnchor: [64, 64]
  , shadowAnchor: [64, 64]
  , popupAnchor: [-16, -32]
})

var dcIcon = L.icon({
  iconUrl: img_prefix + 'media/images/server.png'
  , shadowUrl: null
  , iconSize: [32, 32]
  , shadowSize: [32, 32]
  , iconAnchor: [32, 32]
  , shadowAnchor: [32, 32]
  , popupAnchor: [-16, -32]
})

var powerIcon = L.icon({
  iconUrl: img_prefix + 'media/images/power.png'
  , shadowUrl: null
  , iconSize: [32, 32]
  , shadowSize: [32, 32]
  , iconAnchor: [32, 32]
  , shadowAnchor: [32, 32]
  , popupAnchor: [-16, -32]
})

var downIcon = L.icon({
  iconUrl: img_prefix + 'media/images/down.png'
  , iconSize: [40, 30]
})

L.NumberedDivIcon = L.Icon.extend({
  options: {
    iconUrl: img_prefix + 'media/images/server.png'
    , number: ''
    , shadowUrl: null
    , iconSize: new L.Point(25, 41)
    , iconAnchor: new L.Point(13, 41)
    , popupAnchor: new L.Point(0, -33)
    , /*
    iconAnchor: (Point)
    popupAnchor: (Point)
    */
    className: 'leaflet-div-icon'
  },

  createIcon: function () {
    var div = document.createElement('div');
    var img = this._createImg(this.options['iconUrl']);
    var numdiv = document.createElement('div');
    numdiv.setAttribute("class", "number");
    numdiv.innerHTML = this.options['number'] || '';
    div.appendChild(img);
    div.appendChild(numdiv);
    this._setIconStyles(div, 'icon');
    return div;
  },

  //you could change this to add a shadow like in the normal marker if you really wanted
  createShadow: function () {
    return null;
  }
});
