var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var moment = require('moment');
var _ = require('underscore');
var rancher = require('./../../services').Rancher(rancher_uri);

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

function find_miner_in_miners(miner, miners) {
  for (var i = 0, l = miners.length; i < l; i++) {
    if (miner.internal_id == miners[i].id) {
      return miners[i];
    }
  }

  return null;
}

miner_model.findAll({
    where: {
      created_at: {
        $lte: moment().subtract(2, 'minutes').toDate()
      },
      status: 'started'
    },
    include: [{
      model: host_model,
      include: [{
        model: account_model,
        where: {
          rancher_uri: rancher_uri
        }
      }]
    }],
    logging: false
  })
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    rancher.services.query(function(err, message, body) {
      if (err && err.connect === true) {
        process.exit(0);
      }

      var data = JSON.parse(body);
      var result = data.data;

      console.log('found services', result.length);

      for (var i = 0, l = miners.length; i < l; i++) {
        var miner = miners[i];

        var service_miner = find_miner_in_miners(miner, result);

        // Do not delete miners which are being deployed
        if (!service_miner && miner.deployed != '2') {
          console.log('removed miner', miner.name);

          miner_model.destroy({
              where: {
                id: miner.id
              }
            })
            .then(_.noop)
            .catch(sentry.Raven.captureException);

          /*
          host_model.update({
              miners: miner.Host.miners - 1
            }, {
              where: {
                id: miner.Host.id
              }
            })
            .then(_.noop)
            .catch(sentry.Raven.captureException);
          */

          log_model.create({
            user_id: miner.Host.Account.user_id,
            account_id: miner.Host.Account.id,
            entity: 'miner',
            entity_id: miner.id,
            event: 'delete',
            message: 'Removed a miner',
            extra_message: JSON.stringify(miner),
            source: 'miners_delete_db'
          });
        }
      }
    });
  });
