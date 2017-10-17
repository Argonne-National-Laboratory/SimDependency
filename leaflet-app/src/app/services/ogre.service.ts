// Angular Core
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

// 3rd Party
import { Observable } from 'rxjs/Observable';

@Injectable()
export class OgreService {

  static Server: string = "http://ogre.adc4gis.com/";
  static ApiUrl: string = "convert"
  static ServerWithApi = OgreService.Server + OgreService.ApiUrl;

  private headers: Headers;

  constructor(private http: Http) {

  }

  // Converts shapefile data to GeoJSON 
  public convert(file: any): Observable<L.GeoJSON> {
    let body = new FormData();
    body.append('upload', file);
    let headers = new Headers({ 'Content-Type': 'multipart/form-data' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(OgreService.ServerWithApi, body)
      .map((response: Response) => <L.GeoJSON>response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    var detailedError: string = Array(JSON.parse(error.text()).errors).toString();
    console.error(detailedError);
    return Observable.throw(detailedError || 'Server error');
  }

}
