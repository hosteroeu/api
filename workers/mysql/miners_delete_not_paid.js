var sentry = require('./../../services').Sentry();
var moment = require('moment');
var rancher = require('./../../services').Rancher();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;
var payment_model = require('./../../models').payment.model;

account_model.findAll().then(function(data) {
  var accounts = data;

  for (var i = 0, l = accounts.length; i < l; i++) {
    var account = accounts[i];

    // -1 is account of type unlimited
    if (account.plan_miners == '-1') {
      continue;
    }

    (function(_account) {
      // Get the last payment only
      payment_model.findAll({
        where: {
          account_id: _account.id
        },
        limit: 1,
        order: [
          ['created_at', 'DESC']
        ],
        logging: false
      }).then(function(payments) {
        // Allow current miners to run for one more week after subscription was
        // canceled due to non-payment
        if (payments.length === 1) {
          var last_payment = payments[0];
          var a_month_ago = moment().subtract(1, 'month');
          var five_weeks_ago = moment().subtract(1, 'month').subtract(1, 'week');
          var created = moment(last_payment.created_at);

          if (created.toDate() >= five_weeks_ago.toDate() &&
            created.toDate() <= a_month_ago.toDate()) {
            console.log(_account.full_name, 'is overdue');
            return;
          }
        }

        miner_model.findAll({
          where: {
            mode: 'miner',
            user_id: _account.user_id,
            temporary: 0
          },
          logging: false
        }).then(function(data) {
          var miners = data;
          var account_miners = _account.plan_miners + _account.bonus_miners;

          if (miners.length > account_miners) {
            var delta = miners.length - account_miners;

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
                .catch(sentry.Raven.captureException);

              log_model.create({
                user_id: _account.user_id,
                account_id: _account.id,
                entity: 'miner',
                entity_id: miner.id,
                event: 'delete',
                message: 'Deleted miner',
                extra_message: JSON.stringify(miner),
                source: 'miners_delete_not_paid'
              });
            }
          }
        });
      });
    })(account);
  }
});
