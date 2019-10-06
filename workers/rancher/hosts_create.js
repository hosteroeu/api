var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher(rancher_uri);

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

function find_host_in_hosts(host, hosts) {
  var found = false;

  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host.id == hosts[i].internal_id) {
      found = true;
      break;
    }
  }

  return found;
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

    if (host.agentState !== 'disconnected' && host.labels.account) {
      //console.log('found rancher host', host.id);

      result.push(host);
    }
  }

  console.log('rancher hosts', result.length);

  host_model.findAll({})
    .then(function(data) {
      var hosts = data;

      console.log('mysql hosts', hosts.length);

      for (var i = 0, l = result.length; i < l; i++) {
        var host = result[i];

        if (!find_host_in_hosts(host, hosts)) {
          console.log('adding to mysql', host.hostname);

          (function(_host) {
            account_model.findOne({
                where: {
                  name: _host.labels.account
                }
              })
              .then(function(account) {
                if (!account) return;

                console.log('account', account.id);

                host_model.create({
                    name: _host.name || _host.hostname,
                    user_id: account.user_id,
                    account_id: account.id,
                    status: 'started',
                    deployed: '0',
                    internal_id: _host.id,
                    internal_created: _host.createdTS,
                    hostname: _host.hostname,
                    docker_version: _host.info.osInfo.dockerVersion,
                    os: _host.info.osInfo.operatingSystem,
                    os_kernel: _host.info.osInfo.kernelVersion,
                    memory_total: _host.info.memoryInfo.memTotal,
                    cpu_count: _host.info.cpuInfo.count,
                    cpu_mhz: _host.info.cpuInfo.mhz,
                    cpu_model: _host.info.cpuInfo.modelName,
                    agent_ip: _host.agentIpAddress,
                  })
                  .then(function(data) {
                    log_model.create({
                      user_id: account.user_id,
                      account_id: account.id,
                      entity: 'host',
                      entity_id: data.id,
                      event: 'create',
                      message: 'Created a new device',
                      extra_message: JSON.stringify(data),
                      source: 'hosts_create'
                    });
                  })
                  .catch(function(err) {
                    log_model.create({
                      user_id: account.user_id,
                      account_id: account.id,
                      entity: 'host',
                      entity_id: null,
                      event: 'error',
                      message: 'Error creating a new device',
                      extra_message: JSON.stringify(err),
                      source: 'hosts_create'
                    });
                  });
              })
              .catch(sentry.Raven.captureException);
          })(host);
        }
      }
    })
    .catch(sentry.Raven.captureException);
});
