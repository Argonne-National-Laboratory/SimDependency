/// <reference types="leaflet" />

declare namespace L {
    export class Util {

        /**
         * Merges the properties of the src object (or multiple objects) 
         * into dest object and returns the latter. Has an L.extend shortcut.
         */
        static extend(dest: Object, src?: Object): Object;

        /**
         * Compatibility polyfill for Object.create
         */
        static create(proto: Object, properties?: Object): Object;

        /**
         * Returns a new function bound to the arguments passed, like 
         * Function.prototype.bind. Has a L.bind() shortcut.
         */
        static bind(fn: Function, obj: Object): Function;

        /**
         * Returns the unique ID of an object, assiging it one if it 
         * doesn't have it.
         */
        static stamp(obj: Object): Number;

        /** 
         * Returns a function which executes function fn with the given scope context 
         * (so that the this keyword refers to context inside fn's code). The function fn 
         * will be called no more than one time per given amount of time. The arguments received
         * by the bound function will be any arguments passed when binding the function, followed 
         * by any arguments passed when invoking the bound function. Has an L.bind shortcut. 
         */
        static throttle(fn: Function, time: Number, context: Object): Function;

        /**
         * Returns the number num modulo range in such a way so it lies within range[0] and range[1]. 
         * The returned value will be always smaller than range[1] unless includeMax is set to true.
         */
        static wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number;

        /**
         * Returns a function which always returns false.
         */
        static falseFn(): Function;

        /**
         * Returns the number num rounded to digits decimals, or to 5 decimals by default.
         */
        static formatNum(num: Number, digits?: Number): Number;

        /**
         * 	Compatibility polyfill for String.prototype.trim
         */
        static trim(str: String): String;

        /**
         * 	Trims and splits the string on whitespace and returns the array of parts.
         */
        static splitWords(str: String): String[];

        /**
         * Merges the given properties to the options of the obj object, returning the 
         * resulting options. See Class options. Has an L.setOptions shortcut.
         */
        static setOptions(obj: Object, options: Object): Object;

        /**
         * Converts an object into a parameter URL string, e.g. {a: "foo", b: "bar"} translates 
         * to '?a=foo&b=bar'. If existingUrl is set, the parameters will be appended at the end. 
         * If uppercase is true, the parameter names will be uppercased (e.g. '?A=foo&B=bar')
         */
        static getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String;

        /** 
         * 	Simple templating facility, accepts a template string of the form 'Hello {a}, {b}' and 
         * a data object like {a: 'foo', b: 'bar'}, returns evaluated string ('Hello foo, bar'). You 
         * can also specify functions instead of strings for data values — they will be evaluated passing 
         * data as an argument.
         */
        static template(str: String, data: Object): String;

        /**
         * Compatibility polyfill for Array.isArray
         */
        static isArray(obj: Object): Boolean;

        
        /**
         * Compatibility polyfill for Array.prototype.indexOf
         */
        static indexOf(array: Array<any>, el: Object): Number;

        /**
         * Schedules fn to be executed when the browser repaints. fn is bound to context if given. 
         * When immediate is set, fn is called immediately if the browser doesn't have native support 
         * for window.requestAnimationFrame, otherwise it's delayed. Returns a request ID that can 
         * be used to cancel the request.
         */
         static requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number;

        /**
         * 	Cancels a previous requestAnimFrame. See also window.cancelAnimationFrame.
         */
         static cancelAnimFrame(id: Number);


         /**
          * Last unique ID used by stamp()
          */
         static lastId: Number;

         /**
          * Data URI string containing a base64-encoded empty GIF image. Used as a hack to free memory 
          * from unused images on WebKit-powered mobile devices (by setting image src to this string).
          */
         static emptyImageUrl: String;
    
    }
}