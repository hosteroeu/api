var _ = require('underscore');
var request = require('request');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting http://bstyexplorer.globalboost.info/ext/summary');

request.get('http://bstyexplorer.globalboost.info/ext/summary', function(err, message, body) {
  if (err) {
    console.error(err);
    return;
  }

  var power_raw = JSON.parse(body);
  var power = parseFloat(power_raw.data[0].hashrate);
  power = power * 1000 * 1000; // MH/s

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'globalboost'
      }
    })
    .then(_.noop)
    .catch(console.error);
});
