var request = require('request'),
  errors = require('./../errors'),
  config = require('./../config');

var Rancher = function() {

  var environments = function() {};

  return {
    environments: environments
  };
};

module.exports = Rancher;
