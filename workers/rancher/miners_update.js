var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;
var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

function find_miner_in_miners(miner, miners) {
  for (var i = 0, l = miners.length; i < l; i++) {
    if (miner.id == miners[i].internal_id) {
      return miners[i];
    }
  }

  return null;
}

rancher.services.query(function(err, message, body) {
  if (err && err.connect === true) {
    process.exit(0);
  }

  var data = JSON.parse(body);
  var result = data.data;

  console.log('found services', result.length);

  miner_model.findAll({
      include: [{
        model: host_model,
        include: [{
          model: account_model,
          where: {
            rancher_uri: rancher_uri
          }
        }]
      }]
    })
    .then(function(data) {
      var miners = data;

      console.log('found miners', miners.length);

      for (var i = 0, l = result.length; i < l; i++) {
        var miner = result[i];

        if (!miner.launchConfig.labels.purpose) {
          continue;
        }

        var db_miner = find_miner_in_miners(miner, miners);

        if (db_miner) {
          var status = 'started';

          if (miner.state !== 'active') {
            status = 'stopped';
          }

          if (db_miner.status == status) {
            console.log('skipping miner in mysql', miner.name);

            continue;
          }

          console.log('updating miner in mysql', miner.name);

          miner_model.update({
              status: status,
            }, {
              where: {
                id: db_miner.id
              }
            })
            .then(console.log)
            .catch(sentry.Raven.captureException);

          log_model.create({
            user_id: db_miner.Host.Account.user_id,
            account_id: db_miner.Host.Account.id,
            entity: 'miner',
            entity_id: db_miner.id,
            event: 'update',
            message: 'Updated a miner',
            extra_message: JSON.stringify({
              status: status
            }),
            source: 'miners_update'
          });
        } else {
          console.log('Miner not in MySQL', miner.name);
        }
      }
    })
    .catch(sentry.Raven.captureException);
});
