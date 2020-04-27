var sequelize = require('./../../models').sequelize;
var account_model = require('./../../models').account.model;
var host_model = require('./../../models').host.model;
var config = require('./../../config');
var rancher_uri = process.env.RANCHER_URI || config.rancher.default;
var rancher = require('./../../services').Rancher(rancher_uri);
var months = process.env.MONTHS ? parseInt(process.env.MONTHS) : 4;

sequelize.query('SELECT * FROM accounts WHERE updated_at < DATE_SUB(NOW(),INTERVAL ' + months + ' MONTH) AND internal_id IS NOT NULL', {
    model: account_model
  })
  .then(function (accounts) {
    console.log(`Accounts: ${accounts.length}`);

    setTimeout(process.exit, (accounts.length + 20) * 1000 / 2);

    for (var i = 0, l = accounts.length; i < l; i++) {
      var account = accounts[i];

      if (account.name === 'shared' || account.user_id === 'shared') {
        continue;
      }

      (function (_account) {
        setTimeout(function () {
          console.log(`Account: ${_account.id}`);

          host_model.count({
              where: {
                account_id: _account.id
              }
            })
            .then(function (count) {
              if (count > 0) {
                console.log(`Skipping ${_account.id}. Has ${count} hosts`);
                return;
              }

              rancher.environments.remove(_account.internal_id, function () {
                console.log(`Deleted stack: ${_account.internal_id}`);

                account_model.update({
                  internal_id: null
                }, {
                  where: {
                    id: _account.id
                  }
                }).then(function () {
                  console.log(`Updated account: ${_account.id}`);
                });
              });
            });
        }, i * 500);
      })(account);
    }
  });
