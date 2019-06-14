var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

var payment_model = require('./../../models').payment.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

// TODO: Replace with moment
var d = new Date();
var m = d.getMonth();
d.setMonth(d.getMonth() - 1);

// If still in same month, set date to last day of previous month
if (d.getMonth() == m) d.setDate(0);
d.setHours(0, 0, 0);
d.setMilliseconds(0);

var last_month_date = d;

account_model.findAll({
  logging: false
}).then(function(accounts) {
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
        if (payments.length === 0) {
          return;
        }

        console.log('checking payments for', _account.name);

        var payment = payments[0];

        if (Date.parse(payment.created_at) <= Date.parse(last_month_date)) {
          if (_account.plan_miners === 1) {
            return;
          }

          console.log('payment overdue, downgrading');

          account_model.update({
            plan_miners: 1
          }, {
            where: {
              id: _account.id
            }
          }).then(console.log);

          log_model.create({
            user_id: _account.user_id,
            account_id: _account.id,
            entity: 'account',
            entity_id: _account.id,
            event: 'update',
            message: 'Canceled your subscription',
            extra_message: JSON.stringify({
              miners: 1
            }),
            source: 'accounts_update'
          });

          if (_account.email) {
            mailgun.mail.send({
              to: _account.email,
              subject: 'Your subscription has been canceled',
              body: 'Your Hostero subscription was automatically canceled due to non-payment. You are on the free plan now.'
            }, null, console.log);
          }
        } else {
          var new_plan_miners = 1;

          if (payment.gateway === 'webdollar') {
            // AMOUNT.PLAN_ID+ACCOUNT_ID
            var encoding = payment.amount.split('.');

            if (encoding.length > 0) {
              var plan = encoding[1][0];

              switch (plan) {
                case '1':
                  new_plan_miners = 5;
                  break;
                case '2':
                  new_plan_miners = 50;
                  break;
                case '3':
                  new_plan_miners = 500;
                  break;
              }
            }
          } else {
            switch (payment.amount) {
              // old plan
              case '0.99':
              case '1.99':
                new_plan_miners = 5;
                break;
              case '9.99':
                new_plan_miners = 50;
                break;
              case '49.99':
                new_plan_miners = 500;
                break;
            }
          }

          if (_account.plan_miners === new_plan_miners) {
            return;
          }

          console.log('payment ok, upgrading');

          account_model.update({
            plan_miners: new_plan_miners
          }, {
            where: {
              id: _account.id
            }
          }).then(console.log);

          log_model.create({
            user_id: _account.user_id,
            account_id: _account.id,
            entity: 'account',
            entity_id: _account.id,
            event: 'update',
            message: 'Created a subscription',
            extra_message: JSON.stringify({
              miners: new_plan_miners
            }),
            source: 'accounts_update'
          });

          mailgun.mail.send({
            to: config.admin.email,
            subject: 'New subscription has been created',
            body: 'Account: ' + _account.id + ', Plan: ' + new_plan_miners
          }, null, console.log);

          if (_account.email) {
            mailgun.mail.send({
              to: _account.email,
              subject: 'Your subscription has been created',
              body: 'Your Hostero subscription has been created following your payment. Thank you for your support!'
            }, null, console.log);
          }
        }
      });
    })(account);
  }
});
