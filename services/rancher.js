var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

var Rancher = function() {
  var url = config.rancher.host;

  var environments = function() {
    url += '/environments';

    return {
      query: function() {
        request.get(url).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  var services = function() {
    url += '/services';

    return {
      query: function() {
        request.get(url).auth(config.rancher.key, config.rancher.secret, false);
      }
    };
  };

  return {
    environments: environments,
    services: services
  };
};

module.exports = Rancher;
