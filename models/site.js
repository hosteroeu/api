var Sequelize = require('sequelize'),
  _ = require('underscore');

var Site = function(sequelize) {

  var fields = [
    'id',
    'name',
    'status',
    'scale',
    'rancher_service_id',
    'created_at',
    'updated_at'
  ];

  var site = sequelize.define('Site', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING,
    rancher_service_id: Sequelize.STRING,
    scale: Sequelize.INTEGER,
    status: Sequelize.ENUM('started', 'stopped')
  }, {
    underscored: true,
    tableName: 'sites'
  });

  var create = function(params, callback) {
    site.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    site.update(fields, {
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
    site.findOne({
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
    site.findAll({
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
    site.destroy({
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

module.exports = Site;
