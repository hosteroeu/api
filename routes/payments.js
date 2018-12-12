var routers = require('./../middleware').routers,
  payments = require('./../controllers').payments,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('payment_id', routers.param);

  router.post('/payments', routers.jwtCheck, routers.bodyCleanup, payments.create);
  router.get('/payments/:payment_id(\\d+)', routers.jwtCheck, payments.retrieve);
  router.put('/payments/:payment_id(\\d+)', routers.jwtCheck, routers.bodyCleanup, payments.update);
  router.delete('/payments/:payment_id(\\d+)', routers.jwtCheck, payments.remove);

  router.get('/payments', routers.jwtCheck, routers.filters, payments.collection);
  router.all('/payments/ipn', payments.ipn);
};
