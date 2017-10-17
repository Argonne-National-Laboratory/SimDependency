
var DATA = [
    {
        "humanName": "Natural Gas Buses",
        "layerName": "ngpp2buses",
        "featureType": "buses",
        "fileUrl": "data/ngpp2buses.geojson",
        "icon": {
            iconShape: "pin",
            iconColor: "#00cae9",
            symbol: "fire",
            symbolColor: "white"
        },
        "idField": "NGPP",
        "label": "NGBus",
        "visible": true
    },
    {
        "humanName": "Electric Buses",
        "layerName": "state1buses",
        "featureType": "buses",
        "fileUrl": "data/state1buses.geojson",
        //"iconFile": "images/power.png",
        "icon": {
            iconShape: "pin",
            iconColor: "#77B932",
            symbol: "plug",
            symbolColor: "white"
        },
        "idField": "BUS",
        "label": "Bus",
        "visible": true
    },
    {
        "humanName": "Electrical Islands",
        "layerName": "state1islands",
        "featureType": "islands",
        "fileUrl": "data/state1islands.geojson",
        "visible": true
    },
    {
        "humanName": "Electrical Lines",
        "layerName": "state1lines",
        "featureType": "lines",
        "fileUrl": "data/state1lines.geojson",
        "visible": true
    },
    {
        "humanName": "Hospitals",
        "layerName": "hospitals",
        "featureType": "hospitals",
        "fileUrl": "data/hospitals.geojson",
        "icon": {
            iconShape: "pin",
            iconColor: "#0000ff",
            symbol: "h-square",
            symbolColor: "white"
        },
        "idField": "OBJECTID",
        "label": "Hospital",
        "visible": true
    },
    {
        "humanName": "Government",
        "layerName": "government",
        "featureType": "government",
        "fileUrl": "data/govbuild.geojson",
        "icon": {
            iconShape: "pin",
            iconColor: "#016FB9",
            symbol: "briefcase",
            symbolColor: "white"
        },
        "idField": "OBJECTID",
        "label": "GovBuilding",
        "visible": true
    }
]