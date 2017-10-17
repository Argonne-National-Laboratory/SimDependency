var express = require('express');
var router = express.Router();
var cypher = require('../public/javascripts/cypher');
// var neo4j = require('neo4j-driver').v1;
// var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(global.neo4jusername, global.neo4jpassword));
var driver = global.driver;
var session = driver.session();

// Used to set the path to the template view, makes code easily reusable
var localTemplate = 'docpage';

// Node documentation subpage
router.get('/', function (req, res, next) {

    res.locals.data = req.app.get('modelDoc');
    res.locals.keys = Object.keys(res.locals.data[0]);
    res.render(localTemplate);

});

router.get('/all', function (req, res, next) {

    // Returning metadata for all nodes
    session.run("MATCH (n:DepModel) RETURN n")
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

router.get('/:node_label', function (req, res, next) {

    // Returning metadata for specific node labels nodes
    session.run("MATCH (n:DepModel {label:'" + req.params.node_label + "'}) RETURN n")
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

router.get('/:node_label/depends_on', function (req, res, next) {

    // Returning metadata for specific node labels nodes
    session.run(cypher.dependsOn(req.params.node_label))
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

router.get('/:node_label/required_by', function (req, res, next) {

    // Returning metadata for specific node labels nodes
    session.run(cypher.requiredBy(req.params.node_label))
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

module.exports = router;
