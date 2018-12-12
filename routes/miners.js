var routers = require('./../middleware').routers,
  miners = require('./../controllers').miners,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('miner_id', routers.param);

  router.post('/miners', routers.jwtCheck, routers.bodyCleanup, miners.create);
  router.get('/miners/:miner_id(\\d+)', routers.jwtCheck, miners.retrieve);
  router.get('/miners/:miner_id(\\d+)/stats', routers.jwtCheck, miners.stats);
  router.get('/miners/:miner_id(\\d+)/logs', routers.jwtCheck, miners.logs);
  router.put('/miners/:miner_id(\\d+)', routers.jwtCheck, routers.bodyCleanup, miners.update);
  router.delete('/miners/:miner_id(\\d+)', routers.jwtCheck, miners.remove);

  router.get('/miners', routers.jwtCheck, routers.filters, miners.collection);
};
