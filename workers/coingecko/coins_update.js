var request = require('request');
var _ = require('underscore');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;
var log_model = require('./../../models').log.model;
var coingecko_api_url = 'https://api.coingecko.com/api/v3/coins/';
var api_url_postfix = '?market_data=true&community_data=false&developer_data=false';

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

      if (!coin.cmc_url) {
        continue;
      }

      (function(_coin) {
        var url = coingecko_api_url + _coin.internal_name + api_url_postfix;

        request.get(url, function(err, message, body) {
          if (err) {
            console.error(err);
            return;
          }

          var data = JSON.parse(body);

          if (!data.market_data) {
            return;
          }

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
    }
  });
