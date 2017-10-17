/// <reference types="leaflet" />

export class CriticalInfrastructureMarker extends L.Marker {
    private _highlightedStyle: string;
    private _unHighlightedStyle: string;
    private _highlighted: boolean;
    private _popup: any;
    private _options: L.MarkerOptions;

    constructor(latLng: L.LatLngExpression, options?: L.MarkerOptions, highlightedStyle?: string){
        super(latLng, options);
        this._popup = this.getPopup();
        this._options = options;
        if(options.icon instanceof L.DivIcon){
            this._unHighlightedStyle = (<any>options.icon).options.html;
            if(highlightedStyle)
                this._highlightedStyle = highlightedStyle;
        }
    }

    public bindPopup(content: any, options?: L.PopupOptions) : any {
        // call base class
        super.bindPopup(content, options); 

        // bind to mouse over
        this.on("mouseover", (event: L.MouseEvent) => {

            // get the element the mouse hovered onto
            let target = event.originalEvent.fromElement || event.originalEvent.relatedTarget;

            // get the parent div container
            let parent = this._getParent(target, "leaflet-popup");

            // check to see if the element is a popup and if so it is the marker's popup
            if(parent == this._popup._container)
                return true;

            this.setOpacity(1);
            this.openPopup();
        });
        
        this.on("mouseout", (event: L.MouseEvent) => {

            // get the element that the mouse hovered onto
            let target = event.originalEvent.toElement || event.originalEvent.relatedTarget;

            console.log("mouse out event - hovered on target: " + target);

            // check to see if the element is a popup
            if(this._getParent(target, "leaflet-popup")){
                console.log("attaching event listener to popup")
                L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
                return true;
            }

            // dim icon
            this.setOpacity(0.2);
            this.closePopup();

        });

        return this;
    }

    private _popupMouseOut (event:MouseEvent): any {

        //L.DomEvent.off(this._popup.getPane("leaflet-popup"), "mouseout", this._popupMouseOut, this);
        // going to try this over the L.DomEvent.off
        console.log("removing event listener");
        //this._popup.removeEventListener("mouseout", this._popupMouseOut);
        L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);

        // get the element that the mouse hovered onto
        let target = event.toElement || event.relatedTarget;

         console.log("popup mouse out event - hovered on target: " + target);

        // check to see if the element is a popup
        if (this._getParent(target, "leaflet-popup"))
            return true;
        
        // Might work? not sure
        //if(target == L.DomUtil.get('custom-icon')){
        //   return this;
        //}

        if(this._getParent(target, "shape"))
            return this;

        this.setOpacity(0.2);
        this.closePopup();
    }

    private _getParent(element: any, className: string): any {
        
        let parent = element.parentNode;

        while(parent != null){
            
            // Supressing for now.
            //console.log("getParent fired - parent: " + parent + " className: " + parent.className);

            if (parent.className && L.DomUtil.hasClass(parent, className)){
                console.log(parent.className + " found!");
                return parent;
            }
            parent = parent.parentNode;
        }

        return false;
    }

    public toggleHighLight(): void{
        if(this._highlighted)
        {
            // change highlighted state to false
            this._highlighted = false;
            this.unHighlightIcon();
        }
        else{
            // change highlighted state to false
            this._highlighted = true;
            this.highlightIcon();
        }
    }

    public setHighlight(state: boolean){
        this._highlighted = state;
        if(state){
           this.highlightIcon(); 
        }
        else{
            this.unHighlightIcon();
        }
    }

    private highlightIcon(){
        // if icon for this marker is DivIcon then edit style to HighlightedStyle
        if(this.options.icon instanceof L.DivIcon){
            // grab selected icon which will become our selected icon
            var toBeSelectedIcon:L.DivIcon = this.options.icon;
            // get its style
            // get its icon options
            var iconOptions = (<any>toBeSelectedIcon).options
            // set the icon to the new selected style
            this.setIcon(L.divIcon({iconSize: iconOptions.iconSize, iconAnchor: iconOptions.iconAnchor, popupAnchor: iconOptions.popupAnchor, className: iconOptions.className, html: this._highlightedStyle}));
        }
    }

    private unHighlightIcon(){
         // if icon for this marker is DivIcon then edit style to unHighlightedStyle
        if(this.options.icon instanceof L.DivIcon){
            // grab selected icon which will become our unselectedICon
            var toBeUnselectedIcon:L.DivIcon = this.options.icon
            // get its icon options
            var iconOptions = (<any>toBeUnselectedIcon).options
            // set the icon to the new selected style
            this.setIcon(L.divIcon({iconSize: iconOptions.iconSize, iconAnchor: iconOptions.iconAnchor, popupAnchor: iconOptions.popupAnchor, className: iconOptions.className, html: this._unHighlightedStyle})); 
        }
    }

    public isHighlighted(): boolean {
        return this._highlighted;
    }
}