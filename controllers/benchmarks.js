var benchmark = require('./../models').benchmark,
  errors = require('./../errors'),
  config = require('./../config'),
  request = require('request'),
  _ = require('underscore');

var Benchmarks = function() {

  var collection = function(req, res, next) {
    benchmark.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      var indexed = {};
      var results = [];

      for (var i = 0; i < result.length; i++) {
        var bench = result[i];
        var index = bench.coin + ' ' + bench.cpu_model;

        // TODO: Do average, not max
        if (indexed[index] && indexed[index].power > bench.power || bench.power === 0) {
          continue;
        }

        indexed[index] = bench;
      }

      for (var _i in indexed) {
        results.push(indexed[_i]);
      }

      res.send(results);
    });
  };

  return {
    collection: collection
  };
};

module.exports = Benchmarks();
