var config = require('./../../config');

var rancher_uri = process.env.RANCHER_URI || config.rancher.default;

var sentry = require('./../../services').Sentry();
var rancher = require('./../../services').Rancher(rancher_uri);
var config = require('./../../config');

rancher.services.query_unhealthy(function(err, message, body) {
  if (err && err.connect === true) {
    process.exit(0);
  }

  var data = JSON.parse(body);
  var services = data.data;

  console.log(services.length, 'services unhealthy');

  for (var i = 0, l = services.length; i < l; i++) {
    var service = services[i];

    // Delete just services which are not stopped manually
    if (service.state !== 'active' && service.name !== 'healthcheck') {
      console.log('deleting', service.name);
      rancher.services.remove(service.id);
    }
  }
});
