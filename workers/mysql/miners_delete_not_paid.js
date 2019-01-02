var rancher = require('./../../services').Rancher();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

account_model.findAll().then(function(data) {
  var accounts = data;

  for (var i = 0, l = accounts.length; i < l; i++) {
    var account = accounts[i];

    // -1 is account of type unlimited
    if (account.plan_miners == '-1') {
      continue;
    }

    (function(_account) {
      miner_model.findAll({
        where: {
          user_id: _account.user_id
        }
      }).then(function(data) {
        var miners = data;

        if (miners.length > _account.plan_miners) {
          var delta = miners.length - _account.plan_miners;

          console.log('ACCOUNT', _account.id, 'MINERS', delta);

          if (_account.email) {
            mailgun.mail.send({
              to: _account.email,
              subject: 'Some miners have been deleted',
              body: 'Due to unpayment, some of your miners have been deleted.'
            }, null, console.log);
          }

          for (var j = 0; j < delta; j++) {
            var miner = miners[j];

            console.log('DELETE', miner.id);

            miner_model.destroy({
                where: {
                  id: miner.id
                }
              })
              .then(console.log)
              .catch(console.error);

            log_model.create({
              user_id: _account.user_id,
              account_id: _account.id,
              entity: 'miner',
              entity_id: miner.id,
              event: 'delete',
              message: 'Deleted miner',
              extra_message: JSON.stringify(miner)
            });
          }
        }
      });

    })(account);
  }
});
