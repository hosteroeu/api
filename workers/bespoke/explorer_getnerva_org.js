var _ = require('underscore');
var request = require('request');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;

console.log('getting https://explorer.getnerva.org/api/getinfo.php');

request.get('https://explorer.getnerva.org/api/getinfo.php', function(err, message, body) {
  if (err) {
    console.error(err);
    return;
  }

  var power_raw = JSON.parse(body);
  var power = power_raw.result.difficulty / 100 * 2; // TODO: Make sure formula is right

  console.log('found power', power);

  coin_model.update({
      network_hashrate: power
    }, {
      where: {
        internal_name: 'nerva'
      }
    })
    .then(_.noop)
    .catch(console.error);
});
