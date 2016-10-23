var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

var Rancher = function() {
  var url = config.rancher.host;

  var environments = function() {
    return {
      create: function(req, res, next) {
        request.post({
          url: url + '/environments',
          json: true,
          body: {
            'name': req.body.name,
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
    var create_manifest = require('./../config/manifests/service_create.json');

    return {
      create: function(req, res, next) {
        var volume_name = req.body.rancher_environment_id + '_' + req.body.name;

        create_manifest.environmentId = req.body.rancher_environment_id;
        create_manifest.name = req.body.name;
        create_manifest.launchConfig.dataVolumes.push(volume_name + ':/var/www/html');

        request.post({
          url: url + '/services',
          json: true,
          body: create_manifest
        }, function(err, response, body) {
          req.rancher_service_id = body.id;

          next(err);
        }).auth(config.rancher.key, config.rancher.secret, false);
      },
      query: function() {
        request.get(url).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  return {
    environments: environments(),
    services: services()
  };
};

module.exports = Rancher;
