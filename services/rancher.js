var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

require('request-debug')(request);

var Rancher = function() {
  var environments = function() {
    return {
      create: function(req, res, next) {
        request.post({
          url: config.rancher.project + '/environments',
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
          url: config.rancher.project + '/services',
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
          url: config.rancher.host + '/services/' + req.rancher_service_id + '?action=setservicelinks',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      },
      query: function(callback) {
        request.get(config.rancher.stack + '/services', callback).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var hosts = function() {
    return {
      query: function(callback) {
        request.get(config.rancher.project + '/hosts', callback).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  return {
    environments: environments(),
    services: services(),
    hosts: hosts(),
  };
};

module.exports = Rancher;
