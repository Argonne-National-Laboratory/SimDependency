import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

import { WktService } from '../services/wkt.service';

import * as $ from 'jquery';

@Component({
    selector: 'app-wkt',
    templateUrl: './wkt.component.html',
    styleUrls: ['./wkt.component.css']
})
export class WktComponent implements OnInit {

    private theFileUrl: string;
    private theFileName: string;
    private data: JSON;
    private dataString: string;
    private dataURI: any;
    private downloadURL: any;



    constructor(private http: Http, private wkt: WktService, private sanitizer:DomSanitizer) {
        this.theFileUrl = 'data/florida-counties.geojson';
        this.theFileName = this.theFileUrl.substring(this.theFileUrl.indexOf("/")+1,this.theFileUrl.length);
    }

    ngOnInit() {
        this.http.get(this.theFileUrl)
            .subscribe((res) => {
                this.data = res.json()
                this.addWktToProperties(this.data);
            });
    }

    addWktToProperties(json: any) {

        json.features.forEach((value) => {
            value.properties.wkt = this.wkt.getWKT(value.geometry);
        });

        this.data = JSON.parse("{}");
        
        // Data must be converted to blob to bypass download size constraints in Chrome
        var blob = new Blob([JSON.stringify(json)], {type: 'text/json'});
        
        // Angular sanitizes url's passed to template for unsafe content; Here we must manually override this feature
        this.downloadURL = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
    }

}
