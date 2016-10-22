var Sequelize = require('sequelize'),
  _ = require('underscore');

var Instance = function(sequelize) {

  var fields = [
    'id',
    'name',
    'created_at',
    'updated_at'
  ];

  var instance = sequelize.define('Instance', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING
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
  };

  var update = function(fields, condition, callback) {
    instance.update(fields, {
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
    instance.findOne({
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
    instance.findAll({
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
    instance.destroy({
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

module.exports = Instance;
