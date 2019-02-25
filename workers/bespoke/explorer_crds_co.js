var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://explorer.crds.co');

request.get('https://explorer.crds.co', function(err, message, body) {
  if (err) {
    console.error(err);
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
    console.error(e);
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
        internal_name: 'credits'
      }
    })
    .then(_.noop)
    .catch(console.error);
});
