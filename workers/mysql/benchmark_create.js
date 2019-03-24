var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var config = require('./../../config');

var host_model = require('./../../models').host.model;
var miner_model = require('./../../models').miner.model;
var benchmark_model = require('./../../models').benchmark.model;

miner_model.findAll({
    include: [{
      model: host_model
    }],
    where: {
      temporary: 0
    }
  })
  .then(function(miners) {
    console.log('found miners', miners.length);

    var indexed = {};

    for (var i = 0; i < miners.length; i++) {
      var miner = miners[i];
      var index = miner.coin + ' ' + miner.Host.cpu_model;

      if (parseInt(miner.threads) <= 0) {
        console.log('Skipping. Too few threads');
        continue;
      }

      if (miner.type === 'legacy') {
        console.log('Skipping. WebDollar legacy miner');
        continue;
      }

      // TODO: Do average, not max
      if (indexed[index] && indexed[index].power > miner.power) {
        continue;
      }

      indexed[index] = miner;
    }

    for (var index in indexed) {
      console.log(index);

      var miner = indexed[index];

      if (miner.power === 0) {
        console.log('Skipping. Hashrate is 0');
        continue;
      }

      benchmark_model.create({
          coin: miner.coin,
          power: miner.power,
          threads: miner.threads,
          cpu_count: miner.Host.cpu_count,
          cpu_mhz: miner.Host.cpu_mhz,
          cpu_model: miner.Host.cpu_model.replace(/\s+/g, " "),
          os: miner.Host.os,
          os_kernel: miner.Host.os_kernel,
          docker_version: miner.Host.docker_version,
          memory_total: miner.Host.memory_total
        })
        .then(_.noop)
        .catch(sentry.Raven.captureException);
    }
  });
