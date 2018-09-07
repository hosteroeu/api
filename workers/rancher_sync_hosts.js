var rancher = require('./../services').Rancher();
var config = require('./../config');

var miner_model = require('./../models').miner.model;
var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

setTimeout(process.exit, 50 * 1000);

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
  if (err) {
    return;
  }

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

                var auto_deploy = account.auto_deploy === true && account.mining_pool_url && account.wallet;

                host_model.create({
                    name: _host.name || _host.hostname,
                    user_id: account.user_id,
                    account_id: account.id,
                    status: 'started',
                    deployed: auto_deploy ? '2' : '0',
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
                  .then(function(data) {
                    if (auto_deploy) {
                      var host = data;

                      miner_model.create({
                          name: 'webd-miner-' + host.id,
                          status: 'stopped',
                          server_port: '8000',
                          mining_pool_url: account.mining_pool_url,
                          domain: 'wd.hoste.ro',
                          wallet: account.wallet,
                          terminal_workers_type: 'cpu-cpp',
                          terminal_workers_cpu_max: host.cpu_count || '0',
                          image_uuid: 'docker:morion4000/node:pool_miner_cpp',
                          command: 'sh start_pool_mining.sh',
                          wallet_secret_url: '7e5d522a70ce4c455f6875d01c22727e',
                          host_id: host.id,
                          user_id: account.user_id
                        })
                        .then(console.log)
                        .catch(console.error);
                    }
                  })
                  .catch(console.error);
              })
              .catch(console.error);
          })(host);
        }
      }
    })
    .catch(console.error);
});
