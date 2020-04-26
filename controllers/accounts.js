var account = require('./../models').account,
  log = require('./../models').log,
  errors = require('./../errors'),
  config = require('./../config'),
  mailgun = require('./../services').Mailgun(),
  mailchimp = require('./../services').Mailchimp(),
  crypto = require('./../services').Crypto(),
  rancher = require('./../services').Rancher(),
  _ = require('underscore');

var Accounts = function() {

  var collection = function(req, res, next) {
    account.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      // TODO: Use _.pick instead of _.omit
      // should be inclusional instead of exclusional
      var curated = _.map(result, function(fields) {
        return _.omit(fields.dataValues, 'name', 'email', 'full_name', 'internal_id', 'user_id', 'password_webdollar', 'password_webchain', 'password_veruscoin', 'password_credits', 'password_myriad', 'password_yenten', 'password_globalboost', 'password_elicoin');
      });

      res.send(curated);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;
    req.body.internal_id = req.rancher_environment_id;

    if (req.body.full_name) {
      req.body.full_name = req.body.full_name.replace(/[^\x00-\x7F]/g, '');
    }

    try {
      req.body.password_webdollar = crypto.encrypt(req.body.password_webdollar);
    } catch(e) {
      console.error('=== could not encrypt password');
    }

    account.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      log.create({
        user_id: result.user_id,
        account_id: result.id,
        entity: 'account',
        entity_id: result.id,
        event: 'create',
        message: 'Created an account',
        extra_message: JSON.stringify(result)
      }, _.noop);

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    account.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Account not found'));
      }

      try {
        result.password_webdollar = crypto.decrypt(result.password_webdollar);
      } catch(e) {
        console.error('=== could not decrypt password');
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    try {
      req.body.password_webdollar = crypto.encrypt(req.body.password_webdollar);
    } catch(e) {
      console.error('=== could not encrypt password');
    }

    if (req.body.full_name) {
      req.body.full_name = req.body.full_name.replace(/[^\x00-\x7F]/g, '');
    }

    account.update(req.body, {
      id: req.id,
      user_id: req.user.sub
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      log.create({
        user_id: req.user.sub,
        account_id: req.id,
        entity: 'account',
        entity_id: req.id,
        event: 'update',
        message: 'Updated your account',
        extra_message: JSON.stringify(req.body)
      }, _.noop);

      // After the account is created, email is being sent
      if (_.has(req.body, 'email')) {
        mailchimp.lists.subscribe({
          email: req.body.email,
          first_name: req.body.full_name || '',
          last_name: ''
        }, null, console.log);
      }

      res.status(204);
      res.send();
    });
  };

  var remove = function(req, res, next) {
    account.destroy({
      id: req.id,
      user_id: req.user.sub
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(204);
      res.send();
    });
  };

  var sync = function(req, res, next) {
    account.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (result) {
        // Create rancher stack for user if stack has been cleaned up
        if (!result.internal_id) {
          console.log('Recreating stack for user ' + result.id);

          req.body.name = result.name;

          rancher.environments.create(req, null, function() {
            console.log('New stack for user ' + result.id + ', ' + req.rancher_environment_id);

            account.update({
              internal_id: req.rancher_environment_id
            }, {
              id: result.id
            }, console.log);
          });
        }

        return res.send(result);
      } else {
        console.log('Creating stack for new user');

        req.body.name = ('000000' + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);

        // If no user have been found, forward the request to next
        // function in router (accounts.create)
        // Create rancher stack for user if just registered
        rancher.environments.create(req, null, next);
      }
    });
  };

  return {
    collection: collection,
    create: create,
    retrieve: retrieve,
    update: update,
    remove: remove,
    sync: sync
  };
};

module.exports = Accounts();
