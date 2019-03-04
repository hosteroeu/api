var sentry = require('./../../services').Sentry();
var sequelize = require('./../../models').sequelize;
var config = require('./../../config');

var host_model = require('./../../models').host.model;

sequelize.query('SELECT hosts.id, hosts.deployed FROM hosts LEFT JOIN miners ON hosts.id = miners.host_id WHERE miners.host_id IS NULL', {
  model: host_model
}).then(function(hosts) {
  for (var i = 0, l = hosts.length; i < l; i++) {
    var host = hosts[i];

    if (host.deployed != '0') {
      console.log('undeployed', host.id);

      host_model.update({
          deployed: '0'
        }, {
          where: {
            id: host.id
          }
        })
        .then(console.log)
        .catch(sentry.Raven.captureException);
    } else {
      console.log('skipped', host.id);
    }
  }
});
