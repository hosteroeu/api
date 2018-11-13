var log = require('./../models').log,
  rancher = require('./../services').Rancher(),
  errors = require('./../errors'),
  config = require('./../config');

var Logs = function() {

  var collection = function(req, res, next) {
    log.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;

    log.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    log.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Log not found'));
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    log.update(req.body, {
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
    log.destroy({
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

  return {
    collection: collection,
    create: create,
    retrieve: retrieve,
    update: update,
    remove: remove
  };
};

module.exports = Logs();
