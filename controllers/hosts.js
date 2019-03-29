var host = require('./../models').host,
  log = require('./../models').log,
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

  var events = function(req, res, next) {
    log.model.findAll({
        where: {
          user_id: req.user.sub,
          entity: 'host',
          entity_id: req.id,
        },
        limit: 100,
        order: [
          ['created_at', 'DESC']
        ]
      })
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        next(err);
      });
  };

  return {
    collection: collection,
    create: create,
    retrieve: retrieve,
    update: update,
    remove: remove,
    stats: stats,
    events: events
  };
};

module.exports = Hosts();
