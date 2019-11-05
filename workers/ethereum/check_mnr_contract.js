// https://etherscan.io/address/0x85ed0aA9e6f025401dE93078C17Dd83F4691e38E#readContract

var ethers = require('ethers');
var async = require('async');

var config = require('./../../config');
var account_model = require('./../../models').account.model;

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
        .then(function(data) {
          callback(null, {
            index: _i,
            data: data
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
    account_model.findAll({
      logging: true
    }).then(function(accounts) {
      for (var i = 0, l = accounts.length; i < l; i++) {
        var account = accounts[i];

        if (account.bonus_eth_address) {
          console.log(account.bonus_eth_address);
        }
      }
    });
  }
});
