var account = require('./../models').account,
  log = require('./../models').log,
  errors = require('./../errors'),
  config = require('./../config'),
  mailgun = require('./../services').Mailgun(),
  mailchimp = require('./../services').Mailchimp(),
  _ = require('underscore');

var Accounts = function() {

  var collection = function(req, res, next) {
    account.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      var curated = _.map(result, function(fields) {
        return _.omit(fields.dataValues, 'name', 'email', 'full_name', 'internal_id', 'user_id');
      });

      res.send(curated);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;
    req.body.internal_id = req.rancher_environment_id;

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

      res.send(result);
    });
  };

  var update = function(req, res, next) {
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

      mailgun.mail.send({
        to: config.admin.email,
        subject: '[SYSTEM] New account',
        body: JSON.stringify(req.body)
      }, null, console.log);

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
    account.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      var found = _.find(result, function(field) {
        return field.user_id === req.user.sub;
      });

      if (found) {
        return res.send(found);
      }

      // TODO: Longer ids?
      req.body.name = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);

      next();
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
