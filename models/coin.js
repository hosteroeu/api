var Sequelize = require('sequelize'),
  _ = require('underscore');

var Coin = function(sequelize) {

  var fields = [
    'id',
    'name',
    'short_name',
    'internal_name',
    'on_hostero',
    'color',
    'description',
    'algorithm',
    'released_date',
    'supply',
    'fixed_supply',
    'network_hashrate',
    'latest_block',
    'cpu_only',
    'website_url',
    'cmc_url',
    'explorer_url',
    'statistics_url',
    'calculator_url',
    'mining_pools_url',
    'exchange_url',
    'logo_url',
    'created_at',
    'updated_at'
  ];

  var coin = sequelize.define('Coin', {
    name: Sequelize.STRING,
    short_name: Sequelize.STRING,
    internal_name: Sequelize.STRING,
    on_hostero: Sequelize.BOOLEAN,
    color: Sequelize.STRING,
    description: Sequelize.TEXT,
    algorithm: Sequelize.STRING,
    released_date: Sequelize.STRING,
    supply: Sequelize.INTEGER,
    fixed_supply: Sequelize.BOOLEAN,
    network_hashrate: Sequelize.STRING,
    latest_block: Sequelize.INTEGER,
    cpu_only: Sequelize.BOOLEAN,
    website_url: Sequelize.STRING,
    cmc_url: Sequelize.STRING,
    explorer_url: Sequelize.STRING,
    statistics_url: Sequelize.STRING,
    calculator_url: Sequelize.STRING,
    mining_pools_url: Sequelize.STRING,
    exchange_url: Sequelize.STRING,
    logo_url: Sequelize.STRING
  }, {
    underscored: true,
    tableName: 'coins'
  });

  var create = function(params, callback) {
    coin.create(params)
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var update = function(fields, condition, callback) {
    coin.update(fields, {
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
    coin.findOne({
        attributes: fields,
        where: {
          id: params.params.coin_id
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
    coin.findAll({
        attributes: fields
      })
      .then(function(result) {
        callback(null, result);
      })
      .catch(function(err) {
        callback(err, null);
      });
  };

  var destroy = function(condition, callback) {
    coin.destroy({
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
    model: coin,
    create: create,
    update: update,
    find: find,
    findAll: findAll,
    destroy: destroy
  };
};

module.exports = Coin;
