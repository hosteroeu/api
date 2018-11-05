var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;

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

                var auto_deploy = false;
                var new_miner = {
                  coin: account.auto_deploy_coin,
                  status: 'stopped',
                  deployed: '2',
                  user_id: account.user_id
                };

                if (account.auto_deploy) {
                  switch (account.auto_deploy_coin) {
                    case 'webdollar':
                      if (account.mining_pool_url_webdollar && account.wallet_webdollar) {
                        auto_deploy = true;

                        new_miner.server_port = '8000';
                        new_miner.mining_pool_url = account.mining_pool_url_webdollar;
                        new_miner.domain = 'wd.hoste.ro';
                        new_miner.wallet = account.wallet_webdollar;
                        new_miner.image_uuid = 'docker:morion4000/node:v2';
                        new_miner.command = 'sh start_pool_mining.sh';
                        new_miner.wallet_secret_url = '7e5d522a70ce4c455f6875d01c22727e';
                      }
                      break;

                    case 'nerva':
                      if (account.wallet_nerva) {
                        auto_deploy = true;

                        new_miner.wallet = account.wallet_nerva;
                        new_miner.image_uuid = 'docker:morion4000/nerva';
                      }
                      break;
                  }
                }

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
                    cpu_model: _host.info.cpuInfo.modelName,
                    agent_ip: _host.agentIpAddress,
                  })
                  .then(function(data) {
                    if (auto_deploy) {
                      var host = data;

                      new_miner.name = 'miner-' + host.id;
                      new_miner.threads = host.cpu_count || '0';
                      new_miner.host_id = host.id;

                      miner_model.create(new_miner)
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
