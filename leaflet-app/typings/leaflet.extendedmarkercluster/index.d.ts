
// Type definitions for Leaflet.markercluster v0.4.0
// Project: https://github.com/Leaflet/Leaflet.markercluster
// Definitions by: Robert Imig <https://github.com/rimig>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="leaflet" />
/// <reference types="leaflet.markercluster" />

declare namespace L {

    // fix ommission of options from typings interface in official typings for 
    // leaflet.
    export interface Marker{
        options?:MarkerOptions;
    }

    var CriticalInfrastructureMarker: {
        /**
         * Instantiates a CriticalInfrastructureMarker Object
         * 
         * @constructor
         */
        new(latlng: LatLngExpression, options?:MarkerOptions): CriticalInfrastructureMarker;
    }

    export interface CriticalInfrastructureMarker extends Marker {
     
        /**
         * Change the  formatting to make the icon look highlighted
         * according to colors specified in attributes to this function
         */
        setHighlight(markerColor: string, symbolColor: string): void;

        /**
         * Reset to previous style
         */
        clearHighlight(): void;

        /**
         * Returns true if highlighted
         */
        isHighlighted(): boolean;

        /** 
         * sets queried to true 
         */
        setQueried(): void;
    }
    
    export interface PopupOptions{
        showOnMouseOver?: boolean,
        x_bound?: number;
        y_bound?: number;
    }

    var Rrose: {
        /**
         *  Instantiates a Rrose Object
         * 
         * @constructor
        */
        new(options?: PopupOptions, source?: any): Rrose;
    }

    export interface Rrose extends Popup{

        updateDirection(): void;

    }

}