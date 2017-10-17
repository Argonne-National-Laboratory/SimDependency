// Angular Core
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

// 3rd Party
import { Observable } from 'rxjs/Rx';

@Injectable()
export class FileparserService {

    private fileUrl: string;
    private fileType: string;
    private json: JSON;

    constructor(private http: Http) {

    }

    ngOnInit() {

    }

    parse(fileUrl: string, fileType: string) {
        this.fileUrl = fileUrl;
        this.fileType = fileType;

        switch (this.fileType) {
            case "geojson":
                this.getGeoJSON();
                break;
            case "shp":
                // this.getShp();
                break;
            /*case "zip":
                this.getZip();
                break; */
            default:
                break;
        }
    }

    getData(fileUrl: string, layerData?: L.Layer): Observable<JSON> {

        switch (this.getFileType(fileUrl)) {
            case "geojson":
                return this.loadGeoJSON(fileUrl);
            case "upload":
                return new Observable<JSON>(observer => {
                    // commenting out now to get past typing errors
                    //observer.next(layerData);
                    // revisit this line below
                    observer.next(JSON.parse(<any>layerData));
                    observer.complete();
                    console.log("upload observer complete");
                });
            default:
                break;
        }

    }

    getFileType(fileUrl: string) {
        return fileUrl.substring(fileUrl.lastIndexOf(".") + 1, fileUrl.length);
    }

    loadGeoJSON(fileUrl: string): Observable<JSON> {
        return this.http.get(fileUrl)
            .map((res: Response) => res.json());
    }

    getGeoJSON() {
        this.http.get(this.fileUrl)
            .map((res: Response) => res.json())
            .subscribe(
            data => {
                this.json = data;
            },
            err => console.error(err),
            () => console.log('done')
            );
    }

    getShp() {

    }

    /*getZip() {
        //var promise = this.webWorkerService.run(this.parseShp, this.fileUrl);
        //promise.then(result => console.log(result));

        var worker = cw(function (base, cb) {
            importScripts('js/shp.js');
            shp(base).then(cb);
        });

        worker.data(cw.makeUrl(this.fileUrl)).then(
            data => {
                console.log("returning shape data");
                this.json = data;
            });
    }*/

    /*(parseShp(fileUrl: string) {

        self.onmessage = function (e) {
            importScripts(e.data.url + 'js/shp.js');
        };

        shp(fileUrl).then(function (geojson) {
            return geojson;
        });
    }*/

    parseShp(data) {
        console.log("returning shape data");
        this.json = data;
    }

}
