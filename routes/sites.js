var routers = require('./../middleware').routers,
  sites = require('./../controllers').sites,
  rancher = require('./../services').Rancher(),
  mysql = require('./../services').Mysql(),
  cloudflare = require('./../services').Cloudflare();

module.exports = function(app, router) {
  router.param('site_id', routers.param);

  router.post(
    '/sites',
    routers.bodyCleanup,
    mysql.databases.create,
    rancher.services.create,
    rancher.services.set_service_links,
    rancher.loadbalancers.add_service_link,
    cloudflare.dns.create,
    sites.create
  );
  router.get('/sites/:site_id(\\d+)', sites.retrieve);
  router.put('/sites/:site_id(\\d+)', routers.bodyCleanup, sites.update);
  router.delete('/sites/:site_id(\\d+)', sites.remove);

  // Collections
  router.get('/sites', routers.filters, sites.collection);
};
