var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher(rancher_uri);

var host_model = require('./../../models').host.model;
var miner_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;

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
      var load_1_min = host.info.cpuInfo.loadAvg[0];
      var cpus = host.info.cpuInfo.count;

      if (load_1_min < cpus/2) {
        console.log('found rancher host', host.hostname);

        result.push(host);
      }
    }
  }

  console.log('rancher hosts', result.length);
});
