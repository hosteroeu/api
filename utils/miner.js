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
            new_miner.image_uuid = 'docker:morion4000/node:1.200.1';
            new_miner.command = 'sh start_pool_mining.sh';
            break;

          case 'nerva':
            new_miner.image_uuid = 'docker:morion4000/nerva:0.1.5.6';
            break;

          case 'webchain':
            new_miner.image_uuid = 'docker:morion4000/webchain';
            break;

          case 'veruscoin':
            new_miner.image_uuid = 'docker:morion4000/veruscoin';
            break;

          case 'credits':
            new_miner.image_uuid = 'docker:morion4000/credits:3.8.3.3';
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
