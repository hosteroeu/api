var routers = require('./../middleware').routers,
  accounts = require('./../controllers').accounts;

module.exports = function(app, router) {
  router.param('account_id', routers.param);

  router.post('/accounts', routers.bodyCleanup, accounts.create);
  router.get('/accounts/:account_id', accounts.retrieve);
  router.put('/accounts/:account_id', routers.bodyCleanup, accounts.update);
  router.delete('/accounts/:account_id', accounts.remove);

  // Collections
  router.get('/accounts', routers.filters, accounts.collection);
};
