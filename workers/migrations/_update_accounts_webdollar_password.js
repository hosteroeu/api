var _ = require('underscore');
var config = require('./../../config');
var crypto = require('./../../services').Crypto();

var account_model = require('./../../models').account.model;

account_model.findAll({})
  .then(function(a) {
    console.log(a.length);

    for (var i = 0, l = a.length; i < l; i++) {
      var ac = a[i];

      if (!ac.password_webdollar) {
        continue;
      }

      var encrypted = crypto.encrypt(ac.password_webdollar);

      console.log(encrypted);

      continue;

      account_model.update({
          password_webdollar: encrypted
        }, {
          where: {
            id: ac.id
          }
        })
        .then(console.log)
        .catch(sentry.Raven.captureException);

      //break;
    }
  });
