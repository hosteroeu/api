var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;

function find_miner_in_miners(miner, miners) {
  for (var i = 0, l = miners.length; i < l; i++) {
    if (miner.internal_id == miners[i].id) {
      return miners[i];
    }
  }

  return null;
}

miner_model.findAll({})
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    rancher.services.query(function(err, message, body) {
      if (err && err.connect === true) {
        process.exit(0);
      }

      var data = JSON.parse(body);
      var result = data.data;

      console.log('found services', result.length);

      for (var i = 0, l = miners.length; i < l; i++) {
        var miner = miners[i];

        var service_miner = find_miner_in_miners(miner, result);

        // Do not delete miners which are being deployed
        if (!service_miner && miner.deployed != '2') {
          console.log('removed miner', miner.name);

          miner_model.destroy({
              where: {
                id: miner.id
              }
            })
            .then(console.log)
            .catch(console.error);
        }
      }
    });
  });
