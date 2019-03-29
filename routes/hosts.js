var routers = require('./../middleware').routers,
  hosts = require('./../controllers').hosts,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('host_id', routers.param);

  router.post('/hosts', routers.jwtCheck, routers.bodyCleanup, hosts.create);
  router.get('/hosts/:host_id(\\d+)', routers.jwtCheck, hosts.retrieve);
  router.get('/hosts/:host_id(\\d+)/stats', routers.jwtCheck, hosts.stats);
  router.get('/hosts/:host_id(\\d+)/events', routers.jwtCheck, hosts.events);
  router.put('/hosts/:host_id(\\d+)', routers.jwtCheck, routers.bodyCleanup, hosts.update);
  router.delete('/hosts/:host_id(\\d+)', routers.jwtCheck, hosts.remove);

  router.get('/hosts', routers.jwtCheck, routers.filters, hosts.collection);
};
