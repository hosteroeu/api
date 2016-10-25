var mysql = require('mysql'),
  errors = require('./../errors'),
  config = require('./../config');

var Mysql = function() {
  // TODO: Maybe move connection out of the main function
  var _connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    multipleStatements: true
  });

  var _generate_random_string = function(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }

    return randomString;
  };

  var databases = function() {
    return {
      create: function(req, res, next) {
        var db_name = _generate_random_string(5, 'abcdefghijklmnopqrstuvwxyz'),
          db_user = _generate_random_string(5, 'abcdefghijklmnopqrstuvwxyz'),
          db_password = _generate_random_string(10, 'abcdefghijklmnopqrstuvwxyz'),
          query = 'create database ??;' +
          'create user ??;' +
          'grant all on ??.* to ?@"%%" identified by ?;';

        req.db_name = db_name;
        req.db_user = db_user;
        req.db_password = db_password;

        _connection.query(query, [
          db_name,
          db_user,
          db_name,
          db_user,
          db_password
        ], function(err, results) {
          next(err);
        });
      }
    };
  };

  return {
    databases: databases(),
  };
};

module.exports = Mysql;
