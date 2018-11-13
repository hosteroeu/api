var Sequelize = require('sequelize'),
  _ = require('underscore'),
  host = require('./index').host.model;

var Miner = function(sequelize) {

  var fields = [
    'id',
    'name',
    'user_id',
    'deployed',
    'power',
    'status',
    'coin',
    'threads',
    'host_id',
    'server_port',
    'mining_pool_url',
    'domain',
    'wallet',
    'wallet_secret_url',
    'image_uuid',
    'command',
    'internal_id',
    'internal_created',
    'created_at',
    'updated_at'
  ];

  var miner = sequelize.define('Miner', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING,
    power: Sequelize.STRING,
    deployed: Sequelize.STRING,
    status: Sequelize.ENUM('started', 'stopped'),
    coin: Sequelize.ENUM('webdollar', 'nerva'),
    threads: Sequelize.STRING,
    server_port: Sequelize.STRING,
    mining_pool_url: Sequelize.STRING,
    domain: Sequelize.STRING,
    wallet: Sequelize.TEXT,
    wallet_secret_url: Sequelize.STRING,
    image_uuid: Sequelize.STRING,
    command: Sequelize.STRING,
    internal_id: Sequelize.STRING,
    internal_created: Sequelize.STRING,
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
          user_id: params.user.sub,
          id: params.params.miner_id
        },
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
    miner.findAll({
        attributes: fields,
        where: {
          user_id: params.user.sub
        },
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
