import { Injectable } from '@angular/core';

@Injectable()
export class WktService {

  constructor() { }

  getWKT(data: any) {
    return this.WKT.stringify(data);
  }

  WKT = (function () {
      function pointToString(value) {
        return "POINT " + pointToUntaggedString(value.coordinates);
      }

      function pointToUntaggedString(coordinates) {
        if (!(coordinates && coordinates.length)) {
          return "EMPTY";
        } else {
          return "(" + coordinates.join(" ") + ")";
        }
      }

      function lineStringToString(value) {
        return "LINESTRING " + lineStringToUntaggedString(value.coordinates);
      }

      function lineStringToUntaggedString(coordinates) {
        if (!(coordinates && coordinates.length)) {
          return "EMPTY";
        } else {
          var points = [];

          for (var i = 0; i < coordinates.length; i++) {
            points.push(coordinates[i].join(" "));
          }

          return "(" + points + ")";
        }
      }

      function polygonToString(value) {
        return "POLYGON " + polygonToUntaggedString(value.coordinates);
      }

      function polygonToUntaggedString(coordinates) {
        if (!(coordinates && coordinates.length)) {
          return "EMTPY";
        } else {
          var lineStrings = [];

          for (var i = 0; i < coordinates.length; i++) {
            lineStrings.push(lineStringToUntaggedString(coordinates[i]));
          }

          return "(" + lineStrings + ")";
        }
      }

      function multiPointToString(value) {
        return "MULTIPOINT " + lineStringToUntaggedString(value.coordinates);
      }

      function multiLineStringToString(value) {
        return "MULTILINSTRING " + polygonToUntaggedString(value.coordinates);
      }

      function multiPolygonToString(value) {
        return "MULTIPOLYGON " + multiPolygonToUntaggedString(value.coordinates);
      }

      function multiPolygonToUntaggedString(coordinates) {
        if (!(coordinates && coordinates.length)) {
          return "EMPTY";
        } else {
          var polygons = [];
          for (var i = 0; i < coordinates.length; i++) {
            polygons.push(polygonToUntaggedString(coordinates[i]));
          }
          return "(" + polygons + ")";
        }
      }

      function geometryCollectionToString(value) {
        return "GEOMETRYCOLLECTION " + geometryCollectionToUntaggedString(value.geometries);
      }

      function geometryCollectionToUntaggedString(geometries) {
        if (!(geometries && geometries.length)) {
          return "EMPTY";
        } else {
          var geometryText = [];
          for (var i = 0; i < geometries.length; i++) {
            geometryText.push(stringify(geometries[i]));
          }
          return "(" + geometries + ")";
        }
      }

      function stringify(value) {
        if (!(value && value.type)) {
          return "";
        } else {
          switch (value.type) {
            case "Point":
              return pointToString(value);

            case "LineString":
              return lineStringToString(value);

            case "Polygon":
              return polygonToString(value);

            case "MultiPoint":
              return multiPointToString(value);

            case "MultiLineString":
              return multiLineStringToString(value);

            case "MultiPolygon":
              return multiPolygonToString(value);

            case "GeometryCollection":
              return geometryCollectionToString(value);

            default:
              return "";
          }
        }
      }

      function pointParseUntagged(wkt) {
        var pointString = wkt.match( /\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/ );
        return pointString && pointString.length > 2 ? {
          type: "Point",
          coordinates: [
            parseFloat(pointString[1]),
            parseFloat(pointString[2])
          ]
        } : null;
      }

      function lineStringParseUntagged(wkt) {
        var lineString = wkt.match( /\s*\((.*)\)/ ),
            coords = [],
            pointStrings,
            pointParts,
            i = 0;

        if ( lineString && lineString.length > 1 ) {
          pointStrings = lineString[ 1 ].match( /[\d\.\-]+\s+[\d\.\-]+/g );

          for ( ; i < pointStrings.length; i++ ) {
            pointParts = pointStrings[ i ].match( /\s*([\d\.\-]+)\s+([\d\.\-]+)\s*/ );
            coords[ i ] = [ parseFloat( pointParts[ 1 ] ), parseFloat( pointParts[ 2 ] ) ];
          }

          return {
            type: "LineString",
            coordinates: coords
          };
        } else {
          return null;
        }
      }

      function polygonParseUntagged(wkt) {
        var polygon = wkt.match( /\s*\(\s*\((.*)\)\s*\)/ ),
            coords = [],
            pointStrings,
            pointParts,
            i = 0;

        if ( polygon && polygon.length > 1 ) {
          pointStrings = polygon[ 1 ].match( /[\d\.\-]+\s+[\d\.\-]+/g );

          for ( ; i < pointStrings.length; i++ ) {
            pointParts = pointStrings[ i ].match( /\s*([\d\.\-]+)\s+([\d\.\-]+)\s*/ );
            coords[ i ] = [ parseFloat( pointParts[ 1 ] ), parseFloat( pointParts[ 2 ] ) ];
          }

          return {
            type: "Polygon",
            coordinates: [ coords ]
          };
        } else {
          return null;
        }
      }

      function multiPointParseUntagged(wkt) {
        var multiSomething;

        if ( wkt.indexOf( "((" ) === -1 ) {
          multiSomething = lineStringParseUntagged( wkt );
        } else {
          multiSomething = multiLineStringParseUntagged( wkt );
          multiSomething.coordinates = this._allCoordinates( multiSomething );
        }

        multiSomething.type = "MultiPoint";

        return multiSomething;
      }

      function multiLineStringParseUntagged(wkt) {
        var lineStringsWkt = wkt.substr( 2, wkt.length - 4 ),
            lineString,
            lineStrings = lineStringsWkt.split( /\),\s*\(/ ),
            i = 0,
            multiLineString = {
              type: "MultiLineString",
              coordinates: [ ]      
            };

        for ( ; i < lineStrings.length; i++ ) {
          lineString = lineStringParseUntagged( "(" + lineStrings[ i ] + ")" );
          if ( lineString ) {
            multiLineString.coordinates.push( lineString.coordinates );
          }     
        }

        return multiLineString;
      }

      function multiPolygonParseUntagged(wkt) {
        var polygonsWkt = wkt.substr( 1, wkt.length - 2 ),
            polygon,
            polygons = polygonsWkt.split( /\),\s*\(/ ),
            i = 0,
            multiPolygon = {
              type: "MultiPolygon",
              coordinates: [ ]
            };

        for ( ; i < polygons.length; i++ ) {
          polygon = polygonParseUntagged( "(" + polygons[ i ] + ")" );
          if ( polygon ) {
            multiPolygon.coordinates.push( polygon.coordinates );
          }
        }

        return multiPolygon;
      }

      function geometryCollectionParseUntagged( wkt ) {
        var geometriesWkt = wkt.substr( 1, wkt.length - 2 ),
            geometries = geometriesWkt.match( /\),[a-zA-Z]/g ),
            geometryCollection = {
              type: "GeometryCollection",
              geometries: [ ]
            },
            curGeom,
            i = 0, curStart = 0, curLen;

        if ( geometries && geometries.length > 0 ) {
          for ( ; i < geometries.length; i++ ) {
            curLen = geometriesWkt.indexOf( geometries[ i ], curStart ) - curStart + 1;
            curGeom = parse( geometriesWkt.substr( curStart, curLen ) );
            if ( curGeom ) {
              geometryCollection.geometries.push( curGeom );
            }
            curStart += curLen + 1;
          }

          // one more
          curGeom = parse( geometriesWkt.substr( curStart ) );
          if ( curGeom ) {
            geometryCollection.geometries.push( curGeom );
          }

          return geometryCollection;
        } else {
          return null;
        }
      }

      function parse(wkt) {
        wkt = $.trim(wkt);

        var typeIndex = wkt.indexOf( "(" ),
            untagged = wkt.substr( typeIndex  );

        switch ($.trim(wkt.substr(0, typeIndex)).toUpperCase()) {
          case "POINT":
            return pointParseUntagged( untagged );

          case "LINESTRING":
            return lineStringParseUntagged( untagged );

          case "POLYGON":
            return polygonParseUntagged( untagged );

          case "MULTIPOINT":
            return multiPointParseUntagged( untagged );

          case "MULTILINESTRING":
            return multiLineStringParseUntagged( untagged );

          case "MULTIPOLYGON":
            return multiPolygonParseUntagged( untagged );

          case "GEOMETRYCOLLECTION":
            return geometryCollectionParseUntagged( untagged );

          default:
            return null;
        }
      }

      return {
        stringify: stringify,

        parse: parse
      };
    }());

    _allCoordinates = function (geom) {
      // return array of all positions in all geometries of geom
      // not in JTS
      var geometries = this._flatten(geom),
          curGeom = 0,
          result = [];

      for (; curGeom < geometries.length; curGeom++) {
        var coordinates = geometries[curGeom].coordinates,
            isArray = coordinates && $.isArray(coordinates[0]),
            isDblArray = isArray && $.isArray(coordinates[0][0]),
            isTriArray = isDblArray && $.isArray(coordinates[0][0][0]),
            i, j, k;

        if (!isTriArray) {
          if (!isDblArray) {
            if (!isArray) {
              coordinates = [coordinates];
            }
            coordinates = [coordinates];
          }
          coordinates = [coordinates];
        }

        for (i = 0; i < coordinates.length; i++) {
          for (j = 0; j < coordinates[i].length; j++) {
            for (k = 0; k < coordinates[i][j].length; k++) {
              result.push(coordinates[i][j][k]);
            }
          }
        }
      }
      return result;
    };
    
}
