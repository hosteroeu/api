var errors = require('./../errors'),
  config = require('./../config'),
  Raven = require('raven');

var Sentry = function() {
  Raven.config('https://d7ed343f84f04a1780f575031ed8648f@sentry.io/1407666').install();

  return {
    Raven: Raven
  };
};

module.exports = Sentry;
