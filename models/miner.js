var Sequelize = require('sequelize'),
  _ = require('underscore'),
  config = require('./../config'),
  host = require('./index').host.model;

var Miner = function(sequelize) {

  var fields = [
    'id',
    'mode',
    'name',
    'user_id',
    'deployed',
    'type',
    'power',
    'block',
    'status',
    'coin',
    'threads',
    'processor',
    'host_id',
    'mining_pool_url',
    'wallet',
    'password',
    'image_uuid',
    'command',
    'internal_id',
    'internal_created',
    'temporary',
    'created_at',
    'updated_at'
  ];

  var miner = sequelize.define('Miner', {
    mode: Sequelize.ENUM('miner', 'node', 'staking'),
    name: Sequelize.STRING,
    user_id: Sequelize.STRING,
    power: Sequelize.STRING,
    block: Sequelize.INTEGER,
    deployed: Sequelize.STRING,
    type: Sequelize.STRING,
    status: Sequelize.ENUM('started', 'stopped'),
    coin: Sequelize.STRING,
    threads: Sequelize.STRING,
    processor: Sequelize.STRING,
    mining_pool_url: Sequelize.STRING,
    wallet: Sequelize.TEXT,
    password: Sequelize.TEXT,
    image_uuid: Sequelize.STRING,
    command: Sequelize.STRING,
    internal_id: Sequelize.STRING,
    internal_created: Sequelize.STRING,
    temporary: Sequelize.BOOLEAN,
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
    var condition = {
      id: params.params.miner_id
    };

    if (params.user.sub !== config.admin.user_id) {
      condition.user_id = params.user.sub;
    }

    miner.findOne({
        attributes: fields,
        where: condition,
        include: [{
          model: host,
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
    var condition = params.query || {};

    if (params.user.sub !== config.admin.user_id) {
      condition.user_id = params.user.sub;
    }

    miner.findAll({
        attributes: fields,
        where: condition,
        include: [{
          model: host,
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
