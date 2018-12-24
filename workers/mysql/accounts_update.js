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
              plan_hosts: 5
            }, {
              where: {
                id: _account.id
              }
            }).then(console.log);
          } else {
            console.log('payment ok, upgrading');

            var new_plan_hosts = 5;

            switch (payment.amount) {
              case '0.99':
                new_plan_hosts = 5;
                break;
              case '9.99':
                new_plan_hosts = 50;
                break;
              case '49.99':
                new_plan_hosts = 100;
                break;
            }

            account_model.update({
              plan_hosts: new_plan_hosts
            }, {
              where: {
                id: _account.id
              }
            }).then(console.log);
          }
        }
      });
    })(account);
  }
});
