var express = require('express');
var path = require('path');
var fs = require("fs");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

// Neo4j username and password with fallback default values
global.neo4jusername = (grab("--neo4juser") == null) ? "neo4j" : grab("--neo4juser");
global.neo4jpassword = (grab("--neo4jpwd") == null) ? "neo4j" : grab("--neo4jpwd");
global.driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(global.neo4jusername, global.neo4jpassword));

// External Data
var dataFile = loadJSON('public/data/hospitals.geojson');
var apiDocumentation = loadJSON('public/data/api-documentation.json');
var nodeDocumentation = loadJSON('public/data/node-documentation.json');
var modelDocumentation = loadJSON('public/data/model-documentation.json');
var spatialDocumentation = loadJSON('public/data/spatial-documentation.json');
var wktDocumentation = loadJSON('public/data/wkt-documentation.json');
var pointDocumentation = loadJSON('public/data/point-documentation.json');

// Routes
var api = require('./routes/api');
var node = require('./routes/node');
var model = require('./routes/model');
var spatial = require('./routes/spatial');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set global data
// Documentation paths
app.set('hospitals', dataFile);
app.set('apiDoc', apiDocumentation);
app.set('nodeDoc', nodeDocumentation);
app.set('modelDoc', modelDocumentation);
app.set('spatialDoc', spatialDocumentation);
app.set('wktDoc', wktDocumentation);
app.set('pointDoc', pointDocumentation);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Code to enable cross domain requests
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
  if(req.method === 'OPTIONS'){
    res.end();
  } else{
    next();
  }
});

// Define application routes
app.use('/api', api);
app.use('/api/node', node);
app.use('/api/model', model);
app.use('/api/spatial', spatial);

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

// Functions

function loadJSON(myPath, encoding) {

  var theFile;
  var encoding;

  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }

  var theFile = fs.readFileSync(path.join(__dirname, myPath), encoding);
  return JSON.parse(theFile);
};

function grab(flag) {
  var index = process.argv.indexOf(flag);
  return (index === -1) ? null : process.argv[index + 1];
}

process.on('exit', function () {
  global.driver.close();
});

module.exports = app;