var Influx = require('influxdb-nodejs');
var request = require('request');
var config = require('./../config');
var client = new Influx('http://206.189.250.118:8086/webdollar_private');

var fieldSchema = {
  mem_available: 'i',
  mem_free: 'i',
  mem_total: 'i',
  load_avg_1: 'i',
  load_avg_5: 'i',
  load_avg_15: 'i',
  cpu_count: 'i'
};

var tagSchema = {
  host: '*',
  account: '*',
  name: '*'
};

client.schema('hostero_hosts', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});

//client.createDatabase().then(console.log).catch(console.error);return;

request.get(config.rancher.project + '/hosts?limit=1000', {
  timeout: 10 * 1000
}, function(err, message, body) {
  if (err) {
    return;
  }

  var data = JSON.parse(body);
  var hosts = data.data;

  console.log('found hosts', hosts.length);

  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    client.write('hostero_hosts')
      .tag({
        host: host.id,
        account: host.labels.account,
        name: host.name || host.hostname
      })
      .field({
        mem_available: host.info.memoryInfo.memAvailable,
        mem_free: host.info.memoryInfo.memFree,
        mem_total: host.info.memoryInfo.memTotal,
        load_avg_1: host.info.cpuInfo.loadAvg[0],
        load_avg_5: host.info.cpuInfo.loadAvg[1],
        load_avg_15: host.info.cpuInfo.loadAvg[2],
        cpu_count: host.info.cpuInfo.count
      })
      .then(console.log)
      .catch(console.error);
  }
}).auth(config.rancher.key, config.rancher.secret);
