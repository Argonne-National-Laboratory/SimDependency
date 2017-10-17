var express = require('express');
var path = require('path');
var fs = require("fs");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Neo4j username and password with fallback default values
global.neo4jusername = (grab("--neo4juser") == null) ? "neo4j" : grab("--neo4juser");
global.neo4jpassword = (grab("--neo4jpwd") == null) ? "neo4j" : grab("--neo4jpwd");

var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(global.neo4jusername, global.neo4jpassword));
var session = driver.session();

// External Data
var geojsonFile = loadJSON('public/data/zayo-us-network-metro-consolidated.geojson', 'utf8', { featureType: "Fiber", type: "metro" }, { name: "Name", oid: "OID_" }, postGeoJSON);

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function loadJSON(myPath, encoding, staticProperties, dynamicProperties, callback) {

  var theFile;
  var encoding;

  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }

  var theFile = fs.readFileSync(path.join(__dirname, myPath), encoding);
  var parsedFile = JSON.parse(theFile);

  return callback(parsedFile, staticProperties, dynamicProperties);
};

function postGeoJSON(parsedFile, staticProperties, dynamicProperties) {

  var isPointLayer = (parsedFile.features[0].geometry.type == "Point") ? true : false;
  var isValidGeoJson = (typeof (parsedFile.features) != 'undefined' && parsedFile.features.length > 0) ? true : false;
  var chunkSize = 5000;

  if (isValidGeoJson) {

    // Set cypher query to create nodes based on layer properties
    var queryString = cypherQuery(isPointLayer, staticProperties, dynamicProperties);

    // Break large geojson files into manageable chunks determined by chunkSize
    var iterations = Math.floor(parsedFile.features.length / chunkSize);

    if (parsedFile.features.length % chunkSize > 0) {
      iterations++;
    }

    var copyOfFeatures = parsedFile.features;

    for (var i = 0; i < iterations; i++) {

      // Cuts down the features array to smaller pieces and embeds them back into parsed geojson
      if (i < iterations - 1) {
        parsedFile.features = copyOfFeatures.slice(i * chunkSize, (i + 1) * chunkSize);
      } else {
        // This handles the last segment of the array, the remainder
        parsedFile.features = copyOfFeatures.slice(i * chunkSize, copyOfFeatures.length);
      }

      console.log("Number of features: " + parsedFile.features.length);
      console.log("beginning query...")
      // session.run(queryString, {json: parsedFile})
      //   .then(function (result) {
      //     var records = [];
      //     result.records.forEach((value) => {
      //       records.push(value);
      //     });
      //     console.log("query completed");
      //     session.close();
      //     driver.close();
      //     return records;
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     // Close out the session objects
      //     session.close();
      //     driver.close();
      //   });

      console.log(queryString);
    }


  } else {
    console.log("Your file is not a valid geojson");
  }
}

function grab(flag) {
  var index = process.argv.indexOf(flag);
  return (index === -1) ? null : process.argv[index + 1];
}

function cypherQuery(isPointLayer, staticProperties, dynamicProperties) {
  // Variable will hold fully formed cypher statement
  var queryString = "";

  // Different node creation behavior based no whether the geojson layer is Points or LineStrings
  if (isPointLayer) {
    queryString = "WITH {json} as data UNWIND data.features as features MERGE (f:" + staticProperties.featureType + " {latitude:features.geometry.coordinates[1], longitude:features.geometry.coordinates[0]})";
  } else {
    queryString = "WITH {json} as data UNWIND data.features as features MERGE (f:" + staticProperties.featureType + " {wkt:features.properties.wkt})";
  }

  // Sets the properties as node is created in database
  var propertyString = "";

  // Handles edge cases where static and dynamic properties objects are of different length
  if (Object.keys(staticProperties).length > 1) {
    propertyString = " ON CREATE SET ";
  } else if (Object.keys(staticProperties).length == 1 && Object.keys(dynamicProperties).length > 0) {
    propertyString = " ON CREATE SET ";
  }

  // Reads the static (global) properties object and generates the correct cypher statements to set values on each node
  Object.keys(staticProperties).forEach((value, index) => {
    if (value == "featureType") {
      // Do Nothing
    } else {
      propertyString += "f." + value + "='" + staticProperties[value] + "'";

      if (index < Object.keys(staticProperties).length - 1) {
        propertyString += ", ";
      }
    }
  });

  // Reads the dynamic (per node) properties object and generates the correct cypher statements to set values on a node-by-node basis
  Object.keys(dynamicProperties).forEach((value, index) => {

    if (index == 0 && !(Object.keys(staticProperties).length == 1 && Object.keys(dynamicProperties).length > 0)) {
      propertyString += ", ";
    }

    propertyString += "f." + value + "=feature.properties." + dynamicProperties[value];

    if (index < Object.keys(dynamicProperties).length - 1) {
      propertyString += ", ";
    }
  });

  // Appends the property setting clauses to the general query skeleton
  queryString += propertyString;

  return queryString;
}

module.exports = app;
