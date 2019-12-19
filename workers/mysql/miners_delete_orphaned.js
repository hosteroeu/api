var sentry = require('./../../services').Sentry();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var host_model = require('./../../models').host.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

miner_model.findAll({
  include: [{
    model: host_model,
    include: [{
      model: account_model
    }]
  }]
})
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

        log_model.create({
          user_id: miner.Host.Account.user_id,
          account_id: miner.Host.Account.id,
          entity: 'miner',
          entity_id: miner.id,
          event: 'delete',
          message: 'Deleted miner',
          extra_message: JSON.stringify(miner),
          source: 'miners_delete_orphaned'
        });
      }
    }
  });
