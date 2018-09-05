var rancher = require('./../services').Rancher();
var config = require('./../config');

var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

function find_host_in_hosts(host, hosts) {
  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host.id == hosts[i].internal_id) {
      return hosts[i];
    }
  }

  return null;
}

rancher.hosts.query(function(err, message, body) {
  if (err) {
    return;
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

  host_model.findAll({})
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

          console.log('updating host in mysql', host.hostname);

          host_model.update({
              status: status,
            }, {
              where: {
                id: db_host.id
              }
            })
            .then(console.log)
            .catch(console.error);
        } else {
          console.log('removed host', host.hostname);
        }
      }
    })
    .catch(console.error);
});
