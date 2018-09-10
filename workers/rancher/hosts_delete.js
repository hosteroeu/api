var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var config = require('./rancher_credentials.json');
var key = config.WEBDOLLAR_OLD.key;
var secret = config.WEBDOLLAR_OLD.secret;
var url = config.WEBDOLLAR_OLD.url;
var url2 = config.MASTER_OLD.url;

//require('request-debug')(request);

request.get(url + '/hosts', function(err, message, body) {
  var data = JSON.parse(body);
  var hosts = data.data;
  var result = [];
  var candidates = 0;

  console.log(hosts.length, 'hosts');

  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    if (host.state == 'inactive') {
      request.delete(url2 + '/hosts/' + host.id, console.log).auth(key, secret, false);

      continue;
    }

    if (host.agentState == 'disconnected') {
      request.post(url2 + '/hosts/' + host.id + '/?action=deactivate', console.log).auth(key, secret, false);

      continue;
    }
  }
}).auth(key, secret, false);
