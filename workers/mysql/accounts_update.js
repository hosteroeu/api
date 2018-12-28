var rancher = require('./../../services').Rancher();
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
    if (account.plan_hosts == '-1') {
      continue;
    }

    (function(_account) {
      payment_model.findAll({
        where: {
          account_id: _account.id
        }
      }).then(function(data) {
        var payments = data;

        if (payments.length > 0) {
          console.log('checking payments for', _account.name);
        }

        for (var j = 0, k = payments.length; j < k; j++) {
          var payment = payments[j];

          if (Date.parse(payment.created_at) <= Date.parse(last_month_date)) {
            console.log('payment overdue, downgrading');

            account_model.update({
              plan_hosts: 1
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
              message: 'Downgraded the subscription',
              extra_message: JSON.stringify({
                miners: 1
              })
            });
          } else {
            console.log('payment ok, upgrading');

            var new_plan_hosts = 1;

            switch (payment.amount) {
              // old plan
              case '0.99':
              case '1.99':
                new_plan_hosts = 5;
                break;
              case '9.99':
                new_plan_hosts = 20;
                break;
              case '49.99':
                new_plan_hosts = 100;
                break;
            }

            if (_account.plan_hosts === new_plan_hosts) {
              continue;
            }

            account_model.update({
              plan_hosts: new_plan_hosts
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
              message: 'Upgraded the subscription',
              extra_message: JSON.stringify({
                miners: new_plan_hosts
              })
            });
          }
        }
      });
    })(account);
  }
});
