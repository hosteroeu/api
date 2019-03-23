var request = require('request'),
  _ = require('underscore'),
  errors = require('./../errors'),
  config = require('./../config');

//require('request-debug')(request);
var create_manifest = require('./../config/manifests/service_create.json');

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
        var manifest = {};
        var random = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        var cpuminer_path = './cpuminer-avx2';

        // TODO: reset manifest, or create_manifest?
        _.extend(manifest, create_manifest);

        manifest.environmentId = req.body.stack_id;
        // Cannot deploy multiple services with the same name. This causes a bug
        // when services are re-deployed and the new service is being deployed
        // before the old one is deleted.
        manifest.name = req.body.name + '-' + random;
        manifest.launchConfig.requestedHostId = req.body.rancher_host_id;
        manifest.launchConfig.labels.id = req.body.id;
        manifest.launchConfig.labels.coin = req.body.coin;
        manifest.launchConfig.imageUuid = req.body.image_uuid;
        manifest.launchConfig.labels.purpose = req.body.coin;
        manifest.launchConfig.command = [];
        manifest.launchConfig.environment = {};

        if (req.body.processor === 'sse2') {
          cpuminer_path = './cpuminer-sse2';
        }

        switch (req.body.coin) {
          case 'webdollar':
            //var referral = '/r/WEBD$gAFytJYWxxEXSgfKGuBMLGNdA8dzk@hrY7$';
            var referral = '';
            var wallet_template = {
              version: '0.1',
              address: req.body.wallet,
              publicKey: '01',
              privateKey: '02'
            };

            if (req.body.password) {
              var webdollar_password = req.body.password.split('|') || [];

              if (webdollar_password.length === 2) {
                wallet_template.publicKey = webdollar_password[0];
                wallet_template.privateKey = webdollar_password[1];
              }
            }

            manifest.launchConfig.command = [
              'sh',
              'start_pool_mining.sh'
            ];

            manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url + referral;
            manifest.launchConfig.environment.TERMINAL_WORKERS_CPU_MAX = req.body.threads;
            manifest.launchConfig.environment.WALLET = JSON.stringify(wallet_template);

            if (req.body.type === 'cpp') {
              manifest.launchConfig.environment.TERMINAL_WORKERS_TYPE = 'cpu-cpp';
            } else {
              manifest.launchConfig.environment.TERMINAL_WORKERS_TYPE = 'cpu';
            }

            // TODO: Legacy stuff, remove soon (after updating the webdollar:v2 docker image)
            manifest.launchConfig.environment.WALLET_SECRET_URL = '1234';
            manifest.launchConfig.environment.SERVER_PORT = parseInt(Math.random() * (40000 - 8000) + 8000);
            manifest.launchConfig.environment.DOMAIN = 'wd.hoste.ro';
            break;

          case 'nerva':
            manifest.launchConfig.environment.WALLET = req.body.wallet;
            manifest.launchConfig.environment.THREADS = req.body.threads;
            break;

          case 'webchain':
          case 'veruscoin':
            manifest.launchConfig.environment.WALLET = req.body.wallet;
            manifest.launchConfig.environment.PASSWORD = req.body.password;
            manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url;
            manifest.launchConfig.environment.THREADS = req.body.threads;
            break;

          case 'credits':
            manifest.launchConfig.command = [
              cpuminer_path,
              '-a',
              'argon2d-crds',
              '-o',
              req.body.mining_pool_url,
              '-u',
              req.body.wallet,
              '-p',
              req.body.password,
              '-t',
              req.body.threads,
              '-q'
            ];
            break;

          case 'yenten':
          case 'elicoin':
            manifest.launchConfig.command = [
              cpuminer_path,
              '-a',
              'yescryptr16',
              '-o',
              req.body.mining_pool_url,
              '-u',
              req.body.wallet,
              '-p',
              req.body.password,
              '-t',
              req.body.threads,
              '-q'
            ];
            break;

          case 'myriad':
          case 'globalboost':
            manifest.launchConfig.command = [
              cpuminer_path,
              '-a',
              'yescrypt',
              '-o',
              req.body.mining_pool_url,
              '-u',
              req.body.wallet,
              '-p',
              req.body.password,
              '-t',
              req.body.threads,
              '-q'
            ];
            break;
        }

        request.post({
          url: config.rancher.project + '/services',
          json: true,
          body: manifest
        }, function(err, response, body) {
          next(err, body);
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
