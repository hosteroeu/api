var sentry = require('./../../services').Sentry();
var request = require('request');
var _ = require('underscore');
var config = require('./../../config');
var mailgun = require('./../../services').Mailgun();

var payment_model = require('./../../models').payment.model;
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

var url = 'https://www.webdscan.io/api/transactions?address=' + encodeURIComponent(config.webdollar.payments_address) + '&itemsPerPage=10';

request({
  url: url,
  auth: {
    bearer: config.webdscan.token
  },
  headers: {
    accept: 'application/json'
  }
}, function(error, response, body) {
  if (error) {
    sentry.Raven.captureException(error);
    return;
  }

  var transactions = JSON.parse(body);

  console.log('got transactions', transactions.length);

  for (var i = 0; i < transactions.length; i++) {
    var transaction = transactions[i];

    // Ignore multi-transactions
    if (transaction.toAddresses.length > 1) {
      continue;
    }

    // Allow unconfirmed transactions for now, faster processing
    if (!transaction.isConfirmed) {
      //continue;
    }

    // Only IN transactions
    if (transaction.toAddresses[0].address.address !== config.webdollar.payments_address) {
      continue;
    }

    (function(_transaction) {
      var amount_float = transaction.amount.amount / 10000;
      var amount = amount_float.toString();
      // AMOUNT.PLAN_ID+ACCOUNT_ID
      var encoded = amount.split('.');

      if (encoded.length !== 2) {
        console.log('skipping', _transaction.hash);
        return;
      }

      var account_id = encoded[1].substr(1);

      account_model.findById(account_id)
        .then(function(account) {
          if (!account) {
            /*
            mailgun.mail.send({
              to: config.admin.email,
              subject: '[SYSTEM] Payment account does not match',
              body: JSON.stringify(_transaction)
            }, null, console.log);
            */

            sentry.Raven.captureException('Could not find account ' + account_id);

            return;
          }

          payment_model.findOne({
            where: {
              gateway_internal_id: _transaction.hash
            }
          }).then(function(payment) {
            if (!payment) {
              console.log('creating payment for', account.name, _transaction.hash);

              payment_model.create({
                user_id: account.user_id,
                account_id: account.id,
                gateway: 'webdollar',
                gateway_internal_id: _transaction.hash,
                amount: amount,
                event: 'create',
                message: JSON.stringify(_transaction)
              }, _.noop);
            }
          });
        })
        .catch(sentry.Raven.captureException);
    })(transaction);
  }
});
