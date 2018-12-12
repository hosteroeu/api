var routers = require('./../middleware').routers,
  logs = require('./../controllers').logs,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('log_id', routers.param);

  router.post('/logs', routers.jwtCheck, routers.bodyCleanup, logs.create);

  router.get('/logs', routers.jwtCheck, routers.filters, logs.collection);
};
