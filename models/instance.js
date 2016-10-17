var Sequelize = require('sequelize'),
  squel = require('squel'),
  _ = require('underscore');

var Instance = function(sequelize) {

  var fields = [
    'id',
    'name',
    'created_at',
    'updated_at'
  ];

  var instance = sequelize.define('Instance', {
    name: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'instances'
  });

  var create = function(params, callback) {
    instance.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var update = function(fields, condition, callback) {
    instance.update(fields, condition)
      .then(function(result) {
        callback();
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var find = function(params, callback) {
    instance.findOne({
        attributes: fields,
        where: {}
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var findAll = function(params, callback) {
    instance.findAll({
        attributes: fields,
        where: {}
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var destroy = function(params, callback) {
    instance.destroy(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  return {
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  }
}

module.exports = Instance;
