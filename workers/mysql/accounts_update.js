var sentry = require('./../../services').Sentry();
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

// TODO: This is lazy, make sure to revisit in the future
function get_plan_based_on_amount(amount) {
  var plan = '1';

  if (amount < 100000) {
    plan = '1';
  } else if (amount < 500000) {
    plan = '2';
  } else {
    plan = '3';
  }

  return plan;
}

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
            plan_miners: 1,
            plan_miners_staking: 0
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
          var new_plan_miners_staking = 0;

          if (payment.gateway === 'webdollar') {
            var plan = get_plan_based_on_amount(payment.amount);

            switch (plan) {
              case '1':
                new_plan_miners = 5;
                new_plan_miners_staking = 1;
                break;
              case '2':
                new_plan_miners = 50;
                new_plan_miners_staking = 5;
                break;
              case '3':
                new_plan_miners = 500;
                new_plan_miners_staking = 25;
                break;
            }
          } else {
            switch (payment.amount) {
              // old plan
              case '0.99':
              case '1.99':
                new_plan_miners = 5;
                new_plan_miners_staking = 1;
                break;
              case '9.99':
                new_plan_miners = 50;
                new_plan_miners_staking = 5;
                break;
              case '49.99':
                new_plan_miners = 500;
                new_plan_miners_staking = 25;
                break;
            }
          }

          if (_account.plan_miners === new_plan_miners &&
              _account.plan_miners_staking === new_plan_miners_staking) {
            return;
          }

          console.log('payment ok, upgrading');

          account_model.update({
            plan_miners: new_plan_miners,
            plan_miners_staking: new_plan_miners_staking
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
              miners: new_plan_miners,
              miners_staking: new_plan_miners_staking
            }),
            source: 'accounts_update'
          });

          mailgun.mail.send({
            to: config.admin.email,
            subject: 'New subscription has been created',
            body: 'Account: ' + _account.id
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
