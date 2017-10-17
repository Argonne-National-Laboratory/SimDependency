L.MarkerClusterGroup.include({

    getParents: function (marker) {
        var parents = [];
        var parent = marker.__parent;
        while (parent) {
            parents.push(parent);
            parent = parent.__parent;
        }
        return parents;
    }

});


// taken from http://jsfiddle.net/sowelie/3JbNY/
// NEED TO ADD SOME CODE TO SELECT Marker
// FLAG USED TO DETERMINE IF IT SELECTED OR NOT
L.CriticalInfrastructureMarker = L.Marker.extend({
    _highlightedStyle: null,
    _unHighlightedStyle: null,
    _highlighted: false,               // change the color of marker to indicate a dependency

    options: {
        queried: false              // marker is part of a query set
    },

    bindPopup: function (htmlContent, options) {

        if (options && options.showOnMouseOver) {

            // Call the super method
            L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);

            // unbind the click event
            this.off("click", this.openPopup, this);

            // bind to mouse over
            this.on("mouseover", function (event) {

                // get the element that the mouse hovered onto
                var target = event.originalEvent.fromElement || event.originalEvent.relatedTarget;
                //var parent = this._getParent(target, "leaflet-popup");
                var parent = this._getParent(target, "leaflet-rrose")

                // check to see if the element is a popup, and if it is this marker's popup
                if (parent == this._popup._container)
                    return true;

                // brigten icon if not highlighted and has been queried
                if (!this._highlighted && this.options.queried)
                    this.setOpacity(1);

                // show the popup
                this.openPopup();
                this._popup.updateDirection();

            }, this);

            // and moue out
            this.on("mouseout", function (event) {

                // get the element that the mouse hovered onto
                var target = event.originalEvent.toElement || event.originalEvent.relatedTarget;

                // check to see if the element is a popup
                //if (this._getParent(target, "leaflet-popup")){
                if (this._getParent(target, "leaflet-rrose")) {

                    L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
                    return true;

                }

                // dim icon if not highlighted and has been queried 
                if (!this._highlighted && this.options.queried)
                    this.setOpacity(0.2);

                // hide the popup
                this.closePopup();
            }, this);
        }
    },

    // assumes icon is already set
    setHighlight: function (markerColor, symbolColor) {


        /**
         * if there is a div icon, change the 
         * formatting to make the icon look highlighted
         * according to colors specified in attributes
         * to this function
         */

        try {
            if (this.options.icon.options.html) {

                // declare div icon formatting indexes
                // starting index of "Background"
                let beginBackgroundIndex = 0;
                // offset from "Background" start for the ending
                let endBackgroundOffset = 0;
                // starting index of "Color"
                let beginColorIndex = 0;
                // offset from "Color" start for the ending
                let endColorOffset = 0;

                // grab formatting from html string if it exists
                beginBackgroundIndex = this.options.icon.options.html.search("background");

                // if background found find ending index offset 
                if (beginBackgroundIndex > 0)
                    endBackgroundOffset = this.options.icon.options.html.substring(beginBackgroundIndex).search(";");

                // grab formatting from html string if it exists
                beginColorIndex = this.options.icon.options.html.search("color");

                // if color found find ending index offset
                if (beginColorIndex > 0)
                    endColorOffset = this.options.icon.options.html.substring(beginColorIndex).search(";");


                console.log(this.options.icon.options.html.substring(beginBackgroundIndex, beginBackgroundIndex + endBackgroundOffset));
                console.log(this.options.icon.options.html.substring(beginColorIndex, beginColorIndex + endColorOffset));

                let backgroundHtml = this.options.icon.options.html.substring(0, beginBackgroundIndex - 1);
                let colorHtml = this.options.icon.options.html.substring(beginBackgroundIndex + endBackgroundOffset + 2, beginColorIndex - 1);
                let closingHtml = this.options.icon.options.html.substring(beginColorIndex + endColorOffset + 2);


                if (symbolColor == null && markerColor == null) {
                    symbolColor = "#EFE553";
                    markerColor = "#ED190E";
                }
                let newHtml = backgroundHtml + "\"background:" + markerColor + ";\"" + colorHtml + "\"color:" + symbolColor + ";\"" + closingHtml;
                let oldHtml = this.options.icon.options.html;

                // set private variables to store highlighted and un-highlighted values
                this._highlightedStyle = newHtml;
                this._unHighlightedStyle = oldHtml;

                // properties for selected icon
                // change based on whether icon was clicked on 
                // or not 
                let iconSize = null;

                if (this.options.icon.options.className == "pulse-effect") {
                    iconSize = new L.Point(58, 58);
                }
                else {
                    iconSize = new L.Point(30, 30);
                }

                this._highlighted = true;
                this.setOpacity(1);
                this.setIcon(L.divIcon({
                    className: this.options.icon.options.className,
                    html: newHtml,
                    iconSize: iconSize
                }));

            }
        } catch (err) {
            console.log("no html formating specified");
        }
    },

    clearHighlight: function () {
        if (this._highlighted) {

            /**
            * if there is a div icon, change the 
            * formatting to make the icon look highlighted
            * according to colors specified in attributes
            * to this function
            */
            try {

                if (this.options.icon.options.html) {

                    this._highlighted = false;
                    this.setIcon(L.divIcon({
                        className: "custom-icon",
                        html: this._unHighlightedStyle,
                        iconSize: new L.Point(30, 30)
                    }));

                }

            } catch (err) {
                console.log("no html formating specified");
            }

        }
    },

    isHighligthed: function () {
        return this._highlighted;
    },

    setQueried: function () {
        this.options.queried = true;
    },

    _popupMouseOut: function (event) {

        // detach the event
        L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);

        // get the element that the mouse hovered onto
        var target = event.toElement || event.relatedTarget;

        // check to see if the element is a popup
        //if (this._getParent(target, "leaflet-popup"))
        if (this._getParent(target, "leaflet-rrose"))
            return true;

        // check to see if the marker was hovered back onto
        if (target == this._icon)
            return true;

        // dim icon if not highlighted and has been queried 
        if (!this._highlighted && this.options.queried)
            this.setOpacity(0.2);

        // hide the popup
        this.closePopup();

    },

    _getParent: function (element, className) {

        var parent = element.parentNode;

        while (parent != null) {

            if (parent.className && L.DomUtil.hasClass(parent, className))
                return parent;

            parent = parent.parentNode;

        }

        return false;
    }
});


/*
  Copyright (c) 2012 Eric S. Theise
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
  persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
  Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

L.Rrose = L.Popup.extend({

    _initLayout: function () {
        var prefix = 'leaflet-rrose',
            container = this._container = L.DomUtil.create('div', prefix + ' ' + this.options.className + ' leaflet-zoom-animated'),
            closeButton;

        if (this.options.closeButton) {
            closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
            closeButton.href = '#close';
            closeButton.innerHTML = '&#215;';

            L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
        }

        this.options.rrose = {
            prefix: prefix,
            x_bound: this.options.x_bound || 80,
            y_bound: this.options.y_bound || 80
        };

        // Set the pixel distances from the map edges at which popups are too close and need to be re-oriented.
        this.updateDirection();
    },

    updateDirection: function () {
        var prefix = this.options.rrose.prefix,
            container = this._container,
            closeButton = this._closeButton,
            wrapper = this._wrapper,

            x_bound = this.options.rrose.x_bound,
            y_bound = this.options.rrose.y_bound,


            // get element left position 
            //x_bound = $('div.leaflet-rrose-content').offset().left;

            // get elements top position
            //y_bound = $('div.leaflet-rrose-content').offset().top;

            currentPosition = this.options.position;
        // need to look at updatePosition in leaflet-src.js
        // need to work on this it's not working right now
        this._adjustPosition();

        // Determine the alternate direction to pop up; north mimics Leaflet's default behavior, so we initialize to that.
        var newPosition = 'n';
        // Then see if the point is too far north...
        var y_diff = y_bound - this._map.latLngToContainerPoint(this._latlng).y;
        if (y_diff > 0) {
            newPosition = 's'
        }
        // or too far east...
        var x_diff = this._map.latLngToContainerPoint(this._latlng).x - (this._map.getSize().x - x_bound);
        if (x_diff > 0) {
            newPosition += 'w'
        } else {
            // or too far west.
            x_diff = x_bound - this._map.latLngToContainerPoint(this._latlng).x;
            if (x_diff > 0) {
                newPosition += 'e'
            }
        }

        if (!currentPosition) {
            // Create the necessary DOM elements in the correct order. Pure 'n' and 's' conditions need only one class for styling, others need two.
            if (/s/.test(newPosition)) {
                if (newPosition === 's') {
                    this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
                    wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
                }
                else {
                    this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + newPosition, container);
                    wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + newPosition, container);
                }
                this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + newPosition, this._tipContainer);
                L.DomEvent.disableClickPropagation(wrapper);
                this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
                L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
            }
            else {
                if (newPosition === 'n') {
                    wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
                    this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
                }
                else {
                    wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper' + ' ' + prefix + '-content-wrapper-' + newPosition, container);
                    this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container' + ' ' + prefix + '-tip-container-' + newPosition, container);
                }
                L.DomEvent.disableClickPropagation(wrapper);
                this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
                L.DomEvent.on(this._contentNode, 'mousewheel', L.DomEvent.stopPropagation);
                this._tip = L.DomUtil.create('div', prefix + '-tip' + ' ' + prefix + '-tip-' + newPosition, this._tipContainer);
            }
            //L.DomUtil.addClass(closeButton, prefix + '-close-button-' + newPosition);
            this.options.position = newPosition;
        }
        else if (currentPosition != newPosition) {
            // Update classes
            L.DomUtil.removeClass(this._wrapper, prefix + '-content-wrapper-' + currentPosition);
            L.DomUtil.addClass(this._wrapper, prefix + '-content-wrapper-' + newPosition);
            L.DomUtil.removeClass(this._tipContainer, prefix + '-tip-container-' + currentPosition);
            L.DomUtil.addClass(this._tipContainer, prefix + '-tip-container-' + newPosition);
            L.DomUtil.removeClass(this._tip, prefix + '-tip-' + currentPosition);
            L.DomUtil.addClass(this._tip, prefix + '-tip-' + newPosition);
            //L.DomUtil.removeClass(closeButton, prefix + '-close-button-' + currentPosition);
            //L.DomUtil.addClass(closeButton, prefix + '-close-button-' + newPosition);
            // Swap DOM elements to keep correct order
            if (/n/.test(currentPosition) && /s/.test(newPosition)) {
                this._wrapper.parentNode.insertBefore(this._tipContainer, this._wrapper);
            }
            else if (/s/.test(currentPosition) && /n/.test(newPosition)) {
                this._tipContainer.parentNode.insertBefore(this._wrapper, this._tipContainer);
            }
            // Finally update elements position
            this.options.position = newPosition;
            this._updatePosition();
        }
    },

    _updatePosition: function () {
        var pos = this._map.latLngToLayerPoint(this._latlng),
            is3d = L.Browser.any3d,
            offset = this.options.offset;

        if (is3d) {
            L.DomUtil.setPosition(this._container, pos);
        }

        if (/s/.test(this.options.position)) {
            this._containerBottom = -this._container.offsetHeight + offset.y - (is3d ? 0 : pos.y);
        } else {
            this._containerBottom = -offset.y - (is3d ? 0 : pos.y);
        }

        if (/e/.test(this.options.position)) {
            this._containerLeft = offset.x + (is3d ? 0 : pos.x);
        }
        else if (/w/.test(this.options.position)) {
            this._containerLeft = -Math.round(this._containerWidth) + offset.x + (is3d ? 0 : pos.x);
        }
        else {
            this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (is3d ? 0 : pos.x);
        }

        this._container.style.bottom = this._containerBottom + 'px';
        this._container.style.left = this._containerLeft + 'px';
    },

    _adjustPosition: function() {

        var containerHeight = this._container.offsetHeight,
            containerWidth = this._containerWidth;

       if(this._containerBottom != null){
            var layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

            layerPos._add(L.DomUtil.getPosition(this._container));

            var containerPos = this._map.layerPointToContainerPoint(layerPos),
                padding = L.point(this.options.autoPanPadding),
                paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
                paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
                size = this._map.getSize(),
                dx = 0,
                dy = 0;

            if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
                dx = containerPos.x + containerWidth - size.x + paddingBR.x;
            }
            if (containerPos.x - dx - paddingTL.x < 0) { // left
                dx = containerPos.x - paddingTL.x;
            }
            if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
                dy = containerPos.y + containerHeight - size.y + paddingBR.y;
            }
            if (containerPos.y - dy - paddingTL.y < 0) { // top
                dy = containerPos.y - paddingTL.y;
            }
       }
    }

});