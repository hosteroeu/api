var rancher = require('./../../services').Rancher();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');

var payment_model = require('./../../models').payment.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

var d = new Date();
var m = d.getMonth();
d.setMonth(d.getMonth() - 1);

// If still in same month, set date to last day of previous month
if (d.getMonth() == m) d.setDate(0);
d.setHours(0, 0, 0);
d.setMilliseconds(0);

var last_month_date = d;

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
        order: [['created_at', 'DESC']]
      }).then(function(data) {
        var payments = data;

        if (payments.length > 0) {
          console.log('checking payments for', _account.name);
        }

        for (var j = 0, k = payments.length; j < k; j++) {
          var payment = payments[j];

          if (Date.parse(payment.created_at) <= Date.parse(last_month_date)) {
            if (_account.plan_miners === 1) {
              continue;
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
              })
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

            switch (payment.amount) {
              // old plan
              case '0.99':
              case '1.99':
                new_plan_miners = 5;
                break;
              case '9.99':
                new_plan_miners = 20;
                break;
              case '49.99':
                new_plan_miners = 100;
                break;
            }

            if (_account.plan_miners === new_plan_miners) {
              continue;
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
              })
            });

            if (_account.email) {
              mailgun.mail.send({
                to: _account.email,
                subject: 'Your subscription has been created',
                body: 'Your Hostero subscription has been created following your payment. Thank you for your support!'
              }, null, console.log);
            }
          }
        }
      });
    })(account);
  }
});
