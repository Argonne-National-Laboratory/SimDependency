export interface ILatLng {
    latitude: number;
    longitude: number;
}

export interface LeafletMapInterface {
    initLat: number;
    initLong: number;
    mapboxUrl: string;
    defaultZoom: number;
    maxZoom: number;
    accessToken: string;
    baseMap: any;
    mymap: any;
}

export interface CriticalInfrastructureLayer {
    layerName: string;
    humanName: string;
    fileUrl: string;
    featureType: string;
    layerData?: L.Layer;
    layerJson?: JSON,
    icon?: MapIcon;
    iconFile?: string;
    idField?: string;
    label?: string;
    visible: boolean;
}

export interface NarrativeItem {
    timeSlice: TimeSlice;
    imageArray: any;
    title: string;
    text: string;
}

export interface TimeSlice {
    layerArray: CriticalInfrastructureLayer[];
    sliceName: string;
    humanName: string;
    mapCenter?: L.LatLng;
    mapBounds?: L.LatLngBounds;
}

export interface MapIcon {
    iconFile?: string;
    iconShape: string;
    iconColor: string;
    symbol: string;
    symbolColor: string;
}