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

        var req = {
          body: {
            id: miner.id,
            name: miner.name,
            coin: miner.coin,
            user_id: miner.user_id,
            mining_pool_url: miner.mining_pool_url,
            password: miner.password,
            domain: miner.domain,
            wallet: miner.wallet,
            threads: miner.threads,
            processor: miner.processor,
            image_uuid: miner.image_uuid,
            rancher_host_id: miner.Host.internal_id,
            host_id: miner.Host.id,
            account_id: miner.Host.account_id,
            stack_id: account.internal_id
          }
        };

        (function(_req) {
          rancher.services.create(_req, {}, function(err, body) {
            if (err) {
              console.error(err);
              return;
            }

            if (body.type === 'error') {
              console.error(body.code);
              return;
            }

            console.log('deployed', _req.rancher_service_id);

            miner_model.update({
                status: 'started',
                deployed: '1',
                internal_id: _req.rancher_service_id,
                internal_created: _req.rancher_service_created
              }, {
                where: {
                  id: _req.body.id
                }
              })
              .then(function(data) {
                log_model.create({
                  user_id: account.user_id,
                  account_id: account.id,
                  entity: 'miner',
                  entity_id: _req.body.id,
                  event: 'update',
                  message: 'Updated a miner',
                  extra_message: JSON.stringify({
                    status: 'started',
                    deployed: '1'
                  })
                });
              })
              .catch(console.error);

            host_model.update({
                deployed: '1'
              }, {
                where: {
                  id: miner.Host.id
                }
              })
              .then(function(data) {
                log_model.create({
                  user_id: account.user_id,
                  account_id: account.id,
                  entity: 'host',
                  entity_id: miner.Host.id,
                  event: 'update',
                  message: 'Updated a host',
                  extra_message: JSON.stringify({
                    deployed: '1'
                  })
                });
              })
              .catch(console.error);
          });
        })(req);
      }
    }
  })
  .catch(console.error);
