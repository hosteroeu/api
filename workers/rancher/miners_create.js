var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var rancher = require('./../../services').Rancher(rancher_uri);

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

miner_model.findAll({
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
  .then(function(miners) {
    console.log('found miners', miners.length);

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];

      if (!miner.Host) {
        continue;
      }

      var account = miner.Host.Account;

      if (!miner.internal_id) {
        (function(_miner, _account) {
          console.log('deploying miner', _miner.id, _account.name, _miner.coin, _miner.wallet);

          rancher.services.create({
            body: {
              id: _miner.id,
              mode: _miner.mode,
              name: _miner.name,
              coin: _miner.coin,
              user_id: _miner.user_id,
              type: _miner.type,
              wallet: _miner.wallet || '',
              mining_pool_url: _miner.mining_pool_url || '',
              password: _miner.password || '',
              threads: _miner.threads,
              processor: _miner.processor,
              image_uuid: _miner.image_uuid,
              rancher_host_id: _miner.Host.internal_id,
              host_id: _miner.Host.id,
              account_id: _miner.Host.account_id,
              stack_id: _account.internal_id
            }
          }, {}, function(err, body) {
            if (err) {
              sentry.Raven.captureException(err);
              return;
            }

            if (body.type === 'error') {
              sentry.Raven.captureException(body.code);
              return;
            }

            console.log('deployed', body.id);

            miner_model.update({
                status: 'started',
                deployed: '1',
                internal_id: body.id,
                internal_created: body.createdTS
              }, {
                where: {
                  id: _miner.id
                }
              })
              .then(_.noop)
              .catch(sentry.Raven.captureException);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'miner',
              entity_id: _miner.id,
              event: 'update',
              message: 'Updated a miner',
              extra_message: JSON.stringify({
                status: 'started',
                deployed: '1'
              }),
              source: 'miners_create'
            });

            host_model.update({
                deployed: '1'
              }, {
                where: {
                  id: _miner.Host.id
                }
              })
              .then(_.noop)
              .catch(sentry.Raven.captureException);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'host',
              entity_id: _miner.Host.id,
              event: 'update',
              message: 'Updated a host',
              extra_message: JSON.stringify({
                deployed: '1'
              }),
              source: 'miners_create'
            });
          });
        })(miner, account);
      }
    }
  })
  .catch(sentry.Raven.captureException);
