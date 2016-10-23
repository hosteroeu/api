var routers = require('./../middleware').routers,
  accounts = require('./../controllers').accounts,
  rancher = require('./../services').Rancher();

module.exports = function(app, router) {
  router.param('account_id', routers.param);

  router.post('/accounts', routers.bodyCleanup, accounts.create);
  router.get('/accounts/:account_id(\\d+)', accounts.retrieve);
  router.put('/accounts/:account_id(\\d+)', routers.bodyCleanup, accounts.update);
  router.delete('/accounts/:account_id(\\d+)', accounts.remove);

  router.get('/accounts', routers.filters, accounts.collection);
  router.get('/accounts/sync', accounts.sync, rancher.environments.create, accounts.create);
};
