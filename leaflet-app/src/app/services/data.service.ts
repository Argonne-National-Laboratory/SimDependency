// Angular Core
import { Injectable } from '@angular/core';

// Interfaces
import { CriticalInfrastructureLayer } from '../interfaces/interfaces';

// 3rd Party
import { Map as LeafletMap, Point } from 'leaflet';
declare var $: JQueryStatic;


@Injectable()
export class DataService {

  currentLayers: CriticalInfrastructureLayer[];

  constructor() {
    this.currentLayers = NAVBARDATA;

    //this.buildCypherQueries();
  }

  getData() {
    return this.currentLayers;
  }

  getFeatureTypes() {
    var arrayOfFeatures = new Array();
    var arrayToReturn = new Array();

    this.currentLayers.forEach(function (value: CriticalInfrastructureLayer, index: number, array: CriticalInfrastructureLayer[]) {
      arrayOfFeatures.push(value.featureType);
    });

    var arrayToReturn = arrayOfFeatures.filter(function (item, i, ar) { return ar.indexOf(item) === i; });

    return arrayToReturn;
  }

  addLayer(ciLayer: CriticalInfrastructureLayer) {
    this.currentLayers.push(ciLayer);
  }

  cypherQuery(arrayOfDependencies: any, initialNodeId: Number, filter: String) {
    let stringToReturn = "";

    stringToReturn += this.buildQuery(arrayOfDependencies, initialNodeId, filter);

    if (arrayOfDependencies.includes("Bus")) {
      let tempArray = arrayOfDependencies.slice(0, arrayOfDependencies.indexOf("Bus") + 1);

      stringToReturn += " UNION " + this.buildQuery(tempArray, initialNodeId, filter);
    }

    // console.log(stringToReturn);

  }

  buildQuery(arrayOfDependencies, initialNodeId, filter) {
    let tempArray = arrayOfDependencies;
    let queryString = "";
    let connectedToString = "-[:CONNECTED_TO]->";
    let busString = "buspath=(b)-[:CONNECTED_TO*0..3]-(c:Bus)-[:CONNECTED_TO*0..3]-(d:Bus)"
    let clickedNodeFilter = "WHERE clickedNode.id=" + initialNodeId;
    let busPathFilter = "";
    let collectNodeString = "";
    let filterString = "";
    let returnString = "RETURN DISTINCT nodes";

    if (filter != null && filter != undefined && filter.length > 0) {
      filterString = "WITH nodes WHERE '" + filter + "' IN labels(nodes)";
    }

    if (tempArray.includes("Bus")) {
      let busIndex = tempArray.indexOf("Bus")
      // console.log("Bus Index: " + busIndex);
      busPathFilter = "AND ALL (x IN nodes(buspath) WHERE (x:Bus))";

      // Array only contains "Bus"
      if (tempArray.length == 1) {
        queryString = "MATCH buspath=(clickedNode:Bus)-[:CONNECTED_TO*0..5]-(:Bus)";
        collectNodeString = "WITH DISTINCT nodes(buspath) as n UNWIND n as nodes";
      }

      // "Bus" is at the end of the array
      else if (busIndex == tempArray.length - 1) {
        queryString = "MATCH path=";
        let busStringWithID = "buspath=(b)-[:CONNECTED_TO*0..5]-(:Bus)";
        collectNodeString = "WITH DISTINCT nodes(path) + nodes(buspath) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index == 0) {
            queryString += "(clickedNode:" + element + ")" + connectedToString;
          } else if (index < array.length - 1) {
            queryString += "(:" + element + ")" + connectedToString;
          } else {
            queryString += "(b:Bus), " + busStringWithID;
          }
        })
      }

      // "Bus" is at the beginning of the array
      else if (busIndex == 0) {
        queryString = "MATCH ";
        collectNodeString = "WITH DISTINCT nodes(buspath) + nodes(path) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index == 0) {
            queryString += "buspath=(clickedNode:Bus)-[:CONNECTED_TO*0..5]-(b:Bus), path=(b)" + connectedToString;
          } else if (index < array.length - 1) {
            queryString += "(:" + element + ")" + connectedToString;
          } else {
            queryString += "(:" + element + ")";
          }
        })
      }

      // "Bus" is anywhere inside the array
      else {
        queryString = "MATCH path1=";
        collectNodeString = "WITH DISTINCT nodes(path1) + nodes(buspath) + nodes(path2) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index == 0) {
            queryString += "(clickedNode:" + element + ")" + connectedToString;
          } else if (index < busIndex || (index > busIndex && index < array.length - 1)) {
            queryString += "(:" + element + ")" + connectedToString;
          } else if (index == busIndex) {
            queryString += "(b:Bus), buspath=(b:Bus)-[:CONNECTED_TO*0..3]-(:Bus)-[:CONNECTED_TO*0..3]-(c:Bus), path2=(c)" + connectedToString;
          } else {
            queryString += "(:" + element + ")";
          }
        })
      }

    } else {
      queryString = "MATCH path=";
      collectNodeString = "WITH DISTINCT nodes(path) as n UNWIND n as nodes";

      tempArray.forEach(function (element, index, array) {

        if (index == 0) {
          queryString += "(clickedNode:" + element + ")";
        }
        if (index < tempArray.length - 1) {
          queryString += "(:" + element + ")" + connectedToString;
        } else {
          queryString += "(:" + element + ")";
        }

      })
    }

    // Apply filter & return string
    queryString += " " + clickedNodeFilter + " " + busPathFilter + " " + collectNodeString + " " + filterString + " " + returnString;

    return queryString;

  }

  reverseCypherQuery(arrayOfDependencies, initialNodeId, filter) {
    let stringToReturn = "";

    stringToReturn += this.buildReverseQuery(arrayOfDependencies, initialNodeId, filter);

    if (arrayOfDependencies.includes("Bus")) {
      let tempArray = arrayOfDependencies.slice(arrayOfDependencies.indexOf("Bus"), arrayOfDependencies.length);

      stringToReturn += " UNION " + this.buildReverseQuery(tempArray, initialNodeId, filter);
    }
  }

  buildReverseQuery(arrayOfDependencies: any, initialNodeId: Number, filter: String) {
    let tempArray = arrayOfDependencies;
    let queryString = "";
    let connectedToString = "-[:CONNECTED_TO]->";
    let busString = "buspath=(b)-[:CONNECTED_TO*0..3]-(c:Bus)-[:CONNECTED_TO*0..3]-(d:Bus)"
    let clickedNodeFilter = "WHERE clickedNode.id=" + initialNodeId;
    let busPathFilter = "";
    let collectNodeString = "";
    let filterString = "";
    let returnString = "RETURN DISTINCT nodes";

    if (filter != null && filter != undefined && filter.length > 0) {
      filterString = "WITH nodes WHERE '" + filter + "' IN labels(nodes)";
    }

    if (tempArray.includes("Bus")) {
      let busIndex = tempArray.indexOf("Bus")
      console.log("Bus Index: " + busIndex);
      busPathFilter = "AND ALL (x IN nodes(buspath) WHERE (x:Bus))";

      // "Bus" is at the end of the array
      if (busIndex == tempArray.length - 1) {
        queryString = "MATCH path=";
        let busStringWithID = "buspath=(b)-[:CONNECTED_TO*0..3]-(clickedNode:Bus)-[:CONNECTED_TO*0..3]-(:Bus)";
        collectNodeString = "WITH DISTINCT nodes(path) + nodes(buspath) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index < array.length - 1) {
            queryString += "(:" + element + ")" + connectedToString;
          } else {
            queryString += "(b:Bus), " + busStringWithID;
          }
        })
      }

      // "Bus" is at the beginning of the array
      else if (busIndex == 0) {
        queryString = "MATCH ";
        collectNodeString = "WITH DISTINCT nodes(buspath) + nodes(path) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index == 0) {
            queryString += "buspath=(:Bus)-[:CONNECTED_TO*0..3]-(:Bus)-[:CONNECTED_TO*0..3]-(b:Bus), path=(b)" + connectedToString;
          } else if (index < array.length - 1) {
            queryString += "(:" + element + ")" + connectedToString;
          } else {
            queryString += "(clickedNode:" + element + ")";
          }
        })
      }

      // "Bus" is anywhere inside the array
      else {
        queryString = "MATCH path1=";
        collectNodeString = "WITH DISTINCT nodes(path1) + nodes(buspath) + nodes(path2) as n UNWIND n as nodes";

        tempArray.forEach(function (element, index, array) {
          if (index < busIndex || (index > busIndex && index < array.length - 1)) {
            queryString += "(:" + element + ")" + connectedToString;
          } else if (index == busIndex) {
            queryString += "(b:Bus), buspath=(b:Bus)-[:CONNECTED_TO*0..3]-(:Bus)-[:CONNECTED_TO*0..3]-(c:Bus), path2=(c)" + connectedToString;
          } else {
            queryString += "(clickedNode:" + element + ")";
          }
        })
      }

    } else {
      queryString = "MATCH path=";
      collectNodeString = "WITH DISTINCT nodes(path) as n UNWIND n as nodes";

      tempArray.forEach(function (element, index, array) {

        if (index < tempArray.length - 1) {
          queryString += "(:" + element + ")" + connectedToString;
        } else {
          queryString += "(clickedNode:" + element + ")";
        }

      })
    }

    // Apply filter & return string
    queryString += " " + clickedNodeFilter + " " + busPathFilter + " " + collectNodeString + " " + filterString + " " + returnString;

    return queryString;

  }

}

var NAVBARDATA: CriticalInfrastructureLayer[] = [
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
    "visible": true
  },
  {
    "humanName": "Electric Buses",
    "layerName": "state1buses",
    "featureType": "buses",
    "fileUrl": "data/state1buses.geojson",
    "iconFile": "images/power.png",
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
    "humanName": "Fairfax County",
    "layerName": "fairfax",
    "featureType": "county",
    "fileUrl": "data/Fairfax_County_Border.zip",
    "visible": true
  }
]
