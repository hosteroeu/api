var request = require('request');
var _ = require('underscore');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var config = require('./rancher_credentials.json');

var key = config.WEBDOLLAR_OLD.key;
var secret = config.WEBDOLLAR_OLD.secret;
var url = config.WEBDOLLAR_OLD.url;

//require('request-debug')(request);

request.get(url + '/services?limit=1000', function(err, message, body) {
  var data = JSON.parse(body);
  var services = data.data;

  _.each(services, function(service) {
    if (service.launchConfig.imageUuid.indexOf('docker:morion4000/node') !== -1) {
      if (service.name.indexOf('webd') === -1) return;

      console.log(service.name);
      //service.launchConfig.imageUuid = 'docker:morion4000/node:v2';
      service.service.launchConfig.mining_pool_url = 'https://mine.webdollarminingpool.com/pool/1/WMP/0.02/ac2b5a547a8069454f6092cde6f9ecd6a273932b45ccbcce7538ca512e80b6fe/https:$$pool.webdollarminingpool.com:443';

      request.post({
        url: url + '/services/' + service.id + '?action=upgrade',
        json: true,
        body: {
          inServiceStrategy: {
            launchConfig: service.launchConfig,
            secondaryLaunchConfigs: []
          }
        }
      }, console.log).auth(key, secret, false);
    }
  });
}).auth(key, secret, false);
