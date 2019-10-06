var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

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
  var hosts = data.data;
  var result = [];

  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    if (host.labels.account) {
      console.log('found rancher host', host.id);

      result.push(host);
    }
  }

  console.log('rancher hosts', result.length);

  host_model.findAll({
      include: [{
        model: account_model
      }]
    })
    .then(function(data) {
      var hosts = data;

      for (var i = 0, l = result.length; i < l; i++) {
        var host = result[i];

        var db_host = find_host_in_hosts(host, hosts);

        if (db_host) {
          var status = 'stopped';

          if (host.agentState !== 'disconnected') {
            status = 'started';
          }

          if (db_host.status == status) {
            console.log('skipping host in mysql', host.hostname);

            continue;
          }

          console.log('removing host in mysql', host.hostname);

          host_model.destroy({
              where: {
                id: db_host.id
              }
            })
            .then(function() {
              log_model.create({
                user_id: db_host.Account.user_id,
                account_id: db_host.Account.id,
                entity: 'host',
                entity_id: db_host.id,
                event: 'delete',
                message: 'Removed a device',
                extra_message: null,
                source: 'hosts_update'
              });
            })
            .catch(sentry.Raven.captureException);
        } else {
          console.log('removed host', host.hostname);
        }
      }
    })
    .catch(sentry.Raven.captureException);
});
