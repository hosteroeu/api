var _ = require('underscore');
var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

// TODO: Move worker to rancher folder instead of mysql?

miner_model.findAll({
    include: [{
      model: host_model,
      include: [{
        model: account_model
      }]
    }],
    logging: false
  })
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];
      var account = miner.Host.Account;

      if (!miner.internal_id) {
        // TODO: Make sure is not already deployed
        console.log('deploying miner', miner.id, account.internal_id);

        (function(_miner, _account) {
          var req = {
            body: {
              id: _miner.id,
              name: _miner.name,
              coin: _miner.coin,
              user_id: _miner.user_id,
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
          };

          rancher.services.create(req, {}, function(err, body) {
            if (err) {
              console.error(err);
              return;
            }

            if (body.type === 'error') {
              console.error(body.code);
              return;
            }

            console.log('deployed', req.rancher_service_id);

            miner_model.update({
                status: 'started',
                deployed: '1',
                internal_id: req.rancher_service_id,
                internal_created: req.rancher_service_created
              }, {
                where: {
                  id: _miner.id
                }
              })
              .then(_.noop)
              .catch(console.error);

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
              })
            });

            host_model.update({
                deployed: '1'
              }, {
                where: {
                  id: _miner.Host.id
                }
              })
              .then(_.noop)
              .catch(console.error);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'host',
              entity_id: _miner.Host.id,
              event: 'update',
              message: 'Updated a host',
              extra_message: JSON.stringify({
                deployed: '1'
              })
            });
          });
        })(miner, account);
      }
    }
  })
  .catch(console.error);
