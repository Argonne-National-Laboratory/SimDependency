// Interfaces
import { ILatLng } from './interfaces';

// 3rd Party
import { LatLngBounds, LatLngBoundsExpression } from 'leaflet';

export class Location implements ILatLng {
    latitude: number;
    longitude: number;
    address: string;
    viewBounds: LatLngBounds;
}