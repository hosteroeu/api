var rancher = require('./../services').Rancher();
var config = require('./../config');

var miner_model = require('./../models').miner.model;
var host_model = require('./../models').host.model;
var account_model = require('./../models').account.model;

function find_miner_in_miners(miner, miners) {
  for (var i = 0, l = miners.length; i < l; i++) {
    if (miner.id == miners[i].internal_id) {
      return miners[i];
    }
  }

  return null;
}

rancher.services.query(function(err, message, body) {
  var data = JSON.parse(body);
  var result = data.data;

  console.log('found services', result.length);

  miner_model.findAll({
      include: [{
        model: host_model
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
            .catch(console.error);
        } else {
          console.log('removed miner', miner.name);
        }
      }
    })
    .catch(console.error);
});
