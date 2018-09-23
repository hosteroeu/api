var host = require('./../models').host,
  rancher = require('./../services').Rancher(),
  errors = require('./../errors'),
  config = require('./../config');

var Hosts = function() {

  var collection = function(req, res, next) {
    host.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;

    host.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    host.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Host not found'));
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    host.update(req.body, {
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
    host.destroy({
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

  var stats = function(req, res, next) {
    host.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Host not found'));
      }

      rancher.hosts.stats(result.internal_id, function(err, message, body) {
        if (err && err.connect === true) {
          return next(err);
        }

        var data = JSON.parse(body);

        res.send({
          ws: data.url + '?token=' + data.token
        });
      });
    });
  };

  return {
    collection: collection,
    create: create,
    retrieve: retrieve,
    update: update,
    remove: remove,
    stats: stats
  };
};

module.exports = Hosts();
