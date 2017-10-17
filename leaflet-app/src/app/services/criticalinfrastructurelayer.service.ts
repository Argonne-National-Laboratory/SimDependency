//Angular Core
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// Services
import { Neo4jService } from '../services/neo4j.service';

//Interfaces
import { CriticalInfrastructureLayer } from '../interfaces/interfaces';

// 3rd Party
import { Observable } from 'rxjs/Rx';
import 'rxjs/Rx';

@Injectable()
export class CriticalinfrastructurelayerService {

    private currentLayers: Array<CriticalInfrastructureLayer>;
    private observeCurrentLayers: Array<Observable<CriticalInfrastructureLayer>>;
    private neo4j: Neo4jService;

    constructor(private http: Http, neo4j: Neo4jService) {
        this.neo4j = neo4j;
        this.loadCriticalInfrastureLayers();
    }

    loadCriticalInfrastureLayers() {

        this.currentLayers = new Array<CriticalInfrastructureLayer>();
        this.observeCurrentLayers = new Array<Observable<CriticalInfrastructureLayer>>()

        //iterate through list of CriticalInfrastructureLayers getting data from each to parse
        this.neo4j.getData().forEach(ciLayer => {
            this.currentLayers.push(ciLayer);
            var currentLayer$ = new Observable<CriticalInfrastructureLayer>(observer => {
                observer.next(ciLayer);
                observer.complete();
                console.log("obserable started");
            });
            this.observeCurrentLayers.push(currentLayer$);
        });

    }

    getData(): Array<Observable<CriticalInfrastructureLayer>> {
        return this.observeCurrentLayers;
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

}
