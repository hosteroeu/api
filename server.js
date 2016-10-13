var express = require('express');
var app = express();
var jwt = require('express-jwt');
var rsaValidation = require('auth0-api-jwt-rsa-validation');

var port = process.env.PORT || 80;

var jwtCheck = jwt({
  secret: rsaValidation(),
  algorithms: ['RS256'],
  issuer: 'https://morion4000.auth0.com/',
  audience: 'http://api.hoste.ro'
});

var instances = [{
  id: 1,
  name: 'My WordPress Instance',
  cpu: 0.2,
  ram: 512,
  scale: 1,
  created_at: '1476258811819',
  updated_at: '1476258811819'
}];

//app.use(jwtCheck);

app.get('/v1/instances', function(req, res) {
  res.send(instances);
});

app.listen(port);
