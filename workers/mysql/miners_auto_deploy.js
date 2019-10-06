var sentry = require('./../../services').Sentry();
var moment = require('moment');
var _ = require('underscore');
var miner_util = require('./../../utils').Miner();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

host_model.findAll({
    where: {
      deployed: '0',
      created_at: {
        $gte: moment().subtract(1, 'hours').toDate()
      }
    },
    include: [{
      model: account_model
    }]
  }).then(function(hosts) {
    console.log('Hosts not deployed found', hosts.length);

    for (var i = 0, l = hosts.length; i < l; i++) {
      var host = hosts[i];
      var account = host.Account;

      if (!account.auto_deploy) {
        console.log('Host', host.id, 'not auto-deployed, because auto_deploy is not set');
        continue;
      }

      (function(_host, _account) {
        miner_model.findAll({
          where: {
            user_id: _account.user_id
          },
          logging: false
        }).then(function(miners) {
          var account_miners = _account.plan_miners + _account.bonus_miners;

          if (miners.length >= account_miners) {
            console.log('Host', _host.id, 'not auto-deployed, because no credit', miners.length, account_miners);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'host',
              entity_id: _host.id,
              event: 'error',
              message: 'Error auto-deploying host',
              extra_message: JSON.stringify(_host),
              source: 'miners_auto_deploy'
            });

            return;
          }

          var new_miner = miner_util.template.create(_account.auto_deploy_coin);

          new_miner.name = 'miner-' + _host.id;
          new_miner.user_id = _account.user_id;
          new_miner.processor = _account.default_processor;
          new_miner.threads = _host.cpu_count || '0';
          new_miner.host_id = _host.id;
          new_miner.type = _account.miner_webdollar;

          if (_account.auto_deploy_coin === 'nerva') {
            if (_account.wallet_nerva) {
              new_miner.wallet = _account.wallet_nerva;
            }
          } else {
            if (_account['wallet_' + _account.auto_deploy_coin]) {
              new_miner.wallet = _account['wallet_' + _account.auto_deploy_coin];
              new_miner.password = _account['password_' + _account.auto_deploy_coin];
              new_miner.mining_pool_url = _account['mining_pool_url_' + _account.auto_deploy_coin];
            }
          }

          miner_model.create(new_miner)
            .then(function(data) {
              log_model.create({
                user_id: _account.user_id,
                account_id: _account.id,
                entity: 'miner',
                entity_id: data.id,
                event: 'create',
                message: 'Created a miner',
                extra_message: JSON.stringify(data),
                source: 'miners_auto_deploy'
              });
            })
            .catch(sentry.Raven.captureException);

          host_model.update({
              deployed: '2'
            }, {
              where: {
                id: _host.id
              }
            })
            .then(_.noop)
            .catch(sentry.Raven.captureException);
        });
      })(host, account);
    }
  })
  .catch(sentry.Raven.captureException);
