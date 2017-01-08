var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

require('request-debug')(request);

var Cloudflare = function() {
  var url = 'https://api.cloudflare.com/client/v4/',
    _request = request.defaults({
      headers: {
        'X-Auth-Key': config.cloudflare.key,
        'X-Auth-Email': config.cloudflare.email
      }
    });

  var zones = function() {
    return {
      query: function(req, res, next) {
        _request.get({
          url: url + '/zones',
          json: true
        }, function(err, response, body) {
          next(err);
        });
      }
    };
  };

  var dns = function() {
    return {
      create: function(req, res, next) {
        var record = {
          type: 'CNAME',
          name: req.body.name + '.' + req.body.account_name + '.wordpress',
          content: 'rancher-wordpress-slaves-288448428.eu-west-1.elb.amazonaws.com'
        };

        _request.post({
          url: url + '/zones/' + config.cloudflare.zone + '/dns_records',
          json: true,
          body: record
        }, function(err, response, body) {
          next(err);
        });
      }
    };
  };

  return {
    zones: zones(),
    dns: dns()
  };
};

module.exports = Cloudflare;
