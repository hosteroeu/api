var miner = require('./../models').miner,
  rancher = require('./../services').Rancher(),
  errors = require('./../errors'),
  config = require('./../config');

var Miners = function() {

  var collection = function(req, res, next) {
    miner.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;

    miner.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    miner.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Miner not found'));
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    miner.update(req.body, {
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
    miner.destroy({
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
    miner.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Miner not found'));
      }

      rancher.services.stats(result.internal_id, function(err, message, body) {
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

  var logs = function(req, res, next) {
    miner.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Miner not found'));
      }

      rancher.services.get(result.internal_id, function(err, message, body) {
        if (err && err.connect === true) {
          return next(err);
        }

        var data;
        var container_id;

        try {
          data = JSON.parse(body);
          container_id = data.instanceIds[0];
        } catch(e) {
          return next(e);
        }

        rancher.services.logs(container_id, function(err, message, body) {
          if (err && err.connect === true) {
            return next(err);
          }

          res.send({
            ws: body.url + '?token=' + body.token
          });
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
    stats: stats,
    logs: logs
  };
};

module.exports = Miners();
