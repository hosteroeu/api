var request = require('request'),
  _ = require('underscore'),
  crypto = require('./crypto')(),
  errors = require('./../errors'),
  config = require('./../config');

//require('request-debug')(request);
var create_manifest = require('./../config/manifests/service_create.json');

var Rancher = function(_rancher_uri) {
  var rancher_uri = _rancher_uri || config.rancher.default,
    rancher_config = config.rancher[rancher_uri];

  var environments = function() {
    return {
      create: function(req, res, next) {
        request.post({
          url: rancher_config.project + '/environments',
          json: true,
          body: {
            name: req.body.name,
            description: req.body.description || ''
          }
        }, function(err, response, body) {
          req.rancher_environment_id = body.id;

          next(err);
        }).auth(rancher_config.key, rancher_config.secret, false);
      },
      query: function(callback) {
        request.get(url + '?limit=1000', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
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
        manifest.name = req.body.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '-' + random;
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
            var referral = '/r/WEBD$gAFytJYWxxEXSgfKGuBMLGNdA8dzk@hrY7$';
            var wallet_template = {
              version: '0.1',
              address: req.body.wallet,
              publicKey: '01',
              privateKey: '02'
            };

            if (req.body.password) {
              var webdollar_password = [];

              try {
                var decrypted = crypto.decrypt(req.body.password);
                webdollar_password = decrypted.split('|');
              } catch (e) {
                console.error(e);
              }

              if (webdollar_password.length === 2) {
                wallet_template.publicKey = webdollar_password[0] || '01';
                wallet_template.privateKey = webdollar_password[1] || '02';
              }
            }

            manifest.launchConfig.command = [
              'sh',
            ];

            if (req.body.mode === 'node') {
              manifest.launchConfig.command.push('start_mining.sh');
            } else if (req.body.mode === 'staking') {
              manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url + referral;
              manifest.launchConfig.command.push('start_pool_mining.sh');
            } else {
              manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url;
              manifest.launchConfig.command.push('start_pool_mining.sh');
            }

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

          case 'monero':
            manifest.launchConfig.environment.ALGO = 'rx/0';
            manifest.launchConfig.environment.WALLET = req.body.wallet;
            manifest.launchConfig.environment.PASSWORD = req.body.password;
            manifest.launchConfig.environment.MINING_POOL_URL = req.body.mining_pool_url;
            manifest.launchConfig.environment.THREADS = req.body.threads;
            break;

          case 'webchain':
          case 'veruscoin':
          case 'xcash':
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
          url: rancher_config.project + '/services',
          json: true,
          body: manifest
        }, function(err, response, body) {
          next(err, body);
        }).auth(rancher_config.key, rancher_config.secret, false);
      },
      get: function(id, callback) {
        request.get(rancher_config.project + '/services/' + id, {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      query: function(callback) {
        request.get(rancher_config.project + '/services?limit=1000', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      query_unhealthy: function(callback) {
        request.get(rancher_config.project + '/services?limit=1000&healthState=unhealthy', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      remove: function(id, callback) {
        request.post(rancher_config.project + '/services/' + id + '/?action=remove', callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      stats: function(id, callback) {
        request.get(rancher_config.project + '/services/' + id + '/containerstats', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      logs: function(id, callback) {
        request.post({
          url: rancher_config.project + '/containers/' + id + '/?action=logs',
          json: true,
          body: {
            follow: true,
            lines: 500
          }
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
    };
  };

  var hosts = function() {
    return {
      query: function(callback) {
        request.get(rancher_config.project + '/hosts?limit=1000', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      remove: function(id, callback) {
        request.delete(rancher_config.host + '/hosts/' + id, callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      deactivate: function(id, callback) {
        request.post(rancher_config.host + '/hosts/' + id + '/?action=deactivate', callback).auth(rancher_config.key, rancher_config.secret, false);
      },
      stats: function(id, callback) {
        request.get(rancher_config.project + '/hosts/' + id + '/hoststats', {
          timeout: 5000
        }, callback).auth(rancher_config.key, rancher_config.secret, false);
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
