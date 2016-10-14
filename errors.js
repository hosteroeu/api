var util = require('util');

var Errors = function() {
  var not_found = function(message) {
    this.code = 404;
    this.message = message;

    Error.call(this);
  };

  var no_content = function(message) {
    this.code = 204;
    this.message = message;

    Error.call(this);
  };

  var not_implemented = function(message) {
    this.code = 501;
    this.message = message;

    Error.call(this);
  };

  var not_authorised = function(message) {
    this.code = 401;
    this.message = message;

    Error.call(this);
  };

  var bad_request = function(message) {
    this.code = 400;
    this.message = message;

    Error.call(this);
  };

  var server_error = function(message) {
    this.code = 500;
    this.message = message;

    Error.call(this);
  };

  var validation_error = function(message, path) {
    this.code = 400;
    this.message = message;
    this.errors = {};
    this.errors[path] = {
      message: message,
      name: 'ValidationError',
      path: path,
      type: 'user defined'
    };

    Error.call(this);
  };

  var conflict_error = function(message, path) {
    this.code = 409;
    this.message = message;
    this.errors = {};
    this.errors[path] = {
      message: message,
      name: 'ConflictError',
      path: path,
      type: 'user defined'
    };

    Error.call(this);
  };

  util.inherits(not_found, Error);
  util.inherits(no_content, Error);
  util.inherits(not_implemented, Error);
  util.inherits(not_authorised, Error);
  util.inherits(bad_request, Error);
  util.inherits(validation_error, Error);
  util.inherits(server_error, Error);
  util.inherits(conflict_error, Error);

  return {
    not_found: not_found,
    no_content: no_content,
    not_implemented: not_implemented,
    not_authorised: not_authorised,
    bad_request: bad_request,
    validation_error: validation_error,
    server_error: server_error,
    conflict_error: conflict_error
  };
};

module.exports = Errors();
