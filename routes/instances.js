var routers = require('./../middleware').routers,
  instances = require('./../controllers').instances;

module.exports = function(app, router) {
  router.param('instance_id', routers.param);

  router.post('/instances', routers.bodyCleanup, instances.create);
  router.get('/instances/:instance_id', instances.retrieve);
  router.put('/instances/:instance_id', routers.bodyCleanup, instances.update);
  router.delete('/instances/:instance_id', instances.remove);

  // Collections
  router.get('/instances', routers.filters, instances.collection);
};
