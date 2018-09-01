var Sequelize = require('sequelize'),
  _ = require('underscore');

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
    internal_id: Sequelize.STRING,
    host_id: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'miners'
  });

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
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Miner;
