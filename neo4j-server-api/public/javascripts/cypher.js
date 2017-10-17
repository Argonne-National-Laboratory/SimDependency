var express = require('express');
var app = require('../../app');

// Dependency Model

function dependsOn(nodeLabel) {
    return "MATCH path=(a:DepModel {label:'" + nodeLabel + "'})-[*]->(b:DepModel) WHERE NOT (b)-[]->() RETURN DISTINCT nodes(path)";
}

function requiredBy(nodeLabel) {
    return "MATCH path=(a:DepModel)-[*]->(b:DepModel {label:'" + nodeLabel + "'}) WHERE NOT ()-[]->(a) RETURN DISTINCT nodes(path)";
}

function dependencyArray(data) {
    var arrayOfDependencies = [];
    data.forEach((value, index) => {
        var tempArray = [];
        value._fields[0].forEach((value, index) => {
            tempArray.push(
                {
                    name: value.properties.label,
                    connectivity: value.properties.connectivity
                }
            );

        });
        arrayOfDependencies.push(tempArray);
        // newArrayOfDependencies.push(newArray);
    });
    return arrayOfDependencies;
}

function spatialLayerArray(data) {
    var arrayOfSpatialLayers = [];
    data.forEach((value, index) => {
        if (value._fields.length > 0) {
            arrayOfSpatialLayers.push(value._fields[0])
        }

    });
    return arrayOfSpatialLayers;
}


// Queries

// Depends_on Query
function cypherQuery(arrayOfDependencies, initialNodeId, filter, withinMaxNodeLength) {
    var stringToReturn = "";

    arrayOfDependencies.forEach((value, index) => {

        stringToReturn += buildQuery(value, initialNodeId, filter, withinMaxNodeLength);

        if (index < arrayOfDependencies.length - 1) {
            stringToReturn += " UNION ";
        }
    });

    return stringToReturn;
}


function buildQuery(arrayOfDependencies, initialNodeId, filter, withinMaxNodeLength) {

    // Paths to query in cypher statement
    var paths = buildPaths(arrayOfDependencies);

    // Strings to build query
    var queryString = "";
    var connectedToString = "-[:CONNECTED_TO]->";
    var variableConnectedToString = "";
    var collectNodeString = "";
    var unwindString = " UNWIND n as nodes";
    var filterString = "";
    var returnString = " RETURN DISTINCT nodes";
    var previousPath = "";
    var currentPathIndex = 0;

    if (filter != null && filter != undefined && filter.length > 0) {
        filterString = " WITH nodes WHERE '" + filter + "' IN labels(nodes)";
    }

    if (!isNaN(withinMaxNodeLength) && withinMaxNodeLength > 0) {
        variableConnectedToString = "-[:CONNECTED_TO*0.." + withinMaxNodeLength + "]-";
    } else {
        variableConnectedToString = "-[:CONNECTED_TO*0..5]-";
    }

    paths.forEach((value, index) => {

        // Keeps updated index outside loop for nested terms that require this index
        currentPathIndex = index;

        // Index = 0 is at the beginning of the query statement
        if (index == 0) {
            queryString += "MATCH p" + index + "=";
        } else {
            queryString += " OPTIONAL MATCH p" + index + "=";
        }

        if (value.type === "between") {
            var tempPath = "";
            var nodeArrayLength = value.nodes.length;


            // Construct the node path (A)->(B)->(C) of a 'between' pathway
            value.nodes.forEach((value, index) => {

                if (index == 0 && previousPath === "within") {
                    tempPath += "(" + value.trim().toLowerCase() + "_1:" + value.trim() + ")";

                } else {
                    tempPath += "(" + value.trim().toLowerCase() + "_0:" + value.trim() + ")";
                }

                if (index < nodeArrayLength - 1) {
                    tempPath += connectedToString;
                }
            });

            previousPath = "between";
            queryString += tempPath;

            if (currentPathIndex == 0) {
                queryString += " WHERE " + value.nodes[0].trim().toLowerCase() + "_0.id=" + initialNodeId;
            }

        }
        // Construct the node path (B)->(B)->...->(B) of a 'within' pathway
        else if (value.type === "within") {

            previousPath = "within";

            if (currentPathIndex == 0) {
                queryString += "(" + value.nodes[0].trim().toLowerCase() + "_0:" + value.nodes[0].trim() + ")" + variableConnectedToString + "(" + value.nodes[0].trim().toLowerCase() + "_1:" + value.nodes[0].trim() + ") WHERE " + value.nodes[0].trim().toLowerCase() + "_0.id=" + initialNodeId;
            } else {
                queryString += "(" + value.nodes[0].trim().toLowerCase() + "_0)" + variableConnectedToString + "(" + value.nodes[0].trim().toLowerCase() + "_1:" + value.nodes[0].trim() + ")"
            }

            // This is to prevent a syntax error with adjacent WHERE clauses
            if (index == 0) {
                queryString += " AND ALL (x IN nodes(p" + currentPathIndex + ") WHERE (x:" + value.nodes[0] + "))";
            } else {
                queryString += " WHERE ALL (x IN nodes(p" + currentPathIndex + ") WHERE (x:" + value.nodes[0] + "))";
            }
        }
    });


    // Collect nodes
    var collectNodeString = " WITH "

    for (var i = 0; i < paths.length; i++) {
        if (i == 0) {
            collectNodeString += "nodes(p" + i + ")";

        } else {
            collectNodeString += "COALESCE(nodes(p" + i + "),[])";
        }

        if (i < paths.length - 1) {
            collectNodeString += " + "
        } else {
            collectNodeString += " as n";
        }
    }

    queryString += collectNodeString + unwindString + filterString + returnString;

    return queryString;

}

// This function takes in the list of dependencies and constructs an array of paths that will be built into the cypher statement
function buildPaths(arrayOfDependencies) {
    var paths = [];
    var currentPathIndex = 0;
    var lastConnectivity = "";

    // Generates a representation of the within and between nodal paths that need to be built into the query
    arrayOfDependencies.forEach((value, index) => {
        if (index == 0) {
            paths.push({
                nodes: [],
                type: ""
            });
            paths[0].nodes.push(value.name.trim());
        } else {
            // Single --> single
            if (value.connectivity.trim().toLowerCase() === lastConnectivity && value.connectivity.trim().toLowerCase() === "single") {
                // Add new node to current path
                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "between";

            }
            // Single --> multi
            else if (!(value.connectivity.trim().toLowerCase() === lastConnectivity) && value.connectivity.trim().toLowerCase() === "multi") {
                // Add new node to current path
                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "between";

                // Spawn new path with current node
                currentPathIndex++;

                paths.push({
                    nodes: [],
                    type: ""
                });

                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "within";
            }
            // Multi --> single
            else if (!(value.connectivity.trim().toLowerCase() === lastConnectivity) && value.connectivity.trim().toLowerCase() === "single") {

                // Label prior path type
                paths[currentPathIndex].type = "within";

                // Spawn new path connecting previous node and current node
                var priorNode = paths[currentPathIndex].nodes[paths[currentPathIndex].nodes.length - 1];
                currentPathIndex++;

                paths.push({
                    nodes: [],
                    type: ""
                });

                paths[currentPathIndex].nodes.push(priorNode);
                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "between";

            }
            // Multi --> multi
            else if (value.connectivity.trim().toLowerCase() === lastConnectivity && value.connectivity.trim().toLowerCase() === "multi") {

                // Label prior path type
                paths[currentPathIndex].type = "within";

                // Spawn between node path
                var priorNode = paths[currentPathIndex].nodes[paths[currentPathIndex].nodes.length - 1];
                currentPathIndex++;

                paths.push({
                    nodes: [],
                    type: ""
                });

                paths[currentPathIndex].nodes.push(priorNode);
                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "between";

                // Spawn within node path
                currentPathIndex++;

                paths.push({
                    nodes: [],
                    type: ""
                });

                paths[currentPathIndex].nodes.push(value.name);
                paths[currentPathIndex].type = "within";

            }
        }
        lastConnectivity = value.connectivity.trim().toLowerCase();

    })

    return paths;
}

// Required_by Query
function reverseCypherQuery(arrayOfDependencies, initialNodeId, filter, withinMaxNodeLength) {
    var stringToReturn = "";

    arrayOfDependencies.forEach((value, index) => {

        stringToReturn += buildReverseQuery(value, initialNodeId, filter, withinMaxNodeLength);

        if (index < arrayOfDependencies.length - 1) {
            stringToReturn += " UNION ";
        }
    });
    return stringToReturn;
}

function buildReverseQuery(arrayOfDependencies, initialNodeId, filter, withinMaxNodeLength) {
    // Paths to query in cypher statement
    var paths = buildPaths(arrayOfDependencies.reverse());

    // Strings to build query
    var queryString = "";
    var connectedToString = "<-[:CONNECTED_TO]-";
    var variableConnectedToString = "";
    var collectNodeString = "";
    var unwindString = " UNWIND n as nodes";
    var filterString = "";
    var returnString = " RETURN DISTINCT nodes";
    var previousPath = "";
    var currentPathIndex = 0;

    if (filter != null && filter != undefined && filter.length > 0) {
        filterString = " WITH nodes WHERE '" + filter + "' IN labels(nodes)";
    }

    if (!isNaN(withinMaxNodeLength) && withinMaxNodeLength > 0) {
        variableConnectedToString = "-[:CONNECTED_TO*0.." + withinMaxNodeLength + "]-";
    } else {
        variableConnectedToString = "-[:CONNECTED_TO*0..5]-";
    }

    paths.forEach((value, index) => {

        // Keeps updated index outside loop for nested terms that require this index
        currentPathIndex = index;

        // Index = 0 is at the beginning of the query statement
        if (index == 0) {
            queryString += "MATCH p" + index + "=";
        } else {
            queryString += " OPTIONAL MATCH p" + index + "=";
        }

        if (value.type === "between") {
            var tempPath = "";
            var nodeArrayLength = value.nodes.length;


            // Construct the node bath (A)->(B)->(C) of a 'between' pathway
            value.nodes.forEach((value, index) => {

                if (index == 0 && previousPath === "within") {
                    tempPath += "(" + value.trim().toLowerCase() + "_1:" + value.trim() + ")";

                } else {
                    tempPath += "(" + value.trim().toLowerCase() + "_0:" + value.trim() + ")";
                }

                if (index < nodeArrayLength - 1) {
                    tempPath += connectedToString;
                }
            });

            previousPath = "between";
            queryString += tempPath;

            if (currentPathIndex == 0) {
                queryString += " WHERE " + value.nodes[0].trim().toLowerCase() + "_0.id=" + initialNodeId;
            }

        } else if (value.type === "within") {

            previousPath = "within";

            if (currentPathIndex == 0) {
                queryString += "(" + value.nodes[0].trim().toLowerCase() + "_0:" + value.nodes[0].trim() + ")" + variableConnectedToString + "(" + value.nodes[0].trim().toLowerCase() + "_1:" + value.nodes[0].trim() + ") WHERE " + value.nodes[0].trim().toLowerCase() + "_0.id=" + initialNodeId;
            } else {
                queryString += "(" + value.nodes[0].trim().toLowerCase() + "_0)" + variableConnectedToString + "(" + value.nodes[0].trim().toLowerCase() + "_1:" + value.nodes[0].trim() + ")"
            }

            // This is to prevent a syntax error with adjacent WHERE clauses
            if (index == 0) {
                queryString += " AND ALL (x IN nodes(p" + currentPathIndex + ") WHERE (x:" + value.nodes[0] + "))";
            } else {
                queryString += " WHERE ALL (x IN nodes(p" + currentPathIndex + ") WHERE (x:" + value.nodes[0] + "))";
            }
        }
    });


    // Collect nodes
    var collectNodeString = " WITH "

    for (var i = 0; i < paths.length; i++) {
        // This statement is required to avoid a type error in neo4j
        if (i == 0) {
            collectNodeString += "nodes(p" + i + ")";

        } else {
            collectNodeString += "COALESCE(nodes(p" + i + "),[])";
        }

        // Combines nodes from the separate paths in the MATCH and OPTIONAL MATCH statements
        if (i < paths.length - 1) {
            collectNodeString += " + "
        } else {
            collectNodeString += " as n";
        }
    }

    queryString += collectNodeString + unwindString + filterString + returnString;

    return queryString;

}

// Spatial Queries

function radialSearch(arrayOfSpatialLayers, latitude, longitude, radius, filter) {
    var _radius = 10.0;
    var stringToReturn = "";
    var filterString = "";

    if (typeof (radius) != 'undefined') {
        _radius = radius;
    }

    if (typeof (filter) != 'undefined' && filter.length > 0) {
        filterString = " WITH nodes WHERE '" + filter + "' IN labels(nodes)";
    }

    arrayOfSpatialLayers.forEach((value, index) => {
        stringToReturn += "CALL spatial.withinDistance('" + value + "', {latitude: " + latitude + ", longitude: " + longitude + "}, " + _radius + ") YIELD node AS nodes";

        stringToReturn += filterString + " RETURN DISTINCT nodes";
        
        if (index < arrayOfSpatialLayers.length - 1) {
            stringToReturn += " UNION ";
        }
    });

    return stringToReturn;
}

function wktSearch(arrayOfSpatialLayers, wktString) {
    var stringToReturn = "";

    arrayOfSpatialLayers.forEach((value, index) => {
        stringToReturn += "WITH '" + wktString + "' as polygon CALL spatial.intersects('" + value + "', polygon) YIELD node AS d RETURN DISTINCT d";

        if (index < arrayOfSpatialLayers.length - 1) {
            stringToReturn += " UNION ";
        }
    });

    return stringToReturn;
}

module.exports = {
    dependsOn,
    requiredBy,
    dependencyArray,
    spatialLayerArray,
    cypherQuery,
    buildQuery,
    buildPaths,
    reverseCypherQuery,
    buildReverseQuery,
    radialSearch,
    wktSearch
}