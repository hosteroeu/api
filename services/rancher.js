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
        var random = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);

        create_manifest.environmentId = req.body.stack_id;
        // Cannot deploy multiple services with the same name. This causes a bug
        // when services are re-deployed and the new service is being deployed
        // before the old one is deleted.
        create_manifest.name = req.body.name + '-' + random;

        create_manifest.launchConfig.requestedHostId = req.body.host_id;
        create_manifest.launchConfig.labels.id = req.body.id;
        create_manifest.launchConfig.labels.coin = req.body.coin;
        create_manifest.launchConfig.imageUuid = req.body.image_uuid;
        create_manifest.launchConfig.labels.purpose = req.body.coin;

        switch (req.body.coin) {
          case 'webdollar':
            //var referral = '/r/WEBD$gAFytJYWxxEXSgfKGuBMLGNdA8dzk@hrY7$';
            var referral = '';
            var wallet_template = {
              version: '0.1',
              address: req.body.wallet,
              publicKey: '4bdb8b4c0ce9fd23f4c44ea0447320f38d81e8ee493d7c08350cbd330dc1f735',
              privateKey: req.body.password || '02'
            };

            create_manifest.launchConfig.command = [
              'sh',
              'start_pool_mining.sh'
            ];

            create_manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url + referral;
            create_manifest.launchConfig.environment.TERMINAL_WORKERS_CPU_MAX = req.body.threads;
            create_manifest.launchConfig.environment.TERMINAL_WORKERS_TYPE = 'cpu-cpp';
            create_manifest.launchConfig.environment.WALLET = JSON.stringify(wallet_template);

            // TODO: Legacy stuff, remove soon (after updating the webdollar:v2 docker image)
            create_manifest.launchConfig.environment.WALLET_SECRET_URL = '1234';
            create_manifest.launchConfig.environment.SERVER_PORT = 8000;
            create_manifest.launchConfig.environment.DOMAIN = 'wd.hoste.ro';
            break;

          case 'nerva':
            create_manifest.launchConfig.environment.WALLET = req.body.wallet;
            create_manifest.launchConfig.environment.THREADS = req.body.threads;
            break;

          case 'webchain':
          case 'veruscoin':
          case 'credits':
            create_manifest.launchConfig.environment.WALLET = req.body.wallet;
            create_manifest.launchConfig.environment.PASSWORD = req.body.password;
            create_manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url;
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
        request.get(config.rancher.project + '/services?limit=1000&healthState=unhealthy', {
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
