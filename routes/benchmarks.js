var routers = require('./../middleware').routers,
  benchmarks = require('./../controllers').benchmarks,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('benchmark_id', routers.param);

  router.get('/benchmarks', routers.filters, benchmarks.collection);
};
