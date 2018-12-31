var errors = require('./../errors'),
  config = require('./../config'),
  mailgun = require('mailgun-js')({
    apiKey: config.mailgun.key,
    domain: config.mailgun.domain
  });

//require('request-debug')(request);

var Mailgun = function() {
  var mail = function() {
    return {
      send: function(req, res, next) {
        var data = {
          from: 'Hostero <no-reply@mg.hostero.eu>',
          to: req.to,
          subject: req.subject,
          text: req.body
        };

        mailgun.messages().send(data, next);
      }
    };
  };

  return {
    mail: mail(),
  };
};

module.exports = Mailgun;
