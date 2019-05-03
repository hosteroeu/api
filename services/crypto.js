var errors = require('./../errors'),
  config = require('./../config'),
  crypto = require('crypto');

var Crypto = function() {
  var encrypt = function(text) {
    var cypher = crypto.createCipher(config.crypto.algo, config.crypto.key);

    return cypher.update(text, 'utf8', 'hex') + cypher.final('hex');
  };

  var decrypt = function(text) {
    var decypher = crypto.createDecipher(config.crypto.algo, config.crypto.key);

    return decypher.update(text, 'hex', 'utf8') + decypher.final('utf8');
  };

  return {
    encrypt: encrypt,
    decrypt: decrypt
  };
};

module.exports = Crypto;
