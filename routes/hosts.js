var routers = require('./../middleware').routers,
  hosts = require('./../controllers').hosts,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('host_id', routers.param);

  router.post('/hosts', routers.bodyCleanup, hosts.create);
  router.get('/hosts/:host_id(\\d+)', hosts.retrieve);
  router.put('/hosts/:host_id(\\d+)', routers.bodyCleanup, hosts.update);
  router.delete('/hosts/:host_id(\\d+)', hosts.remove);

  router.get('/hosts', routers.filters, hosts.collection);
};
