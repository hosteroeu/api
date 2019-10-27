var sentry = require('./../../services').Sentry();
var mailgun = require('./../../services').Mailgun();
var config = require('./../../config');
var _ = require('underscore');

var account_model = require('./../../models').account.model;
var log_model = require('./../../models').log.model;

log_model.findAll({
    where: {
      processed: false,
      entity: 'host'
    },
    include: [{
      model: account_model
    }]
  })
  .then(function(logs) {
    console.log('logs', logs.length);

    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];

      console.log('processing', log.event, 'event');

      switch (log.event) {
        case 'delete':
          var account = log.Account;

          if (account.email) {
            mailgun.mail.send({
              to: account.email,
              subject: 'A device has been deleted from Hostero',
              body: 'Device with id ' + log.entity_id + ' has been deleted from your account.'
            }, null, console.log);

            console.log('sent email to ', account.email);
          }
          break;

        default:
          console.log('skipping');
          break;
      }

      log_model.update({
          processed: true
        }, {
          where: {
            id: log.id
          }
        })
        .then(_.noop)
        .catch(sentry.Raven.captureException);
    }

  });
