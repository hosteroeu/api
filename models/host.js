var Sequelize = require('sequelize'),
  _ = require('underscore'),
  account = require('./index').account.model;

var Host = function(sequelize) {

  var fields = [
    'id',
    'name',
    'user_id',
    'deployed',
    'account_id',
    'status',
    'internal_id',
    'internal_created',
    'hostname',
    'docker_version',
    'os',
    'os_kernel',
    'memory_total',
    'cpu_count',
    'cpu_mhz',
    'cpu_model',
    'created_at',
    'updated_at'
  ];

  var host = sequelize.define('Host', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING,
    deployed: Sequelize.STRING,
    status: Sequelize.ENUM('started', 'stopped'),
    internal_id: Sequelize.STRING,
    internal_created: Sequelize.STRING,
    hostname: Sequelize.STRING,
    docker_version: Sequelize.STRING,
    os: Sequelize.STRING,
    os_kernel: Sequelize.STRING,
    memory_total: Sequelize.STRING,
    cpu_count: Sequelize.STRING,
    cpu_mhz: Sequelize.STRING,
    cpu_model: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'hosts'
  });

  host.belongsTo(account);

  var create = function(params, callback) {
    host.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    host.update(fields, {
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
    host.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub,
          id: params.params.host_id
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
    host.findAll({
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
    host.destroy({
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
    model: host,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Host;
