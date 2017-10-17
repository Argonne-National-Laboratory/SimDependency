import { Component, OnInit } from '@angular/core';
import { Output } from '@angular/core';
import { ViewChild, ViewChildren } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { QueryList } from '@angular/core';
import { EventEmitter } from '@angular/core';

// Interfaces
import { CriticalInfrastructureLayer } from '../interfaces/interfaces';

// // Services & Directives
import { MapService } from '../services/map.service';
import { MaterializeDirective } from 'angular2-materialize';
import { CriticalinfrastructurelayerService } from '../services/criticalinfrastructurelayer.service';
import { Neo4jService } from '../services/neo4j.service';
import { LayerComponent } from './layer.component';

// 3rd Party
import { Map as LeafletMap, Layer, Marker } from 'leaflet';
import { Observable, Subscription } from 'rxjs/Rx';
declare var $: JQueryStatic;

@Component({
    selector: 'app-layerlist',
    templateUrl: './layerlist.component.html',
    styleUrls: ['./layerlist.component.css']
})
export class LayerlistComponent implements OnInit {

    /**
    * Provides Access to each child LayerComponent that is contained in this LayerListComponent
    */
    @ViewChildren(LayerComponent) layerComponents: QueryList<LayerComponent>;
    @Output("layerQueried") queried = new EventEmitter();

    // Array of critical infrastructure layers to load
    private layers: Array<CriticalInfrastructureLayer>;

    private layerAndNeo4jObservable: Map<LayerComponent, Observable<Object>>;
    
    // used to determine how many layers can be queried determined by the presence of idField property in CriticalInfrastructureLayers.js
    // for the purpose of knowing when all queryable layers have finished being queried.
    private numberOfQueryableLayers: number;

    /**
     * Produces a collection of Layer objects that will appear on the map
     * @constructor
     * @param {CriticalinfrastructurelayerService} - CriticalInfrastructureLayer service that renders layer data
     * @param {Neo4jService} - Class to communicate with neo4j graph database
     */
    constructor(private criticalInfrastructureLayerService: CriticalinfrastructurelayerService, private neo4jService: Neo4jService) {
        this.layerAndNeo4jObservable = new Map<LayerComponent, Observable<Object>>();
        this.numberOfQueryableLayers = 0;
    }

    ngOnInit() {

        this.layers = new Array<CriticalInfrastructureLayer>();
        this.criticalInfrastructureLayerService.getData().forEach( (observable) => {
            observable.subscribe( (ciLayer) => {
                this.addLayer(ciLayer);
            },
                err => console.error(err),
                () => console.log("observer complete"));
        });
    }

    /**
     * Add new Layer to LayerList
     * @argument ciLayer: CriticalInfrastructureLayer - instance of criticalinfrastructurelayer to be added to list of layers
     */
    addLayer(ciLayer: CriticalInfrastructureLayer) {
        console.log("layer " + ciLayer.humanName + " added ");
        this.layers.push(ciLayer);

        // update queryable layer count
        // by checking for presence of idField
        if (ciLayer.hasOwnProperty('idField')) {
            this.numberOfQueryableLayers++;
            console.log(this.numberOfQueryableLayers);
        }
    }

    /**
     * Event that is fired when a CriticalInfrastructureLayer is added to the map
     * @param {Layer} - The Leaflet layer object that was added 
     */
    onLayerAdd(layerData: Layer) {
        console.log("adding new layer");
    }

    /** 
     * Event that is fired when a CriticalInfrastructureLayer is removed from the map
     * @param {Layer} - The Leafley layer object that was removed
     */
    onLayerRemove(layerData: Layer) {
        console.log("removing layer");
    }

    /**
     * Function that is fired when downstream dependencies query clicked
     * @argument featureProperties: any - The featureProperties contain information about the type of pin that was clicked
     */
    onDownstreamOrUpstreamClicked(featureProperties: any) {
        console.log(featureProperties);

        // get id of marker (corresponds to a mirror/shadow node in neo4j)
        let nodeId = featureProperties.data.ID;
        
        // get node label of marker so we know which category of nodes to look at in neo4j
        let nodeLabel = featureProperties.data.label;
        
        // get the leaflet marker
        let marker:L.Marker = featureProperties.marker;
        
        // will this be a downstream query or an upstream query?
        // true or false
        let downStream:boolean = featureProperties.downstream;

        //Set cursor to hourglass
        document.body.style.cursor = 'wait';
        this.queried.emit(document.body.style.cursor);

       

        /**
         * used for building dependency 
         * categories for this node
         */
        
        // loop through all the layers and see if there are dependencies
        this.layerComponents.forEach((layerComponent) => {

        
            let filter = layerComponent.ciLayer.label
            // filter only populated if layer has point data
            if(filter != null){

                this.neo4jService.newMatchConnectedTo(nodeId, nodeLabel, downStream, filter).subscribe(neo4JResponseObj => {
                    console.log(`Building Upstream Dependencies For ${nodeLabel} : ${nodeId} for the ${filter} layer`);
                
                    // parse new list of dependencies to send back to layer
                    let listOfDependencies:Array<number> = new Array<number>();
                    if( neo4JResponseObj.json() instanceof Array){
                        let response:Array<any> = neo4JResponseObj.json();
                        response.forEach( (neo4JNode) =>{
                            // get id of node
                            let id:number = neo4JNode._fields[0].properties.id.low;
                            // add it to list of dependencies
                            listOfDependencies.push(id);
                        });

                        // check if array is not empty
                        // if so send to layer to highlight dependencies
                        if(listOfDependencies.length > 0){
                            layerComponent.showDependencies(listOfDependencies);
                        } 
                    }

                }, (err) => {
                    console.error(err);
                }, ()=> {
                    console.log("All Dependencies Found");
                });
            }
        });
    }


    /** Used to pass marker info click event up to map component */
    onLayerMarkerInfoClicked() {
        
    }

    /**
     * used to build a cyper query string for to get dependent nodes
     */
    cypherQuery(arrayOfDependencies: any, filter: String) {
        let stringToReturn = "";

        arrayOfDependencies.forEach((path, index) => {

            if (index == 0) {
                stringToReturn = this.buildQuery(path, filter, path[0]);
            } else {
                stringToReturn += " UNION " + this.buildQuery(path, filter, path[0]);
            }

        
          
            // IE 11 doesn't include "includes" in string prototype
            //if (path.includes("Bus") && path.indexOf("Bus") != 0) {
            if(path.indexOf("Bus") != 0){
                let tempArray = path.slice(0, path.indexOf("Bus") + 1);

                stringToReturn += " UNION " + this.buildQuery(tempArray, filter, tempArray[0]);
            }

            // IE 11 doesn't include "includes" in string prototype
            //if (path.includes("Bus") && path.indexOf("Bus") == 0) {

            if(path.indexOf("Bus") == 0){
                // First Build (:Bus {id:ID})-[:CONNECTED_TO*..5]->(:Bus)-[:CONNECTED_TO]->(:NodeLabelN)
                stringToReturn += " UNION " + this.buildQueryForInitialBusNode(path, filter);
                // Then Build (:Bus {id:ID}-[CONNECTED_TO*..5]->(:Bus))
                let tempArray = path.slice(0, path.indexOf("Bus") + 1);
                stringToReturn += " UNION " + this.buildQueryForInitialBusNode(tempArray, filter);
            }

        });

        return stringToReturn;
    }

    buildQuery(arrayOfDependencies: Array<String>, filter: String, startingLabel: String) {
        let tempArray = arrayOfDependencies;
        let queryString = "MATCH path=";
        let connectedToString = "-[:CONNECTED_TO]->";
        let busString = "(:Bus)-[:CONNECTED_TO*..5]->(:Bus)"
        let collectNodeString = "WITH nodes(path) as n UNWIND n as nodes";
        let filterString = "";
        let returnString = "RETURN DISTINCT nodes.id";

        if (filter != null && filter != undefined && filter.length > 0) {
            filterString = "WITH nodes WHERE '" + filter + "' IN labels(nodes)";
        }

        tempArray.forEach(function (element, index, array) {

            if (element != "Bus" /*&& startingLabel != "Bus"*/) {


                if (index == 0) {
                    queryString += "(:" + element + " {id:{NodeId}})";
                } else {
                    queryString += "(:" + element + ")";
                }

                if (index < (array.length - 1)) {
                    queryString += connectedToString;
                }

            } else if (element == "Bus" && startingLabel != "Bus") {
                queryString = queryString + busString;

                if (index < (array.length - 1)) {
                    queryString += connectedToString;
                }
            } else if (element == "Bus" && startingLabel == "Bus") {

                if (index == 0) {
                    queryString += "(:" + element + " {id:{NodeId}})";
                } else {
                    queryString += "(:" + element + ")";
                }

                if (index < (array.length - 1)) {
                    queryString += connectedToString;
                }
            }
        });

        // Apply filter & return string
        queryString += " " + collectNodeString + " " + filterString + " " + returnString;

        return queryString;

    }

    buildQueryForInitialBusNode(arrayOfDependencies: Array<String>, filter: String) {
        let tempArray = arrayOfDependencies;
        let queryString = "MATCH path=";
        let connectedToString = "-[:CONNECTED_TO]->";
        let busString = "-[:CONNECTED_TO*..5]->(:Bus)"  // differs from busString in buildQuery as first node is a Bus node itself
        let collectNodeString = "WITH nodes(path) as n UNWIND n as nodes";
        let filterString = "";
        let returnString = "RETURN DISTINCT nodes.id";

        if (filter != null && filter != undefined && filter.length > 0) {
            filterString = "WITH nodes WHERE '" + filter + "' IN labels(nodes)";
        }

        tempArray.forEach(function (element, index, array) {

            // first time through the loop immediately add the intial node version of busString
            // on to (:Bus {id:ID})
            if (index == 0) {
                queryString += "(:" + element + " {id:{NodeId}})" + busString;
            } else {
                // else add subsequent nodes to query statement
                queryString += "(:" + element + ")";
            }

            // while not end of path add -[:CONNECTED_TO]->
            if (index < (array.length - 1)) {
                queryString += connectedToString;
            }

        });

        // Apply filter & return string
        queryString += " " + collectNodeString + " " + filterString + " " + returnString;

        return queryString;

    }

}
