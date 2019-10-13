var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var request = require('request');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://us-central1-nerva-248022.cloudfunctions.net/nervaApi?endpoint=get_info');

request.get('https://us-central1-nerva-248022.cloudfunctions.net/nervaApi?endpoint=get_info', function(err, message, body) {
  if (err) {
    sentry.Raven.captureException(err);
    return;
  }

  var power_raw = JSON.parse(body);
  var power = power_raw.difficulty / 100 * 2; // TODO: Make sure formula is right

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'nerva'
      }
    })
    .then(_.noop)
    .catch(sentry.Raven.captureException);
});
