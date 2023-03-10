var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher(rancher_uri);
var moment = require('moment');

var miner_model = require('./../../models').miner.model;

function find_miner_in_miners(miner, miners) {
  for (var i = 0, l = miners.length; i < l; i++) {
    if (miner.id == miners[i].internal_id) {
      return miners[i];
    }
  }

  return null;
}

rancher.services.query(function(err, message, body) {
  if (err && err.connect === true) {
    process.exit(0);
  }

  var data = JSON.parse(body);
  var services = data.data;

  console.log(services.length, 'services');

  miner_model.findAll({})
    .then(function(data) {
      var miners = data;

      console.log('found miners', miners.length);

      for (var i = 0, l = services.length; i < l; i++) {
        var service = services[i];

        // Allow time for the service to be created
        if (moment(service.created).toDate() > moment().subtract(2, 'minutes').toDate()) {
          continue;
        }

        if (service.name === 'healthcheck') {
          continue;
        }

        var miner = find_miner_in_miners(service, miners);

        if (!miner) {
          console.log('removed miner', service.id);

          rancher.services.remove(service.id);
        }
      }
    });
});
