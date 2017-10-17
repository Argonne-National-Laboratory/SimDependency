var express = require('express');
var app = require('../app');
var cypher = require('../public/javascripts/cypher');
var router = express.Router();
var driver = global.driver;
var session = driver.session();

// Used to set the path to the template view, makes code easily reusable
var localTemplate = "docpage";

// Node documentation subpage
router.get('/', function (req, res, next) {

    // Passes the JSON of the documentation page to a template variable
    res.locals.data = req.app.get('nodeDoc');

    // Parses the values from the JSON to create the table in the doc page
    res.locals.keys = Object.keys(res.locals.data[0]);

    // Renders ejs template with local variables
    res.render(localTemplate);

});

// Returns records matching a given node label
router.get('/:node_label', function (req, res, next) {

    // Returning a list of nodes with given label
    session.run("MATCH (n:" + req.params.node_label + ") RETURN n")
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

// Returns records matching a specific :node_id
router.get('/:node_label/:node_id', function (req, res, next) {

    session.run("MATCH (n:" + req.params.node_label + " {id:" + req.params.node_id + "}) RETURN n;")
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

// Searches the dependency graph & constructs a query to find all nodes that serve the current (:node_label {id:node_id})
router.get('/:node_label/:node_id/depends_on', function (req, res, next) {

    session.run(cypher.dependsOn(req.params.node_label))
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var queryString = cypher.dependencyArray(records);

            if (queryString.length == 0) {
                res.json(queryString);
                session.close();
            } else {
                session.run(cypher.cypherQuery(queryString, req.params.node_id))
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
                    }).catch((error) => {
                        res.status(404).send(error);

                        // Close out the session object
                        session.close();
                    });
            }

        })
        .catch((error) => {
            res.status(404).send(error);

            // Close out the session objects
            session.close();
        });
});

// Searches the dependency graph & constructs a query to find all nodes that serve the current (:node_label {id:node_id}) and then filters them by :filter_label
router.get('/:node_label/:node_id/depends_on/filter/:filter_label', function (req, res, next) {

    session.run(cypher.dependsOn(req.params.node_label))
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var queryString = cypher.dependencyArray(records);

            if (queryString.length == 0) {
                res.json(queryString);
                session.close();
            } else {
                session.run(cypher.cypherQuery(queryString, req.params.node_id, req.params.filter_label))
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
                    }).catch((error) => {
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

// Searches the dependency graph & constructs a query to find all nodes that are require the current (:node_label {id:node_id})
router.get('/:node_label/:node_id/required_by', function (req, res, next) {

    session.run(cypher.requiredBy(req.params.node_label))
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var queryString = cypher.dependencyArray(records);

            // If this is a top level dependency, the dependcy array is empty
            if (queryString.length == 0) {
                res.json(queryString);
                session.close();
            } 

            // For all other dependencies, this array will have values
            else {
                session.run(cypher.reverseCypherQuery(queryString, req.params.node_id))
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
                    }).catch((error) => {
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

// Searches the dependency graph & constructs a query to find all nodes that are require the current (:node_label {id:node_id}) and then filters them by :filter_label
router.get('/:node_label/:node_id/required_by/filter/:filter_label', function (req, res, next) {

    session.run(cypher.requiredBy(req.params.node_label))
        .then(function (result) {
            var records = [];
            result.records.forEach((value) => {
                records.push(value);
            });
            return records;
        })
        .then((records) => {

            var queryString = cypher.dependencyArray(records);

            // If this is a top level dependency, the dependcy array is empty
            if (queryString.length == 0) {
                res.json(queryString);
                session.close();
            } 

            // For all other dependencies, this array will have values
            else {
                session.run(cypher.reverseCypherQuery(queryString, req.params.node_id, req.params.filter_label))
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
                    }).catch((error) => {
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
