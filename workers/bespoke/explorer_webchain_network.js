var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var request = require('request');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://explorer.webchain.network/web3relay');

request.post('https://explorer.webchain.network/web3relay', function(err, message, body) {
  if (err) {
    sentry.Raven.captureException(err);
    return;
  }

  var power_raw = JSON.parse(body);
  var power = power_raw.hashrate;

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'webchain'
      }
    })
    .then(_.noop)
    .catch(sentry.Raven.captureException);
}).form({
  action: 'hashrate'
});
