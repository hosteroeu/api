var Sequelize = require('sequelize'),
  _ = require('underscore');

var Account = function(sequelize) {

  var fields = [
    'id',
    'internal_id',
    'user_id',
    'name',
    'email',
    'paypal_email',
    'full_name',
    'auto_deploy',
    'auto_deploy_coin',
    'wallet_nerva',
    'wallet_webdollar',
    'mining_pool_url_webdollar',
    'wallet_webchain',
    'password_webchain',
    'mining_pool_url_webchain',
    'wallet_veruscoin',
    'password_veruscoin',
    'mining_pool_url_veruscoin',
    'wallet_credits',
    'password_credits',
    'mining_pool_url_credits',
    'plan_miners',
    'bonus_miners',
    'rancher_uri',
    'created_at',
    'updated_at'
  ];

  var account = sequelize.define('Account', {
    name: Sequelize.STRING,
    internal_id: Sequelize.STRING,
    user_id: Sequelize.STRING,
    full_name: Sequelize.STRING,
    email: Sequelize.STRING,
    paypal_email: Sequelize.STRING,
    auto_deploy: Sequelize.BOOLEAN,
    auto_deploy_coin: Sequelize.STRING,
    wallet_nerva: Sequelize.TEXT,
    wallet_webdollar: Sequelize.TEXT,
    mining_pool_url_webdollar: Sequelize.STRING,
    wallet_webchain: Sequelize.STRING,
    password_webchain: Sequelize.STRING,
    mining_pool_url_webchain: Sequelize.STRING,
    wallet_veruscoin: Sequelize.STRING,
    password_veruscoin: Sequelize.STRING,
    mining_pool_url_veruscoin: Sequelize.STRING,
    wallet_credits: Sequelize.STRING,
    password_credits: Sequelize.STRING,
    mining_pool_url_credits: Sequelize.STRING,
    plan_miners: Sequelize.INTEGER,
    bonus_miners: Sequelize.INTEGER,
    rancher_uri: Sequelize.STRING
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
        where: params
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
