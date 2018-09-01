var Sequelize = require('sequelize'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  config = require('./../config'),
  // Assume Sequelize the default adapter
  modules_adapters = {},
  files = fs.readdirSync(__dirname),
  sequelize;

sequelize = new Sequelize(config.mysql.connection_string, {
  logging: config.mysql.logging,
  maxConcurrentQueries: config.mysql.max_concurent_queries,
  pool: config.mysql.pool
});

files.forEach(function(file) {
  var adapter = sequelize;

  try {
    var file_name = file.match(/(.*).js/)[1];
    var file_path = path.join(__dirname, file);
  } catch(e) {
    return;
  }

  if (file_name === 'index') {
    return;
  }

  if (_.has(modules_adapters, file_name)) {
    switch (modules_adapters[file_name]) {
      default: adapter = sequelize;
      break;
    }
  }

  module.exports[file_name] = require(file_path)(adapter);
});

module.exports.sequelize = sequelize;
