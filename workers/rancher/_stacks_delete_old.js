var sequelize = require('./../../models').sequelize;
var account_model = require('./../../models').account.model;
var config = require('./../../config');
var rancher_uri = process.env.RANCHER_URI || config.rancher.default;
var rancher = require('./../../services').Rancher(rancher_uri);

sequelize.query('SELECT * FROM accounts WHERE updated_at < DATE_SUB(NOW(),INTERVAL 5 MONTH) AND internal_id IS NOT NULL', {
    model: account_model
  })
  .then(function (accounts) {
    console.log(`Accounts: ${accounts.length}`);

    for (var i = 0, l = accounts.length; i < l; i++) {
      var account = accounts[i];

      if (account.name === 'shared') {
        continue;
      }

      (function(_account) {
        setTimeout(function () {
          console.log(`Account: ${_account.id}`);

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
        }, i * 500);
      })(account);
    }
  });
