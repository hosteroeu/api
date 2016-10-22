var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

var Rancher = function() {
  var url = config.rancher.host;

  var environments = function() {
    return {
      query: function() {
        request.get(url).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var services = function() {
    return {
      create: function(req, res, next) {
        request.post({
          url: url + '/services',
          json: true,
          body: {
            'environmentId': '1e15',
            'name': req.body.name,
            'startOnCreate': true,
            'launchConfig': {
              'imageUuid': 'docker:wordpress',
              'volumeDriver': 'convoy-efs',
              'dataVolumes': [
                'plm:/var/www/html'
              ],
              'environment': {
                'WORDPRESS_DB_HOST': 'hostero.c0dfozdkb1jx.eu-west-1.rds.amazonaws.com',
                'WORDPRESS_DB_USER': 'root',
                'WORDPRESS_DB_PASSWORD': 'pisicuta',
                'WORDPRESS_DB_NAME': 'wordpress'
              }
            }
          }
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
