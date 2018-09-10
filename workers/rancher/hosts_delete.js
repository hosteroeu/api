var rancher = require('./../../services').Rancher();
var config = require('./../../config');

rancher.hosts.query(function(err, message, body) {
  var data = JSON.parse(body);
  var hosts = data.data;
  var result = [];
  var candidates = 0;

  console.log(hosts.length, 'hosts');

  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    if (host.state == 'inactive') {
      rancher.hosts.remove(host.id, console.log);

      continue;
    }

    if (host.agentState == 'disconnected') {
      rancher.hosts.deactivate(host.id, console.log);

      continue;
    }
  }
});
