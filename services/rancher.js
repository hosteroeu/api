var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

//require('request-debug')(request);

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
      query: function(callback) {
        request.get(url + '?limit=1000', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var services = function() {
    return {
      create: function(req, res, next) {
        var create_manifest = require('./../config/manifests/service_create.json');

        create_manifest.environmentId = req.body.stack_id;
        create_manifest.name = req.body.name;

        create_manifest.launchConfig.requestedHostId = req.body.host_id;
        create_manifest.launchConfig.labels.id = req.body.id;
        create_manifest.launchConfig.labels.coin = req.body.coin;
        create_manifest.launchConfig.imageUuid = req.body.image_uuid;
        create_manifest.launchConfig.environment.WALLET = req.body.wallet;
        create_manifest.launchConfig.labels.purpose = req.body.coin;

        switch (req.body.coin) {
          case 'webdollar':
            var referral = '/r/WEBD$gAFytJYWxxEXSgfKGuBMLGNdA8dzk@hrY7$';

            create_manifest.launchConfig.command = [
              'sh',
              'start_pool_mining.sh'
            ];
            create_manifest.launchConfig.environment.SERVER_PORT = req.body.server_port;
            create_manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url + referral;
            create_manifest.launchConfig.environment.DOMAIN = req.body.domain;
            create_manifest.launchConfig.environment.WALLET_SECRET_URL = req.body.wallet_secret_url;
            create_manifest.launchConfig.environment.TERMINAL_WORKERS_CPU_MAX = req.body.threads;
            create_manifest.launchConfig.environment.TERMINAL_WORKERS_TYPE = 'cpu-cpp';
            break;
          case 'nerva':
            create_manifest.launchConfig.environment.THREADS = req.body.threads;
            break;
        }

        request.post({
          url: config.rancher.project + '/services',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          req.rancher_service_id = body.id;
          req.rancher_service_created = body.createdTS;

          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      },
      get: function(id, callback) {
        request.get(config.rancher.project + '/services/' + id, {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      query: function(callback) {
        request.get(config.rancher.project + '/services?limit=1000', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      query_unhealthy: function(callback) {
        request.get(config.rancher.project + '/services?limit=1000&name_prefix=webd&healthState=unhealthy', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      remove: function(id, callback) {
        request.post(config.rancher.project + '/services/' + id + '/?action=remove', callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      stats: function(id, callback) {
        request.get(config.rancher.project + '/services/' + id + '/containerstats', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      logs: function(id, callback) {
        request.post({
          url: config.rancher.project + '/containers/' + id + '/?action=logs',
          json: true,
          body: {
            follow: true,
            lines: 500
          }
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
    };
  };

  var hosts = function() {
    return {
      query: function(callback) {
        request.get(config.rancher.project + '/hosts?limit=1000', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      remove: function(id, callback) {
        request.delete(config.rancher.host + '/hosts/' + id, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      deactivate: function(id, callback) {
        request.post(config.rancher.host + '/hosts/' + id + '/?action=deactivate', callback).auth(config.rancher.key, config.rancher.secret, false);
      },
      stats: function(id, callback) {
        request.get(config.rancher.project + '/hosts/' + id + '/hoststats', {
          timeout: 5000
        }, callback).auth(config.rancher.key, config.rancher.secret, false);
      },
    };
  };

  return {
    environments: environments(),
    services: services(),
    hosts: hosts(),
  };
};

module.exports = Rancher;
