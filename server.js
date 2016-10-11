var express = require('express');
var app = express();
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');

var port = process.env.PORT || 8080;

var jwtCheck = jwt({
  secret: rsaValidation(),
  algorithms: ['RS256'],
  issuer: 'https://morion4000.auth0.com/',
  audience: 'http://medusa.hoste.ro'
});

app.get('/', function(req, res) {
  res.send('Yellow');
});

app.use(jwtCheck);

app.get('/authorized', function(req, res) {
  res.send('Secured Resource');
});

app.listen(port);
