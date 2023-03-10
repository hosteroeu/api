var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher(rancher_uri);

var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

function find_host_in_hosts(host, hosts) {
  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host.internal_id == hosts[i].id) {
      return hosts[i];
    }
  }

  return null;
}

host_model.findAll({
    include: [{
      model: account_model
    }]
  })
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
            .then(function() {
              log_model.create({
                user_id: host.Account.user_id,
                account_id: host.Account.id,
                entity: 'host',
                entity_id: host.id,
                event: 'delete',
                message: 'Removed a device',
                extra_message: null,
                source: 'hosts_delete'
              });
            })
            .catch(sentry.Raven.captureException);
        }
      }
    });
  });
