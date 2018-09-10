var request = require('request');

var config = require('./rancher_credentials.json');
var key = config.WEBDOLLAR_OLD.key;
var secret = config.WEBDOLLAR_OLD.secret;
var url = config.WEBDOLLAR_OLD.url;

//require('request-debug')(request);

request.get(url + '/services?name_prefix=webd&healthState=unhealthy', function(err, message, body) {
  var data = JSON.parse(body);
  var services = data.data;

  console.log(services.length, 'services unhealthy');

  for (var i = 0, l = services.length; i < l; i++) {
    var service = services[i];

    // Delete just services which are not stopped manually
    if (service.state !== 'active') {
      console.log('deleting', service.name);
      request.post(url + '/services/' + service.id + '/?action=remove', console.log).auth(key, secret, false);
    }
  }
}).auth(key, secret, false);
