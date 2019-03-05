var sentry = require('./../../services').Sentry();
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://ytn.overemo.com/');

request.get('https://ytn.overemo.com/', function(err, message, body) {
  if (err) {
    sentry.Raven.captureException(err);
    return;
  }

  var $ = cheerio.load(body);

  var power_raw;
  var power_text;
  var power = 0;

  try {
    power_raw = $('.panel-info-mainpage .panel-body');
    power_text = power_raw[2].children[0].data;
    power = parseFloat(power_text);
  } catch (e) {
    sentry.Raven.captureException(e);
    return;
  }

  if (power_text.indexOf('KH') !== -1) {
    power *= 1000;
  }

  if (power_text.indexOf('MH') !== -1) {
    power *= 1000 * 1000;
  }

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'yenten'
      }
    })
    .then(_.noop)
    .catch(sentry.Raven.captureException);
});
