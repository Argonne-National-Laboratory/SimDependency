import { Component, OnInit } from '@angular/core';

// Interfaces
import { Location } from '../interfaces/location';

// Services
import {GeocodingService} from '../services/geocoding.service';
import {MapService} from '../services/map.service';
// 3rd Party
import { Map as LeafletMap} from 'leaflet';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit {

  address: string;

  private geocoder: GeocodingService;
  private map: LeafletMap;
  private mapService: MapService;

  constructor(geocoder: GeocodingService, mapService: MapService) {
    this.address = '';
    this.geocoder = geocoder;
    this.mapService = mapService;
  }

  ngOnInit() {
    this.mapService.disableMouseEvent('goto');
    this.mapService.disableMouseEvent('place-input');
    this.map = this.mapService.map;
  }

  goto() {
    if (!this.address) { return; }

    this.geocoder.geocode(this.address)
      .subscribe(location => {
        // adding null to supress error for second paramater 
        this.map.fitBounds(location.viewBounds, null);
        this.address = location.address;
      }, error => console.error(error));
  }

}
