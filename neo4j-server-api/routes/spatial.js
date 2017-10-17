var express = require('express');
var app = require('../app');
var cypher = require('../public/javascripts/cypher');
var router = express.Router();
var driver = global.driver;
var session = driver.session();

// Used to set the path to the template view, makes code easily reusable
var localTemplate = "docpage";

// Spatial documentation subpage
router.get('/', function (req, res, next) {

    // Passes the JSON of the documentation page to a template variable
    res.locals.data = req.app.get('spatialDoc');

    // Parses the values from the JSON to create the table in the doc page
    res.locals.keys = Object.keys(res.locals.data[0]);

    // Renders ejs template with local variables
    res.render(localTemplate);

});

// Returns all layers indexed by the neo4j spatial plugin (this must be set up within neo4j). Plugin must be installed and configured for this to work.
router.get('/layers', function (req, res, next) {
    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {
            res.json(records);

            // Close out the session object
            session.close();
        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });
});

// Point documentation page
router.get('/point', function (req, res, next) {

    // Passes the JSON of the documentation page to a template variable
    res.locals.data = req.app.get('pointDoc');

    // Parses the values from the JSON to create the table in the doc page
    res.locals.keys = Object.keys(res.locals.data[0]);

    // Renders ejs template with local variables
    res.render(localTemplate);

});

// Performs a spatial query at a given :lat and :long and returns nodes within 10km of this point
router.get('/point/:lat,:long', function (req, res, next) {
    var radius = 10.0;


    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            } else if (isNaN(parseFloat(req.params.lat)) || isNaN(parseFloat(req.params.long))) {
                res.send("Your request includes an invalid value. All latitude and longitude values must be numeric.");
                session.close();
            }
            else {
                session.run(cypher.radialSearch(spatialLayerArray, req.params.lat, req.params.long, radius))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });
});

// Performs a spatial query at a given :lat and :long and returns nodes within 10km of this point filtered by :filter_label
router.get('/point/:lat,:long/filter/:filter_label', function (req, res, next) {
    var radius = 10.0;


    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            } else if (isNaN(parseFloat(req.params.lat)) || isNaN(parseFloat(req.params.long))) {
                res.send("Your request includes an invalid value. All latitude and longitude values must be numeric.");
                session.close();
            }
            else {
                session.run(cypher.radialSearch(spatialLayerArray, req.params.lat, req.params.long, radius, req.params.filter_label))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });
});

// Performs a spatial query at a given :lat and :long and returns nodes within :radius (in km) of this point
router.get('/point/:lat,:long/radius/:radius', function (req, res, next) {

    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            } else if (isNaN(parseFloat(req.params.lat)) || isNaN(parseFloat(req.params.long)) || isNaN(parseFloat(req.params.radius))) {
                res.send("Your request includes an invalid value. All latitude, longitude, and search radius values must be numeric.");
                session.close();
            }
            else {
                session.run(cypher.radialSearch(spatialLayerArray, req.params.lat, req.params.long, req.params.radius))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });
});

// Performs a spatial query at a given :lat and :long and returns nodes within :radius (in km) of this point filtered by :filter_label
router.get('/point/:lat,:long/radius/:radius/filter/:filter_label', function (req, res, next) {

    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            } else if (isNaN(parseFloat(req.params.lat)) || isNaN(parseFloat(req.params.long)) || isNaN(parseFloat(req.params.radius))) {
                res.send("Your request includes an invalid value. All latitude, longitude, and search radius values must be numeric.");
                session.close();
            }
            else {
                session.run(cypher.radialSearch(spatialLayerArray, req.params.lat, req.params.long, req.params.radius, req.params.filter_label))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });
});

router.get('/wkt', function (req, res, next) {

    // Passes the JSON of the documentation page to a template variable
    res.locals.data = req.app.get('wktDoc');

    // Parses the values from the JSON to create the table in the doc page
    res.locals.keys = Object.keys(res.locals.data[0]);

    // Renders ejs template with local variables
    res.render(localTemplate);

});

// Searches for all spatially indexed nodes that intersect the input :line_string
router.get('/wkt/:line_string', function (req, res, next) {

    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            }
            // else if () {
            //     res.send("Your request includes an invalid value. All latitude, longitude, and search radius values must be numeric.");
            //     session.close();
            // }
            else {
                session.run(cypher.wktSearch(spatialLayerArray, req.params.line_string))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });

});

router.get('/wkt/:line_string/filter/:filter_label', function (req, res, next) {

    session.run("CALL spatial.layers() YIELD name RETURN DISTINCT name")
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var spatialLayerArray = cypher.spatialLayerArray(records);

            if (spatialLayerArray.length == 0) {
                res.send("Your neo4j database does not include any indexed spatial layers. To index spatial layers, please reference the github page for the neo4j spatial plugin https://github.com/neo4j-contrib/spatial");
                session.close();
            }
            else if (spatialLayerArray.indexOf(req.params.filter_label.trim()) == -1) {
                res.send("No spatial layer is found matching your current filter label. This could be because either (1) the database does not have a spatial index by the following name or (2) the spatial index has not been created on the given node type.");
                session.close();
            }
            else {
                session.run(cypher.wktSearch([req.params.filter_label.trim()], req.params.line_string))
                    .then(function (result) {
                        var records = [];
                        result.records.forEach((value) => {
                            records.push(value);
                        });
                        return records;
                    })
                    .then((records) => {
                        res.json(records);

                        session.close();
                    })
                    .catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });

            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session object
            session.close();
        });

});

module.exports = router;
