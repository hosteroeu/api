var _ = require('underscore');
var config = require('./../../config');

var account_model = require('./../../models').account.model;

account_model.findAll({})
  .then(function(a) {
    console.log(a.length);

    for (var i = 0, l = a.length; i < l; i++) {
      var ac = a[i];
      var wallet = JSON.parse(ac.wallet_webdollar);
      var address = null;

      if (wallet !== null) {
        address = wallet.address;
      }

      if (address === 'undefined' || address === '') {
        address = null;
      }

      console.log(ac.id, address);

      continue;

      account_model.update({
          wallet_webdollar: address
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
