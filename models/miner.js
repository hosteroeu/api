var Sequelize = require('sequelize'),
  _ = require('underscore'),
  host = require('./index').host.model;

var Miner = function(sequelize) {

  var fields = [
    'id',
    'name',
    'user_id',
    'status',
    'host_id',
    'internal_id',
    'created_at',
    'updated_at'
  ];

  var miner = sequelize.define('Miner', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING,
    status: Sequelize.ENUM('started', 'stopped'),
    server_port: Sequelize.STRING,
    mining_pool_url: Sequelize.STRING,
    domain: Sequelize.STRING,
    terminal_workers_type: Sequelize.STRING,
    terminal_workers_cpu_max: Sequelize.STRING,
    image_uuid: Sequelize.STRING,
    command: Sequelize.STRING,
    internal_id: Sequelize.STRING,
  }, {
    underscored: true,
    tableName: 'miners'
  });

  miner.belongsTo(host);

  var create = function(params, callback) {
    miner.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    miner.update(fields, {
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
    miner.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub
        }
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var findAll = function(params, callback) {
    miner.findAll({
        attributes: fields,
        where: {
          user_id: params.user.sub
        }
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var destroy = function(condition, callback) {
    miner.destroy({
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
    model: miner,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Miner;
