var Sequelize = require('sequelize'),
  _ = require('underscore'),
  account = require('./index').account.model;

var Payment = function(sequelize) {

  var fields = [
    'id',
    'user_id',
    'gateway',
    'gateway_internal_id',
    'amount',
    'event',
    'message',
    'description',
    'created_at',
    'updated_at'
  ];

  var payment = sequelize.define('Payment', {
    user_id: Sequelize.STRING,
    gateway: Sequelize.ENUM('paypal', 'manual', 'webdollar', 'bank'),
    gateway_internal_id: Sequelize.STRING,
    amount: Sequelize.STRING,
    event: Sequelize.ENUM('create', 'update', 'delete', 'error'),
    message: Sequelize.TEXT,
    description: Sequelize.TEXT
  }, {
    underscored: true,
    tableName: 'payments'
  });

  payment.belongsTo(account);

  var create = function(params, callback) {
    payment.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    payment.update(fields, {
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
    payment.findOne({
        attributes: fields,
        where: {
          user_id: params.user.sub,
          id: params.params.payment_id
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
    payment.findAll({
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
    payment.destroy({
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
    model: payment,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Payment;
