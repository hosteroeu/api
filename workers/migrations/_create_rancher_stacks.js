var _ = require('underscore');
var config = require('./../../config');

var account_model = require('./../../models').account.model;
var rancher = require('./../../services').Rancher();

account_model.findAll({})
  .then(function(a) {
    console.log(a.length);

    for (var i = 10, l = 500; i < l; i++) {
      var ac = a[i];

      console.log(ac.name);

      (function(_ac) {
        setTimeout(function() {
          var req = {
            body: {
              name: _ac.name,
              description: _ac.email
            }
          };

          rancher.environments.create(req, null, function() {
            console.log('created', req.rancher_environment_id);

            account_model.update({
                internal_id: req.rancher_environment_id
              }, {
                where: {
                  id: _ac.id
                }
              })
              .then(console.log)
              .catch(console.error);
          });
        }, i * 1000);
      })(ac);
    }
  });
