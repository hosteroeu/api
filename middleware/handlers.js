var config = require('./../config');

var errors = function(err, req, res, next) {
  var error_code = err.code || 500,
    error_message = err.message || 'Internal server error';

  switch (config.env) {
    case 'production':
    case 'test':
      console.log(req.method, req.url, err);

    case 'development':
      if (error_code === 500) {
        throw err;
        //throw JSON.stringify(err);
      }
      break;
  }

  res.send(error_code, {
    code: error_code,
    message: error_message
  });
}

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
