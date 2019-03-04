var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  body_parser = require('body-parser'),
  method_override = require('method-override'),
  logger = require('morgan'),
  config = require('./config'),
  models = require('./models'),
  middleware = require('./middleware'),
  Raven = require('raven'),
  app = express();

Raven.config('https://d9a8c0f13550478997ffd66aad57b277@sentry.io/1395940').install();

// The request handler must be the first middleware on the app
app.use(Raven.requestHandler());

// The error handler must be before any other error middleware
app.use(Raven.errorHandler());

switch (app.get('env')) {
  case 'production':
    app.use(logger('combined'));
    break;

  default:
    app.use(logger('combined'));
    break;
}

app.enable('trust proxy');

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(body_parser.json());
app.use(body_parser.urlencoded({
  extended: true
}));
app.use(method_override());

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  next();
});

// Pre-flight and ELB requests
app.options('*', function(req, res) {
  res.send(200);
});

// Require and init routes
var routes_path = path.join(__dirname, 'routes');

fs.readdirSync(routes_path).forEach(function(file) {
  var file_path = path.join(routes_path, file),
    stat = fs.statSync(file_path);

  if (stat.isFile() && /(.*)\.js$/.test(file)) {
    var router = express.Router(),
      file_name = file.match(/(.*).js/)[1];

    require(file_path)(app, router);

    // Some endpoints don't need the version prefix
    if (file_name === 'home') {
      app.use(router);
    } else {
      app.use('/' + config.version, router);
    }
  }
});

models.sequelize.sync({
  //force: true
}).then(function() {
  console.log('Db synced');
});

app.use(middleware.handlers.errors);

module.exports = app;
