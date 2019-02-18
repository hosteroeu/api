var request = require('request');
var _ = require('underscore');
var cheerio = require('cheerio');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;
var log_model = require('./../../models').log.model;

coin_model.findAll({
    where: {
      on_hostero: true
    },
    logging: false
  })
  .then(function(coins) {
    console.log('found coins', coins.length);

    for (var i = 0; i < coins.length; i++) {
      var coin = coins[i];

      if (!coin.explorer_url) {
        continue;
      }

      (function(_coin) {
        console.log('getting', _coin.explorer_url);

        request.get(_coin.explorer_url, function(err, message, body) {
          if (err) {
            console.error(err);
            return;
          }

          var $ = cheerio.load(body);

          console.log($);

          var x = $('span[data-original-title="POW Mining Hash Rate"]');

          console.log(x);

          return;

          coin_model.update({
              price_eur: data.market_data.current_price.eur
            }, {
              where: {
                id: _coin.id
              }
            })
            .then(_.noop)
            .catch(console.error);
        });
      })(coin);

      break;
    }
  });
