var Sequelize = require('sequelize'),
  _ = require('underscore');

var Benchmark = function(sequelize) {

  var fields = [
    'id',
    'coin',
    'power',
    'cpu_count',
    'cpu_mhz',
    'cpu_model',
    'os',
    'os_kernel',
    'docker_version',
    'memory_total',
    'threads',
    'created_at',
    'updated_at'
  ];

  var benchmark = sequelize.define('Benchmark', {
    coin: Sequelize.STRING,
    power: Sequelize.INTEGER,
    cpu_model: Sequelize.STRING,
    cpu_count: Sequelize.INTEGER,
    cpu_mhz: Sequelize.STRING,
    os: Sequelize.STRING,
    os_kernel: Sequelize.STRING,
    docker_version: Sequelize.STRING,
    memory_total: Sequelize.STRING,
    threads: Sequelize.INTEGER
  }, {
    underscored: true,
    tableName: 'benchmarks'
  });

  var create = function(params, callback) {
    benchmark.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    benchmark.update(fields, {
        where: condition
      })
      .then(function(result) {
        callback();
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var find = function(params, callback) {
    benchmark.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub,
          id: params.params.benchmark_id
        },
        include: [{
          model: account,
        }]
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var findAll = function(params, callback) {
    benchmark.findAll({
        attributes: fields,
        where: {
          user_id: params.user.sub
        },
        include: [{
          model: account,
        }]
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var destroy = function(condition, callback) {
    benchmark.destroy({
        where: condition
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  return {
    model: benchmark,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Benchmark;
