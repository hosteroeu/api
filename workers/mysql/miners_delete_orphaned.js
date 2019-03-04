var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;

miner_model.findAll({})
  .then(function(data) {
    var miners = data;

    console.log('found miners', miners.length);

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];

      if (miner.host_id === null) {
        console.log('removed miner', miner.id);

        miner_model.destroy({
            where: {
              id: miner.id
            }
          })
          .then(console.log)
          .catch(sentry.Raven.captureException);
      }
    }
  });
