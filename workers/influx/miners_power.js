var Influx = require('influxdb-nodejs');
var request = require('request');
var config = require('./../../config');
var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var client = new Influx('http://206.189.250.118:8086/webdollar_private');

var fieldSchema = {
  power: 'i',
  threads: 'i',
  cpu_count: 'i',
  cpu_mhz: 'i'
};

var tagSchema = {
  miner: '*',
  account: '*',
  coin: '*',
};

client.schema('hostero_miners_power', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});

//client.createDatabase().then(console.log).catch(console.error);return;

miner_model.findAll({
    include: [{
      model: host_model,
      include: [{
        model: account_model
      }]
    }]
  })
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];

      console.log('miner', miner.id);

      client.write('hostero_miners_power')
        .tag({
          miner: miner.id,
          account: miner.Host.Account.name,
          coin: miner.coin
        })
        .field({
          power: miner.power,
          threads: miner.threads,
          cpu_count: miner.Host.cpu_count,
          cpu_mhz: miner.Host.cpu_mhz
        })
        .queue();
    }

    client.syncWrite()
      .then(console.log)
      .catch(console.error);
  });
