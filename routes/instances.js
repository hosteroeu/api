var routers = require('./../middleware').routers,
  instances = require('./../controllers').instances,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('instance_id', routers.param);

  router.post(
    '/instances',
    routers.bodyCleanup,
    rancher.services.create,
    rancher.services.set_service_links,
    rancher.loadbalancers.add_service_link,
    instances.create
  );
  router.get('/instances/:instance_id(\\d+)', instances.retrieve);
  router.put('/instances/:instance_id(\\d+)', routers.bodyCleanup, instances.update);
  router.delete('/instances/:instance_id(\\d+)', instances.remove);

  // Collections
  router.get('/instances', routers.filters, instances.collection);
};
