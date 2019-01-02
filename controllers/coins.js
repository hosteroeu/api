var coin = require('./../models').coin,
  errors = require('./../errors'),
  config = require('./../config'),
  request = require('request'),
  _ = require('underscore');

var Coins = function() {

  var collection = function(req, res, next) {
    coin.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    coin.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    coin.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Coin not found'));
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    coin.update(req.body, {
      id: req.id,
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(204);
      res.send();
    });
  };

  var remove = function(req, res, next) {
    coin.destroy({
      id: req.id,
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

module.exports = Coins();
