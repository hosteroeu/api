var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var request = require('request');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://explorer.x-cash.org/getblockchaindata');

request.get('https://explorer.x-cash.org/getblockchaindata', function(err, message, body) {
  if (err) {
    sentry.Raven.captureException(err);
    return;
  }

  var power_raw = JSON.parse(body);
  var power = parseFloat(power_raw.current_blockchain_hashrate);
  power = power * 1000 * 1000; // MH/s

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'xcash'
      }
    })
    .then(_.noop)
    .catch(sentry.Raven.captureException);
});
