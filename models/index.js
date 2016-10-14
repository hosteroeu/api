var Sequelize = require('sequelize'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  config = require('./../config'),
  // Assume Sequelize the default adapter
  modules_adapters = {},
  files = fs.readdirSync(__dirname),
  sequelize;

sequelize = new Sequelize(config.postgres.connection_string, {
  logging: console.log,
  maxConcurrentQueries: config.postgres.max_concurent_queries,
  pool: config.postgres.pool
});

files.forEach(function(file) {
  var adapter = sequelize,
    file_name = file.match(/(.*).js/)[1],
    file_path = path.join(__dirname, file);

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
