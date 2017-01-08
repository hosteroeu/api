var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

require('request-debug')(request);

var Rancher = function() {
  var url = config.rancher.host;

  var environments = function() {
    return {
      create: function(req, res, next) {
        request.post({
          url: url + '/environments',
          json: true,
          body: {
            name: req.body.name,
          }
        }, function(err, response, body) {
          req.rancher_environment_id = body.id;

          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      },
      query: function() {
        request.get(url).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var services = function() {
    return {
      create: function(req, res, next) {
        var create_manifest = require('./../config/manifests/service_create.json'),
          volume_name = req.body.rancher_environment_id + '_' + req.body.name;

        create_manifest.environmentId = req.body.rancher_environment_id;
        create_manifest.name = req.body.name;
        create_manifest.launchConfig.dataVolumes = [
          volume_name + ':/var/www/html'
        ];
        create_manifest.launchConfig.environment.WORDPRESS_DB_USER = req.db_user;
        create_manifest.launchConfig.environment.WORDPRESS_DB_PASSWORD = req.db_password;
        create_manifest.launchConfig.environment.WORDPRESS_DB_NAME = req.db_name;

        request.post({
          url: url + '/services',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          req.rancher_service_id = body.id;

          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      },
      set_service_links: function(req, res, next) {
        var create_manifest = require('./../config/manifests/service_links_create.json');

        request.post({
          url: url + '/services/' + req.rancher_service_id + '?action=setservicelinks',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var loadbalancers = function() {
    return {
      add_service_link: function(req, res, next) {
        var create_manifest = require('./../config/manifests/service_link_create.json'),
          ports_suffix = '.wordpress.hoste.ro:80=80';

        create_manifest.serviceLink.serviceId = req.rancher_service_id;
        // TODO: retrieve account_name from the Account model
        create_manifest.serviceLink.ports = [
          req.body.name + '.' + req.body.account_name + ports_suffix
        ];

        request.post({
          url: url + '/loadbalancerservices/' +
            config.rancher.wordpress_loadbalancer_id + '?action=addservicelink',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  return {
    environments: environments(),
    services: services(),
    loadbalancers: loadbalancers()
  };
};

module.exports = Rancher;
