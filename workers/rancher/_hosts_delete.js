var rancher = require('./../../services').Rancher();
var config = require('./../../config');

// Figure out how to delete hosts...

var host_model = require('./../../models').host.model;

function find_host_in_hosts(host, hosts) {
  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host.id == hosts[i].internal_id) {
      return hosts[i];
    }
  }

  return null;
}

rancher.hosts.query(function(err, message, body) {
  if (err && err.connect === true) {
    process.exit(0);
  }

  var data = JSON.parse(body);
  var services = data.data;

  console.log(services.length, 'services');

  host_model.findAll({})
    .then(function(data) {
      var hosts = data;

      console.log('found hosts', hosts.length);

      for (var i = 0, l = services.length; i < l; i++) {
        var service = services[i];

        var host = find_host_in_hosts(service, hosts);

        if (!host) {
          console.log('removed host', service.id);

          rancher.hosts.remove(service.id);
        }
      }
    });
});
