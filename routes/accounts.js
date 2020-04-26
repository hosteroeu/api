var routers = require('./../middleware').routers,
  accounts = require('./../controllers').accounts;

module.exports = function(app, router) {
  router.param('account_id', routers.param);

  router.post('/accounts', routers.jwtCheck, routers.bodyCleanup, accounts.create);
  router.get('/accounts/:account_id(\\d+)', routers.jwtCheck, accounts.retrieve);
  router.put('/accounts/:account_id(\\d+)', routers.jwtCheck, routers.bodyCleanup, accounts.update);
  router.delete('/accounts/:account_id(\\d+)', routers.jwtCheck, accounts.remove);

  router.get('/accounts', routers.jwtCheck, routers.filters, accounts.collection);
  router.get('/accounts/sync', routers.jwtCheck, accounts.sync, accounts.create);
};
