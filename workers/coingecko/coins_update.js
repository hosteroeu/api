var sentry = require('./../../services').Sentry();
var request = require('request');
var _ = require('underscore');
var config = require('./../../config');

var coin_model = require('./../../models').coin.model;
var log_model = require('./../../models').log.model;
var coingecko_api_url = 'https://api.coingecko.com/api/v3/coins/';
var api_url_postfix = '?market_data=true&community_data=false&developer_data=false';

coin_model.findAll({
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
        var id = _coin.internal_name;

        if (id === 'veruscoin') {
          id = 'verus-coin';
        }

        if (id === 'myriad') {
          id = 'myriadcoin';
        }

        if (id === 'loki') {
          id = 'loki-network';
        }

        if (id === 'verium') {
          id = 'veriumreserve';
        }

        if (id === 'xcash') {
          id = 'x-cash';
        }

        if (id === 'tera') {
          id = 'tera-smart-money';
        }

        var url = coingecko_api_url + id + api_url_postfix;

        request.get(url, function(err, message, body) {
          if (err) {
            sentry.Raven.captureException(err);
            return;
          }

          var data = JSON.parse(body);

          if (data.error) {
            console.log(_coin.internal_name, data.error);

            return;
          }

          coin_model.update({
              price_eur: data.market_data.current_price.eur,
              price_usd: data.market_data.current_price.usd,
              liquidity_score: data.liquidity_score
            }, {
              where: {
                id: _coin.id
              }
            })
            .then(_.noop)
            .catch(sentry.Raven.captureException);
        });
      })(coin);
    }
  });
