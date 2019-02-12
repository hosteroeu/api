var request = require('request');
var _ = require('underscore');
var rancher = require('./../../services').Rancher();
var miner_util = require('./../../utils').Miner();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

var url = 'http://is_pos.wd.hoste.ro';

request.get(url, function(err, message, body) {
  var is_pos = JSON.parse(body);

  console.log('is_pos', is_pos);

  //is_pos = true;

  if (is_pos) {
    miner_model.findAll({
        include: [{
          model: host_model,
          include: [{
            model: account_model
          }]
        }],
        where: {
          coin: 'webdollar'
        },
        logging: false
      })
      .then(function(data) {
        var miners = data;

        console.log('found miners', miners.length);

        for (var i = 0, l = miners.length; i < l; i++) {
          var miner = miners[i];
          var _host = miner.Host;
          var _account = miner.Host.Account;

          if (!_account.auto_deploy_idle || !_account.auto_deploy_coin_idle) {
            continue;
          }

          if (miner.status !== 'started') {
            continue;
          }

          if (miner.Host.miners > 1) {
            continue;
          }

          var new_miner = miner_util.template.create(_account.auto_deploy_coin);

          new_miner.user_id = _account.user_id;
          new_miner.name = 'miner-' + _host.id + '-1';
          new_miner.threads = _host.cpu_count || '0';
          new_miner.host_id = _host.id;
          new_miner.temporary = true;

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

          console.log('creating a new temporary miner', new_miner);

          miner_model.create(new_miner)
            .then(function(data) {
              log_model.create({
                user_id: _account.user_id,
                account_id: _account.id,
                entity: 'miner',
                entity_id: data.id,
                event: 'create',
                message: 'Created a temporary miner',
                extra_message: JSON.stringify(data)
              });
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  } else {
    miner_model.findAll({
        where: {
          temporary: true
        },
        logging: false
      })
      .then(function(data) {
        var miners = data;

        console.log('found temporary miners', miners.length);

        for (var i = 0, l = miners.length; i < l; i++) {
          var miner = miners[i];

          host_model.update({
              miners: miner.Host.miners - 1
            }, {
              where: {
                id: miner.Host.id
              }
            })
            .then(_.noop)
            .catch(console.error);

          miner_model.destroy({
              where: {
                id: miner.id
              }
            })
            .then(_.noop)
            .catch(console.error);
        }
      });
  }
});
