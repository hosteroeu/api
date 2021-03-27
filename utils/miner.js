var errors = require('./../errors'),
  config = require('./../config');

var Miner = function() {
  var template = function() {
    return {
      create: function(coin) {
        var new_miner = {
          coin: coin,
          status: 'stopped',
          deployed: '2'
        };

        switch (coin) {
          case 'webdollar':
            new_miner.image_uuid = 'docker:morion4000/webdollar-node:1.3.02';
            break;

          case 'nerva':
            new_miner.image_uuid = 'docker:morion4000/nerva:0.1.7.3';
            break;

          case 'webchain':
            new_miner.image_uuid = 'docker:morion4000/webchain:2.6.2.0';
            break;

          case 'veruscoin':
            new_miner.image_uuid = 'docker:morion4000/veruscoin';
            break;

          case 'xcash':
            new_miner.image_uuid = 'docker:morion4000/xcash:1.0.0';
            break;

          case 'monero':
            new_miner.image_uuid = 'docker:morion4000/xmrig:5.1.0';
            break;

          case 'scala':
            new_miner.image_uuid = 'docker:morion4000/scala:5.2.2';
            break;

          case 'credits':
          case 'myriad':
          case 'yenten':
          case 'globalboost':
          case 'elicoin':
            new_miner.image_uuid = 'docker:morion4000/cpuminer-argon2:3.8.3.3';
            break;
        }

        return new_miner;
      }
    };
  };

  return {
    template: template(),
  };
};

module.exports = Miner;
