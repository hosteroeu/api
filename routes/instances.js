var routers = require('./../middleware').routers,
  instances = require('./../controllers').instances;

module.exports = function(app, router) {
  router.param('instance_id', routers.param);

  router.post('/instances', routers.bodyCleanup, instances.collection);
  router.get('/instances/:instance_id', instances.collection);
  router.put('/instances/:instance_id', routers.bodyCleanup, instances.collection);
  router.delete('/instances/:instance_id', instances.collection);

  // CollectionsS
  router.get('/instances', routers.filters, instances.collection);
};
