var Sequelize = require('sequelize'),
  _ = require('underscore');

var Account = function(sequelize) {

  var fields = [
    'id',
    'internal_id',
    'name',
    'email',
    'full_name',
    'auto_deploy',
    'auto_deploy_coin',
    'wallet_nerva',
    'wallet_webdollar',
    'mining_pool_url_webdollar',
    'plan_hosts',
    'created_at',
    'updated_at'
  ];

  var account = sequelize.define('Account', {
    name: Sequelize.STRING,
    internal_id: Sequelize.STRING,
    user_id: Sequelize.STRING,
    full_name: Sequelize.STRING,
    email: Sequelize.STRING,
    auto_deploy: Sequelize.BOOLEAN,
    auto_deploy_coin: Sequelize.ENUM('webdollar', 'nerva'),
    wallet_nerva: Sequelize.TEXT,
    wallet_webdollar: Sequelize.TEXT,
    mining_pool_url_webdollar: Sequelize.STRING,
    plan_hosts: Sequelize.STRING,
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
  };

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
  };

  var find = function(params, callback) {
    account.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub,
          id: params.params.account_id
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
  };

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
  };

  return {
    model: account,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Account;
