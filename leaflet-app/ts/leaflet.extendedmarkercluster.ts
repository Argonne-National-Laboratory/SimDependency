// export class CriticalInfrastructureMarker extends L.Marker {
//     _highlightedStyle: any;
//     _unHighlightedStyle: any;
//     _highlighted:any;          // change the color of marker to indicate a dependency
//     _latlng: L.LatLngExpression;
//     _popUp: HTMLElement;
//     _icon: L.Icon;
//     options: L.MarkerOptions;

//     // options = {
//     //     queried: false              // marker is part of a query set
//     // }

//     constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions) {
//         super(latlng, options);
//         this._latlng = latlng;
//         this.options = options;
//     }

//     bindPopup(htmlContent, options) {

//         if (options && options.showOnMouseOver) {

//             // Call the super method
//             L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);

//             // unbind the click event
//             this.off("click", this.openPopup, this);

//             // bind to mouse over
//             this.on("mouseover", function (event: L.LeafletMouseEvent) {

//                 // get the element that the mouse hovered onto
//                 var target = event.originalEvent.fromElement || event.originalEvent.relatedTarget;
//                 //var parent = this._getParent(target, "leaflet-popup");
//                 var parent = this._getParent(target, "leaflet-rrose")

//                 // check to see if the element is a popup, and if it is this marker's popup
//                 if (parent == this._popup._container)
//                     return true;

//                 // brigten icon if not highlighted and has been queried
//                 if (!this._highlighted && this.options.queried)
//                     this.setOpacity(1);

//                 // show the popup
//                 this.openPopup();
//                 this._popup.updateDirection();

//             }, this);

//             // and moue out
//             this.on("mouseout", function (event: L.LeafletMouseEvent) {

//                 // get the element that the mouse hovered onto
//                 var target = event.originalEvent.toElement || event.originalEvent.relatedTarget;

//                 // check to see if the element is a popup
//                 //if (this._getParent(target, "leaflet-popup")){
//                 if (this._getParent(target, "leaflet-rrose")) {

//                     L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
//                     return true;

//                 }

//                 // dim icon if not highlighted and has been queried 
//                 if (!this._highlighted && this.options.queried)
//                     this.setOpacity(0.2);

//                 // hide the popup
//                 this.closePopup();
//             }, this);
//         }
//     }

//     // assumes icon is already set
//     setHighlight(markerColor, symbolColor) {


//         /**
//          * if there is a div icon, change the 
//          * formatting to make the icon look highlighted
//          * according to colors specified in attributes
//          * to this function
//          */

//         try {
//             if (this.options.icon.options.html) {

//                 // declare div icon formatting indexes
//                 // starting index of "Background"
//                 let beginBackgroundIndex = 0;
//                 // offset from "Background" start for the ending
//                 let endBackgroundOffset = 0;
//                 // starting index of "Color"
//                 let beginColorIndex = 0;
//                 // offset from "Color" start for the ending
//                 let endColorOffset = 0;

//                 // grab formatting from html string if it exists
//                 beginBackgroundIndex = this.options.icon.options.html.search("background");

//                 // if background found find ending index offset 
//                 if (beginBackgroundIndex > 0)
//                     endBackgroundOffset = this.options.icon.options.html.substring(beginBackgroundIndex).search(";");

//                 // grab formatting from html string if it exists
//                 beginColorIndex = this.options.icon.options.html.search("color");

//                 // if color found find ending index offset
//                 if (beginColorIndex > 0)
//                     endColorOffset = this.options.icon.options.html.substring(beginColorIndex).search(";");


//                 console.log(this.options.icon.options.html.substring(beginBackgroundIndex, beginBackgroundIndex + endBackgroundOffset));
//                 console.log(this.options.icon.options.html.substring(beginColorIndex, beginColorIndex + endColorOffset));

//                 let backgroundHtml = this.options.icon.options.html.substring(0, beginBackgroundIndex - 1);
//                 let colorHtml = this.options.icon.options.html.substring(beginBackgroundIndex + endBackgroundOffset + 2, beginColorIndex - 1);
//                 let closingHtml = this.options.icon.options.html.substring(beginColorIndex + endColorOffset + 2);


//                 if (symbolColor == null && markerColor == null) {
//                     symbolColor = "#EFE553";
//                     markerColor = "#ED190E";
//                 }
//                 let newHtml = backgroundHtml + "\"background:" + markerColor + ";\"" + colorHtml + "\"color:" + symbolColor + ";\"" + closingHtml;
//                 let oldHtml = this.options.icon.options.html;

//                 // set private variables to store highlighted and un-highlighted values
//                 this._highlightedStyle = newHtml;
//                 this._unHighlightedStyle = oldHtml;

//                 // properties for selected icon
//                 // change based on whether icon was clicked on 
//                 // or not 
//                 let iconSize = null;

//                 if (this.options.icon.options.className == "pulse-effect") {
//                     iconSize = new L.Point(58, 58);
//                 }
//                 else {
//                     iconSize = new L.Point(30, 30);
//                 }

//                 this._highlighted = true;
//                 this.setOpacity(1);
//                 this.setIcon(L.divIcon({
//                     className: this.options.icon.options.className,
//                     html: newHtml,
//                     iconSize: iconSize
//                 }));

//             }
//         } catch (err) {
//             console.log("no html formating specified");
//         }
//     }

//     clearHighlight() {
//         if (this._highlighted) {

//             /**
//             * if there is a div icon, change the 
//             * formatting to make the icon look highlighted
//             * according to colors specified in attributes
//             * to this function
//             */
//             try {

//                 if (this.options.icon.options.html) {

//                     this._highlighted = false;
//                     this.setIcon(L.divIcon({
//                         className: "custom-icon",
//                         html: this._unHighlightedStyle,
//                         iconSize: new L.Point(30, 30)
//                     }));

//                 }

//             } catch (err) {
//                 console.log("no html formating specified");
//             }

//         }
//     }

//     isHighligthed() {
//         return this._highlighted;
//     }

//     setQueried() {
//         this.options.queried = true;
//     }

//     _popupMouseOut (event) {

//         // detach the event
//         L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);

//         // get the element that the mouse hovered onto
//         var target = event.toElement || event.relatedTarget;

//         // check to see if the element is a popup
//         //if (this._getParent(target, "leaflet-popup"))
//         if (this._getParent(target, "leaflet-rrose"))
//             return true;

//         // check to see if the marker was hovered back onto
//         if (target == this._icon)
//             return true;

//         // dim icon if not highlighted and has been queried 
//         if (!this._highlighted && this.options.queried)
//             this.setOpacity(0.2);

//         // hide the popup
//         this.closePopup();

//     }

//     _getParent (element, className) {

//         var parent = element.parentNode;

//         while (parent != null) {

//             if (parent.className && L.DomUtil.hasClass(parent, className))
//                 return parent;

//             parent = parent.parentNode;

//         }

//         return false;
//     }
// }

// export class Rrose extends L.Popup {

// }