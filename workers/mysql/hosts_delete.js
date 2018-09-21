var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;

function find_host_in_hosts(host, hosts) {
  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host.internal_id == hosts[i].id) {
      return hosts[i];
    }
  }

  return null;
}

host_model.findAll({})
  .then(function(data) {
    var hosts = data;

    console.log('found hosts', hosts.length);

    rancher.hosts.query(function(err, message, body) {
      if (err && err.connect === true) {
        process.exit(0);
      }

      var data = JSON.parse(body);
      var result = data.data;

      console.log('found services', result.length);

      for (var i = 0, l = hosts.length; i < l; i++) {
        var host = hosts[i];

        var service_host = find_host_in_hosts(host, result);

        if (!service_host) {
          console.log('removed host', host.name);

          host_model.destroy({
              where: {
                id: host.id
              }
            })
            .then(console.log)
            .catch(console.error);
        }
      }
    });
  });
