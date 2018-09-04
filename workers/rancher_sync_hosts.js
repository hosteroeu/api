var rancher = require('./../services').Rancher();
var config = require('./../config');

var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

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
  var data = JSON.parse(body);
  var hosts = data.data;
  var result = [];

  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    if (host.agentState !== 'disconnected' && host.labels.account) {
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

        if (!find_host_in_hosts(host, hosts)) {
          var name = host.name || host.hostname;

          console.log('adding to mysql', name);

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
                    name: name,
                    user_id: _host.labels.account,
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
                    cpu_model: _host.info.cpuInfo.modelName
                  })
                  .then(console.log)
                  .catch(console.error);
              })
              .catch(console.error);
          })(host);
        }
      }
    })
    .catch(console.error);
});
