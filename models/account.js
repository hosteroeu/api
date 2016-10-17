var Sequelize = require('sequelize'),
  _ = require('underscore');

var Account = function(sequelize) {

  var fields = [
    'id',
    'name',
    'created_at',
    'updated_at'
  ];

  var account = sequelize.define('Account', {
    name: Sequelize.STRING,
    user_id: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'accounts'
  });

  var create = function(params, callback) {
    account.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var update = function(fields, condition, callback) {
    account.update(fields, {
        where: condition
      })
      .then(function(result) {
        callback();
      })
      .catch(function(err) {
        callback(err, null);
      });
  }

  var find = function(params, callback) {
    account.findOne({
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
  }

  var findAll = function(params, callback) {
    account.findAll({
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
  }

  var destroy = function(condition, callback) {
    account.destroy({
        where: condition
      })
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

module.exports = Account;
