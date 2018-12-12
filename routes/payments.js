var routers = require('./../middleware').routers,
  payments = require('./../controllers').payments,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('payment_id', routers.param);

  router.post('/payments', routers.bodyCleanup, payments.create);
  router.get('/payments/:payment_id(\\d+)', payments.retrieve);
  router.put('/payments/:payment_id(\\d+)', routers.bodyCleanup, payments.update);
  router.delete('/payments/:payment_id(\\d+)', payments.remove);

  router.get('/payments', routers.filters, payments.collection);
  router.get('/payments/ipn', payments.ipn);
};
