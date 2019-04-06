var Sequelize = require('sequelize'),
  _ = require('underscore'),
  account = require('./index').account.model;

var Log = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'account_id',
    'entity',
    'entity_id',
    'message',
    'extra_message',
    'source',
    'created_at',
    'updated_at'
  ];

  var log = sequelize.define('Log', {
    user_id: Sequelize.STRING,
    entity: Sequelize.ENUM('account', 'host', 'miner', 'wallet', 'setting'),
    entity_id: Sequelize.INTEGER,
    event: Sequelize.ENUM('create', 'update', 'delete', 'deploy', 'undeploy', 'error'),
    message: Sequelize.STRING,
    extra_message: Sequelize.TEXT,
    source: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'logs'
  });

  log.belongsTo(account);

  var create = function(params, callback) {
    log.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    log.update(fields, {
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
    log.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub,
          id: params.params.log_id
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
    log.findAll({
        attributes: fields,
        where: {
          user_id: params.user.sub
        },
        include: [{
          model: account,
        }],
        limit: 100,
        order: [['created_at', 'DESC']]
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var destroy = function(condition, callback) {
    log.destroy({
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
    model: log,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Log;
