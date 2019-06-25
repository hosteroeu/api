var _ = require('underscore'),
  jwt = require('express-jwt'),
  rsaValidation = require('auth0-api-jwt-rsa-validation'),
  errors = require('./../errors');

var bodyCleanup = function(req, res, next) {
  function cleanup(items) {
    _.each(items, function(value, key) {
      if (_.isObject(value) || _.isArray(value)) {
        cleanup(value);
      } else {
        switch (value) {
          case 'NULL':
            items[key] = null;
            break;

          case 'null':
            items[key] = null;
            break;

          case 'true':
            items[key] = true;
            break;

          case 'false':
            items[key] = false;
            break;

          case '':
            items[key] = null;
            break;
        }
      }
    });
  }

  cleanup(req.body);

  next();
};

var filters = function(req, res, next) {
  var filters = _.extend(req.query, req.params),
    filters_whitelist = [
      'host_id',
      'account_id',
      'miner_id',
      'wallet_id',
      'log_id',
      'coin_id',
      'payment_id',
      'on_hostero',
      'on_bootstrap',
      'on_staking',
      'coin',
      'removed',
      'mode'
    ],
    invalid_filters = _.difference(_.keys(filters), filters_whitelist);

  if (invalid_filters.length > 0) {
    return next(new errors.validation_error('Invalid filters: ' + invalid_filters.join()));
  }

  req.filters = filters;

  next();
};

var param = function(req, res, next, id) {
  req.id = id;

  next();
};

var jwtCheck = jwt({
  secret: rsaValidation(),
  algorithms: ['RS256'],
  issuer: 'https://morion4000.auth0.com/',
  audience: 'E6Zeo9d6DEXfEeFyvBPeYw3tYdtYNVDP'
});

module.exports.filters = filters;
module.exports.bodyCleanup = bodyCleanup;
module.exports.param = param;
module.exports.jwtCheck = jwtCheck;
