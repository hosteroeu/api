var account = require('./../models').account,
  errors = require('./../errors'),
  config = require('./../config');

var Accounts = function() {

  var collection = function(req, res, next) {
    account.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;
    req.body.internal_id = req.rancher_environment_id;

    account.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

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

      if (result.length > 0) {
        // Each account has only one environment attached, currently
        return res.send(result[0]);
      }

      req.body.account_name = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);

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
