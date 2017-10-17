
/// <reference types="leaflet" />

declare namespace L {
    export interface contextmenuitem {
        text? :string,
        separator?: boolean,
        index?: number,
        callback?: any
    }

    export interface MarkerOptions {
        contextmenu?: boolean,
        contextmenuItems?: contextmenuitem[]
    }
}
 
declare namespace L.Map {
    export interface MapOptions {
        contextmenu: boolean,
        contextmenuWidth: number,
        contextmenuItems?: contextmenuitem[]
    }
}
