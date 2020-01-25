var Sequelize = require('sequelize'),
  _ = require('underscore'),
  config = require('./../config'),
  account = require('./index').account.model;

var Pool = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'url',
    'port',
    'password',
    'username',
    'created_at',
    'updated_at'
  ];

  var pool = sequelize.define('Pool', {
    user_id: Sequelize.STRING,
    url: Sequelize.STRING,
    port: Sequelize.INTEGER,
    password: Sequelize.STRING,
    username: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'pools'
  });

  pool.belongsTo(account);

  var create = function(params, callback) {
    pool.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    pool.update(fields, {
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
      id: params.params.Pool_id
    };

    if (params.user.sub !== config.admin.user_id) {
      condition.user_id = {
        $or: [params.user.sub, 'shared']
      };
    }

    pool.findOne({
        attributes: fields,
        where: condition,
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
    var condition = {};

    if (params.user.sub !== config.admin.user_id) {
      condition.user_id = {
        $or: [params.user.sub, 'shared']
      };
    }

    pool.findAll({
        attributes: {
          include: [['(select count(*) from miners where miners.Pool_id = Pool.id)', 'miners_no']]
        },
        where: condition,
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
    pool.destroy({
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
    model: pool,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Pool;
