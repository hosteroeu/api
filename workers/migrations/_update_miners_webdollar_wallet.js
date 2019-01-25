var _ = require('underscore');
var config = require('./../../config');

var miner_model = require('./../../models').miner.model;

miner_model.findAll({
  where: {
    coin: 'webdollar'
  }
})
  .then(function(a) {
    console.log(a.length);

    for (var i = 0, l = a.length; i < l; i++) {
      var ac = a[i];
      var wallet = JSON.parse(ac.wallet);
      var address = null;

      if (wallet !== null) {
        address = wallet.address;
      }

      if (address === 'undefined' || address === '') {
        address = null;
      }

      console.log(ac.id, address);

      continue;

      miner_model.update({
          wallet: address
        }, {
          where: {
            id: ac.id
          }
        })
        .then(console.log)
        .catch(console.error);

      //break;
    }
  });
