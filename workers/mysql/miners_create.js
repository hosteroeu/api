var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

// TODO: Move worker to rancher folder instead of mysql?

miner_model.findAll({
    include: [{
      model: host_model
    }]
  })
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];

      if (!miner.internal_id) {
        // TODO: Make sure is not already deployed
        console.log('deploying miner', miner.id);

        var req = {
          body: {
            id: miner.id,
            name: miner.name,
            coin: miner.coin,
            user_id: miner.user_id,
            server_port: miner.server_port,
            mining_pool_url: miner.mining_pool_url,
            domain: miner.domain,
            wallet: miner.wallet,
            wallet_secret_url: miner.wallet_secret_url,
            threads: miner.threads,
            image_uuid: miner.image_uuid,
            host_id: miner.Host.internal_id,
            host_id2: miner.Host.id,
            host_account_id: miner.Host.account_id,
          }
        };

        (function(_req) {
          account_model.findOne({
              where: {
                id: _req.body.host_account_id
              }
            })
            .then(function(account) {
              if (!account) return;

              console.log('account', account.internal_id);

              _req.body.stack_id = account.internal_id;

              rancher.services.create(_req, {}, function(err) {
                if (err) {
                  console.err(err);
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
                      id: _req.body.host_id2
                    }
                  })
                  .then(function(data) {
                    log_model.create({
                      user_id: account.user_id,
                      account_id: account.id,
                      entity: 'host',
                      entity_id: _req.body.host_id2,
                      event: 'update',
                      message: 'Updated a host',
                      extra_message: JSON.stringify({
                        deployed: '1'
                      })
                    });
                  })
                  .catch(console.error);
              });
            });
        })(req);
      }
    }
  })
  .catch(console.error);
