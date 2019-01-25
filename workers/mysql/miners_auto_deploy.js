var moment = require('moment');
var rancher = require('./../../services').Rancher();
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
  }).then(function(data) {
    var hosts = data;

    console.log('Hosts not deployed found', hosts.length);

    for (var i = 0, l = hosts.length; i < l; i++) {
      var host = hosts[i];
      var account = host.Account;
      var auto_deploy = account.auto_deploy;

      if (!auto_deploy) {
        console.log('Host', host.id, 'not auto-deployed, because auto_deploy is not set');
        continue;
      }

      (function(_host, _account) {
        miner_model.findAll({
          where: {
            user_id: _account.user_id
          }
        }).then(function(data) {
          var miners = data;
          var account_miners = _account.plan_miners + _account.bonus_miners;

          if (miners.length >= account_miners) {
            console.error('Host', _host.id, 'not auto-deployed, because no credit', miners.length, account_miners);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'host',
              entity_id: _host.id,
              event: 'error',
              message: 'Error auto-deploying host',
              extra_message: JSON.stringify(_host)
            });

            return;
          }

          var new_miner = miner_util.template.create(_account.auto_deploy_coin);

          new_miner.user_id = _account.user_id;

          switch (_account.auto_deploy_coin) {
            case 'webdollar':
              if (_account.mining_pool_url_webdollar && _account.wallet_webdollar) {
                new_miner.mining_pool_url = _account.mining_pool_url_webdollar;
                new_miner.wallet = _account.wallet_webdollar;
              }
              break;

            case 'nerva':
              if (_account.wallet_nerva) {
                new_miner.wallet = _account.wallet_nerva;
              }
              break;

            case 'webchain':
              if (_account.wallet_webchain) {
                new_miner.wallet = _account.wallet_webchain;
                new_miner.password = _account.password_webchain;
                new_miner.mining_pool_url = _account.mining_pool_url_webchain;
              }
              break;

            case 'veruscoin':
              if (_account.wallet_veruscoin) {
                new_miner.wallet = _account.wallet_veruscoin;
                new_miner.password = _account.password_veruscoin;
                new_miner.mining_pool_url = _account.mining_pool_url_veruscoin;
              }
              break;
          }

          host_model.update({
              deployed: '2'
            }, {
              where: {
                id: _host.id
              }
            })
            .then(function(data) {
              new_miner.name = 'miner-' + _host.id;
              new_miner.threads = _host.cpu_count || '0';
              new_miner.host_id = _host.id;

              miner_model.create(new_miner)
                .then(function(data) {
                  log_model.create({
                    user_id: _account.user_id,
                    account_id: _account.id,
                    entity: 'miner',
                    entity_id: data.id,
                    event: 'create',
                    message: 'Created a miner',
                    extra_message: JSON.stringify(data)
                  });
                })
                .catch(console.error);
            })
            .catch(console.error);
        });
      })(host, account);
    }
  })
  .catch(console.error);
