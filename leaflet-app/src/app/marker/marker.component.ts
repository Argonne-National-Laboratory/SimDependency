// Angular Core
import { Component, OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { NgClass } from '@angular/common';

// Services
import {MapService} from '../services/map.service';

// 3rd Party
import { Map, MouseEvent, Marker } from 'leaflet';

@Component({
    selector: 'app-marker',
    templateUrl: './marker.component.html',
    styleUrls: ['./marker.component.css']
})
export class MarkerComponent implements OnInit {

    @Output()
    remove = new EventEmitter();

    @Output()
    add = new EventEmitter();

    editing: boolean;
    removing: boolean;
    markerCount: number;

    private mapService: MapService;

    constructor(mapService: MapService) {
        this.editing = false;
        this.removing = false;
        this.markerCount = 0;
        this.mapService = mapService;
    }

    ngOnInit() {
        this.mapService.disableMouseEvent('add-marker');
        this.mapService.disableMouseEvent('remove-marker');
        this.mapService.map.on('click', (e: L.MouseEvent) => {
            if (this.editing) {
                let marker = L.marker(e.latlng, {
                    icon: L.icon({
                        iconUrl: <any>('../../../node_modules/leaflet/dist/images/marker-icon.png'),
                        shadowUrl: <any>('../../../node_modules/leaflet/dist/images/marker-shadow.png')
                    }),
                    draggable: true
                })
                    .bindPopup('Marker #' + (this.markerCount + 1).toString(), {
                        offset: L.point(12, 6)
                    })
                    .addTo(this.mapService.map)
                    .openPopup();

                this.markerCount += 1;
                this.onAdd(this.markerCount);

                marker.on('click', (event: MouseEvent) => {
                    if (this.removing) {
                        this.mapService.map.removeLayer(marker);
                        this.markerCount -= 1;
                        this.onRemove(this.markerCount);
                    }
                });
            }
        });
    }

    Initialize() {

    }

    toggleEditing() {
        this.editing = !this.editing;

        if (this.editing == true && this.removing == true) {
            this.removing = false;
        }
    }

    toggleRemoving() {
        this.removing = !this.removing;

        if (this.editing == true && this.removing == true) {
            this.editing = false;
        }
    }

    // called on marker removed
    onRemove(markerCount: number) {
        this.remove.emit(markerCount);
    }

    // called on marker add
    onAdd(markerCount: number) {
        this.add.emit(markerCount);
    }

}
