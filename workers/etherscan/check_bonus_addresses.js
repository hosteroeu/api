var sentry = require('./../../services').Sentry();
var request = require('request');
var config = require('./../../config');
var account_model = require('./../../models').account.model;

var ADDRESS = '0x40a981d92D6d9ad1532fAA8e0bdef7d390D9AaC4';
var START_BLOCK = 8000965; //8875965;
var TOKEN_SYMBOL = 'DAI';
var TOKEN_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';
var url = config.etherscan.url + '?module=account&action=tokentx&address=' +
  ADDRESS + '&startblock=' + START_BLOCK + '&endblock=999999999&sort=desc&apikey=' +
  config.etherscan.key;

request.get(url, function(err, message, body) {
  if (err) {
    sentry.Raven.captureException(err);
    return;
  }

  var data = JSON.parse(body);

  if (data.message && data.message === 'OK') {
    var transactions = data.result;
    var balance = 0;

    for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      if (transaction.contractAddress === TOKEN_ADDRESS && transaction.tokenSymbol == TOKEN_SYMBOL) {
        var decimal = parseInt(transaction.tokenDecimal);
        var value = parseInt(transaction.value);
        var real_value = value / Math.pow(10, decimal);

        console.log(transaction.tokenSymbol, real_value);

        if (transaction.to === ADDRESS) {
          balance += real_value;
        }

        if (transaction.from === ADDRESS) {
          balance -= real_value;
        }
      }
    }

    console.log(balance);
  } else {
    console.error(data);
  }
});
