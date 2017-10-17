import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

import { WktService } from '../services/wkt.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-clli',
  templateUrl: './clli.component.html',
  styleUrls: ['./clli.component.css']
})
export class ClliComponent implements OnInit {

private theFileUrl: string;
    private theFileName: string;
    private data: JSON;
    private dataString: string;
    private dataURI: any;
    private downloadURL: any;

    constructor(private http: Http, private sanitizer:DomSanitizer) {
        this.theFileUrl = 'data/zayo-us-network-network-buildings-CO.geojson';
        this.theFileName = this.theFileUrl.substring(this.theFileUrl.indexOf("/")+1,this.theFileUrl.length);
    }

    ngOnInit() {
        this.http.get(this.theFileUrl)
            .subscribe((res) => {
                this.data = res.json()
                this.addCLLIToProperties(this.data);
            });
    }

    addCLLIToProperties(json: any) {

      var clliRegex = /\s\S*$/;
      var tableRowFilter = /<tr.*?tr>/;

        json.features.forEach((value) => {
            // value.properties.clli = value.properties.description.match(clliRegex)[0].trim();
            // console.log(value.properties.description.replace(/\n/g, "").match(tableRowFilter));

            var tableBody = $("<div></div>").html(value.properties.description.replace(/\n/g, "")).children().filter("table").children().filter("tbody");

            value.properties.id = tableBody.children("tr:contains('ZAYO_BLDG_ID')").children()[1].innerText.trim();
            value.properties.category = tableBody.children("tr:contains('CATEGORY')").children()[1].innerText.trim();
            value.properties.netClass = tableBody.children("tr:contains('NET_CLASS')").children()[1].innerText.trim();
            value.properties.status = tableBody.children("tr:contains('STATUS')").children()[1].innerText.trim();
            value.properties.address = tableBody.children("tr:contains('ADDRESS')").children()[1].innerText.trim();
            value.properties.city = tableBody.children("tr:contains('CITY')").children()[1].innerText.trim();
            value.properties.state = tableBody.children("tr:contains('ST')").children()[1].innerText.trim();
            value.properties.zip = tableBody.children("tr:contains('ZIP')").children()[1].innerText.trim();
            value.properties.clli = tableBody.children("tr:contains('CLLI')").children()[1].innerText.trim();
        });

        this.data = JSON.parse("{}");
        
        // Data must be converted to blob to bypass download size constraints in Chrome
        var blob = new Blob([JSON.stringify(json)], {type: 'text/json'});
        
        // Angular sanitizes url's passed to template for unsafe content; Here we must manually override this feature
        this.downloadURL = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
    }

}
