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

  //is_pos = false;

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

          if (!miner.Host || !miner.Host.Account) {
            continue;
          }

          if (!miner.Host.Account.auto_deploy_idle || !miner.Host.Account.auto_deploy_coin_idle) {
            continue;
          }

          if (miner.status !== 'started') {
            continue;
          }

          if (miner.Host.miners === 1) {
            continue;
          }

          var _host = miner.Host;
          var _account = miner.Host.Account;
          var new_miner = miner_util.template.create(_account.auto_deploy_coin_idle);

          new_miner.user_id = _account.user_id;
          new_miner.name = 'miner-' + _host.id + '-1';
          new_miner.threads = _host.cpu_count || '0';
          new_miner.host_id = _host.id;
          new_miner.processor = _account.default_processor;
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
            .then(_.noop)
            .catch(console.error);

          host_model.update({
              miners: 1
            }, {
              where: {
                id: miner.Host.id
              }
            })
            .then(_.noop)
            .catch(console.error);
        }
      })
      .catch(console.error);
  } else {
    miner_model.findAll({
        include: [{
          model: host_model
        }],
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

          miner_model.destroy({
              where: {
                id: miner.id
              }
            })
            .then(_.noop)
            .catch(console.error);

          host_model.update({
              miners: 0
            }, {
              where: {
                id: miner.Host.id
              }
            })
            .then(_.noop)
            .catch(console.error);
        }
      });
  }
});
