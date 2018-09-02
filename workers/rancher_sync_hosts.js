var rancher = require('./../services').Rancher();
var config = require('./../config');

var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

function find_host_in_hosts(host, hosts) {
  var found = false;

  for (var i = 0, l = hosts.length; i < l; i++) {
    if (host === hosts[i].rancher_host_id) {
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

        if (!find_host_in_hosts(host, hosts)) {
          var name = host.name || host.hostname;

          console.log('adding to mysql', name);

          account_model.findOne({
              where: {
                user_id: host.labels.account
              }
            })
            .then(function(account) {
              console.log('account', account.id);

              if (!account) return;

              host_model.create({
                  name: name,
                  user_id: host.labels.account,
                  account_id: account.id,
                  status: 'started',
                  internal_id: host.id,
                  internal_created: host.createdTS,
                  hostname: host.hostname,
                  docker_version: host.info.osInfo.dockerVersion,
                  os: host.info.osInfo.operatingSystem,
                  os_kernel: host.info.osInfo.kernelVersion,
                  memory_total: host.info.memoryInfo.memTotal,
                  cpu_count: host.info.cpuInfo.count,
                  cpu_mhz: host.info.cpuInfo.mhz,
                  cpu_model: host.info.cpuInfo.modelName
                })
                .then(console.log)
                .catch(console.error);
            })
            .catch(console.error);
        }
      }
    })
    .catch(console.error);
});
