var routers = require('./../middleware').routers,
  coins = require('./../controllers').coins,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('coin_id', routers.param);

  //router.post('/coins', routers.jwtCheck, routers.bodyCleanup, coins.create);
  router.get('/coins/:coin_id(\\d+)', coins.retrieve);
  //router.put('/coins/:coin_id(\\d+)', routers.jwtCheck, routers.bodyCleanup, coins.update);
  //router.delete('/coins/:coin_id(\\d+)', routers.jwtCheck, coins.remove);

  router.get('/coins', routers.filters, coins.collection);
};
