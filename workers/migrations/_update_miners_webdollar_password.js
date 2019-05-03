var _ = require('underscore');
var config = require('./../../config');
var crypto = require('./../../services').Crypto();

var miner_model = require('./../../models').miner.model;

miner_model.findAll({
  where: {
    coin: 'webdollar'
  }
})
  .then(function(m) {
    console.log(m.length);

    for (var i = 0, l = m.length; i < l; i++) {
      var mi = m[i];

      if (!mi.password) {
        continue;
      }

      var encrypted = crypto.encrypt(mi.password);

      console.log(encrypted);

      continue;

      miner_model.update({
          password: encrypted
        }, {
          where: {
            id: mi.id
          }
        })
        .then(console.log)
        .catch(console.error);

      //break;
    }
  });
