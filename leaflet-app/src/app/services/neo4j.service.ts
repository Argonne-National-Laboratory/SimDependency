// Angular Core
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

// Interfaces
import { CriticalInfrastructureLayer } from '../interfaces/interfaces';

// 3rd Party
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Neo4jService {

    static Protocol: string = "http://";
    static Username: string = "neo4j";
    static Password: string = "SIMdep99!";
    static Domain: string = "146.137.56.15";
    static Port: string = "7474";
    static Api: String = "/db/data/cypher"
    static Endpoint: string = Neo4jService.Protocol + Neo4jService.Domain + ":" + Neo4jService.Port
    + Neo4jService.Api;

    static NewPort: string = "3000";
    static NewEndpoint: string = Neo4jService.Protocol + Neo4jService.Domain + ":" + Neo4jService.NewPort;

    private data: CriticalInfrastructureLayer[];

    private header: Headers;

    constructor(private http: Http) {
        this.data = DATA;
    }

    public getData() {
        return this.data;
    }

    /**
     * @description run a match query for a particular node having the values of label: nodeLabel and id nodeId that has a
     * CONNECTED_TO relationship to nodes of label conenctedToLabel
     * @argument - nodeId, the id of the node to be queried
     * @argument - nodeLabel, the label of the node to be queried
     * @argument - connectedToLabel, the label of the CONNECTED_TO nodes
     */
    public matchConnectedTo(nodeId: any, nodeLabel: any, connectedToLabel: any): Observable<any> {
        //let body = JSON.stringify({ "query": "MATCH (n:" + nodeLabel + " {" + nodeId + "})-[:CONNECTED_TO*..5]-(b:" + connectedToLabel + ") RETURN labels(b), b.id",
        // "params" : {} });

        let body = JSON.stringify({
            "query": "MATCH (n:" + nodeLabel + " {id:{NodeId}})-[:CONNECTED_TO*..5]-(b:" + connectedToLabel + ") RETURN b.id",
            "params": { "NodeId": nodeId }
        });


        let headers = new Headers({ 'Content-Type': 'application/json' });
        // Accept */* needed in order for REST calls to be successful in Firefox
        headers.append("Accept", "*/*");
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("authorization", "Basic " + btoa(Neo4jService.Username + ":" + Neo4jService.Password));
        return this.http.post(Neo4jService.Endpoint, body, { headers: headers })
            .catch(this.handleError);
    }

    /**
     * @description run a match query for a particular node based on query string and nodeId passed as arguments
     * @argument - nodeId, the id of the node to be queried e.g 31052
     * @argument - queryString, the query string with nodeId parameter placeholder identified by {NodeId} e.g MATCH (B:Bus {id:{NodeId}})-[:CONNECTED_TO]->(:WaterTreatment)....
     */
    public findMatches(nodeId: any, queryString: string): Observable<any> {
        let body = JSON.stringify({ "query": queryString, "params": { "NodeId": nodeId } });

        let headers = new Headers({ 'Content-Type': 'application/json' });
        // Accept */* needed in order for REST calls to be successful in Firefox
        headers.append("Accept", "*/*");
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("authorization", "Basic " + btoa(Neo4jService.Username + ":" + Neo4jService.Password));
        return this.http.post(Neo4jService.Endpoint, body, { headers: headers })
            .catch(this.handleError);
    }


    /**
     * Function for getting the types of infrastructre we want to get paths to
     */
    public findCategories(nodeLabel: any): Observable<any> {

        let body = JSON.stringify({ "query": "MATCH (a:DepModel {label:'" + nodeLabel + "'})-[:DEPENDS_ON*]->(b) WHERE NOT (b)-[:DEPENDS_ON]->() RETURN DISTINCT b.category" });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        // Accept */* needed in order for REST calls to be successful in Firefox
        headers.append("Accept", "*/*");
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("authorization", "Basic " + btoa(Neo4jService.Username + ":" + Neo4jService.Password));
        return this.http.post(Neo4jService.Endpoint, body, { headers: headers })
            .catch(this.handleError);
    }

    /**
     * Function for getting paths, this is called after the
     * results of findCategories has been determined
     * @param nodeLabel label of starting node
     * @param instrastructreCategories array of strings that represent infrastructure categories to find paths to
     */
    public findPaths(nodeLabel: string, category: string): Observable<any> {
        let body = JSON.stringify({ "query": "MATCH paths=(:DepModel {label: '" + nodeLabel + "'})-[:DEPENDS_ON*]->(:DepModel {category: '" + category + "'}) with nodes(paths) as p RETURN p" });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        // Accept */* needed in order for REST calls to be successful in Firefox
        headers.append("Accept", "*/*");
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("authorization", "Basic " + btoa(Neo4jService.Username + ":" + Neo4jService.Password));
        return this.http.post(Neo4jService.Endpoint, body, { headers: headers })
            .catch(this.handleError);
    }

    // removing headers for now
    public newMatchConnectedTo(nodeId: any, nodeLabel: any, downStream: boolean = true, filterLabel?: any){
        let headers = new Headers();
        headers.append('Access-Control-Allow-Origin', '*');
       
        if(downStream){
            let downStreamEndpoint;
            if(filterLabel)
                downStreamEndpoint = Neo4jService.NewEndpoint + `/api/node/${nodeLabel}/${nodeId}/depends_on/filter/${filterLabel}`;
            else   
                downStreamEndpoint = Neo4jService.NewEndpoint + `/api/node/${nodeLabel}/${nodeId}/depends_on`; 
            return this.http.get(downStreamEndpoint);  
        }
        else{
            let upStreamEndpoint;
            if(filterLabel)
                upStreamEndpoint = Neo4jService.NewEndpoint + `/api/node/${nodeLabel}/${nodeId}/required_by/filter/${filterLabel}`;
            else
                upStreamEndpoint = Neo4jService.NewEndpoint + `/api/node/${nodeLabel}/${nodeId}/required_by`;
            return this.http.get(upStreamEndpoint);
        }
    }

    private handleError(error: any) {
        var detailedError: string

        try {
            detailedError = JSON.parse(error.text()).toString();
        }
        catch (exception) {
            console.warn("Not JSON");
            detailedError = error;
        }
        console.error(detailedError);
        return Observable.throw(detailedError);
    }

}

// var DATA = [
//     {
//         "humanName": "Electrical Islands",
//         "layerName": "state1islands",
//         "featureType": "islands",
//         "fileUrl": "data/state1islands.geojson",
//         "visible": true
//     },
//     {
//         "humanName": "Electrical Lines",
//         "layerName": "state1lines",
//         "featureType": "lines",
//         "fileUrl": "data/state1lines.geojson",
//         "visible": true
//     }
// ]

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