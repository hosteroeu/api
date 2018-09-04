var rancher = require('./../services').Rancher();
var config = require('./../config');

var miner_model = require('./../models').miner.model;
var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

rancher.services.query(function(err, message, body) {
  var data = JSON.parse(body);
  var services = data.data;

  console.log('found services', services.length);

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
              user_id: miner.user_id,
              server_port: miner.server_port,
              mining_pool_url: miner.mining_pool_url,
              domain: miner.domain,
              wallet: miner.wallet,
              wallet_secret_url: miner.wallet_secret_url,
              terminal_workers_type: miner.terminal_workers_type,
              terminal_workers_cpu_max: miner.terminal_workers_cpu_max,
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
                      internal_id: _req.rancher_service_id
                    }, {
                      where: {
                        id: _req.body.id
                      }
                    })
                    .then(console.log)
                    .catch(console.error);

                  host_model.update({
                      deployed: '1'
                    }, {
                      where: {
                        id: _req.body.host_id2
                      }
                    })
                    .then(console.log)
                    .catch(console.error);
                });
              });
          })(req);
        }
      }
    })
    .catch(console.error);
});
