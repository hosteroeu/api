var routers = require('./../middleware').routers,
  miners = require('./../controllers').miners,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('miner_id', routers.param);

  router.post('/miners', routers.bodyCleanup, miners.create);
  router.get('/miners/:miner_id(\\d+)', miners.retrieve);
  router.get('/miners/:miner_id(\\d+)/stats', miners.stats);
  router.get('/miners/:miner_id(\\d+)/logs', miners.logs);
  router.put('/miners/:miner_id(\\d+)', routers.bodyCleanup, miners.update);
  router.delete('/miners/:miner_id(\\d+)', miners.remove);

  router.get('/miners', routers.filters, miners.collection);
};
