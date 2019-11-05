// https://etherscan.io/address/0x85ed0aA9e6f025401dE93078C17Dd83F4691e38E#readContract

var ethers = require('ethers');
var async = require('async');
var _ = require('underscore');

var config = require('./../../config');
var account_model = require('./../../models').account.model;
var log_model = require('./../../models').account.model;
var mailgun = require('./../../services').Mailgun();

var BLOCK_START = process.env.BLOCK_START || 8875965;
var SUPPLY = process.env.SUPPLOY || 11;

var mnr_contract_address = '0x85ed0aa9e6f025401de93078c17dd83f4691e38e';
var mnr_contract_artifact = require('./artifacts/ERC721FullBatchMint.json');

var provider = ethers.getDefaultProvider('mainnet');
var mnr_contract = new ethers.Contract(mnr_contract_address, mnr_contract_artifact, provider);
var calls = [];

provider.resetEventsBlock(BLOCK_START);

for (var i = 0; i < SUPPLY; i++) {
  var func = (function(_i) {
    return function(callback) {
      // TODO: possibly use tokenByIndex before calling ownerOf

      mnr_contract.ownerOf(_i)
        .then(function(address) {
          callback(null, {
            id: _i,
            address: address
          });
        })
        .catch(callback);
    };
  })(i);

  calls.push(func);
}

async.parallel(calls, function(err, results) {
  if (err) {
    console.error(err);
    return;
  }

  if (results.length > 0) {
    var grouped = _.groupBy(results, 'address');

    account_model.findAll({
      logging: true
    }).then(function(accounts) {
      for (var i = 0, l = accounts.length; i < l; i++) {
        var account = accounts[i];

        // TODO: bonus_eth_address should be unique
        if (account.bonus_eth_address) {
          console.log('address', account.bonus_eth_address, 'account', account.id);

          var tokens = 0;
          var bonus_miners_mnr = account.bonus_miners_mnr;
          var bonus_miners = account.bonus_miners;

          if (grouped.hasOwnProperty(account.bonus_eth_address)) {
            tokens = grouped[account.bonus_eth_address].length;
          }

          console.log('tokens', tokens);
          console.log('bonus miners mnr', bonus_miners_mnr);

          var delta = Math.abs(tokens - bonus_miners_mnr);

          if (tokens > bonus_miners_mnr) {
            bonus_miners += delta;
            bonus_miners_mnr = tokens;
          } else if (tokens < bonus_miners_mnr) {
            bonus_miners -= delta;
            bonus_miners_mnr = tokens;
          } else {
            console.log('nothing to do');
            continue;
          }

          console.log('new bonus', bonus_miners, '| old bonus', account.bonus_miners);

          account_model.update({
            bonus_miners: bonus_miners,
            bonus_miners_mnr: bonus_miners_mnr
          }, {
            where: {
              id: account.id
            }
          }).then(console.log);

          log_model.create({
            user_id: account.user_id,
            account_id: account.id,
            entity: 'account',
            entity_id: account.id,
            event: 'update',
            message: 'Update bonus miners',
            extra_message: JSON.stringify({
              bonus_miners: bonus_miners,
              bonus_miners_mnr: bonus_miners_mnr
            }),
            source: 'accounts_update'
          });

          /*
          if (account.email) {
            mailgun.mail.send({
              to: account.email,
              subject: 'Your subscription has been canceled',
              body: 'Your Hostero subscription was automatically canceled due to non-payment. You are on the free plan now.'
            }, null, console.log);
          }
          */
        }

      }
    });
  }
});
