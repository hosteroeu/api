var Sequelize = require('sequelize'),
  _ = require('underscore'),
  config = require('./../config'),
  account = require('./index').account.model;

var Wallet = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'balance',
    'coin',
    'address',
    'public_key',
    'private_key',
    'password',
    'created_at',
    'updated_at'
  ];

  var wallet = sequelize.define('Wallet', {
    user_id: Sequelize.STRING,
    balance: Sequelize.INTEGER,
    coin: Sequelize.STRING,
    address: Sequelize.STRING,
    public_key: Sequelize.TEXT,
    private_key: Sequelize.TEXT,
    password: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'wallets'
  });

  wallet.belongsTo(account);

  var create = function(params, callback) {
    wallet.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    wallet.update(fields, {
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
      id: params.params.Wallet_id
    };

    if (params.user.sub !== config.admin.user_id) {
      condition.user_id = {
        $or: [params.user.sub, 'shared']
      };
    }

    wallet.findOne({
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

    wallet.findAll({
        attributes: {
          include: [['(select count(*) from miners where miners.Wallet_id = Wallet.id)', 'miners_no']]
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
    wallet.destroy({
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
    model: wallet,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Wallet;
