var _ = require('underscore'), 
  config = require('./../config');

var errors = function(err, req, res, next) {
  var error_code = 500,
    error_message = err.message || 'Internal server error',
    environment = config.env;

  if (_.has(err, 'code') && _.isNumber(err.code)) {
    error_code = err.code;
  }

  if (_.has(err, 'status') && _.isNumber(err.status)) {
    error_code = err.status;
  }

  switch (environment) {
    case 'production':
      console.log(req.method, req.url, err);
      break;

    case 'test':
      console.log(req.method, req.url, err);
      break;

    case 'development':
      if (error_code === 500) {
        throw err;
        //throw JSON.stringify(err);
      }
      break;
  }

  res.status(error_code).send({
    code: error_code,
    message: error_message
  });
};

var raw_body = function(req, res, next) {
  var data = '';

  req.on('data', function(chunk) {
    data += chunk;
  });

  req.on('end', function() {
    req.rawBody = data;

    next();
  });
}

module.exports.errors = errors;
module.exports.raw_body = raw_body;
