var errors = require('./../errors'),
  config = require('./../config'),
  Mailchimp = require('mailchimp-api-v3'),
  mailchimp = new Mailchimp(config.mailchimp.key);

var Mailchimp = function() {
  var lists = function() {
    return {
      subscribe: function(req, res, next) {
        var data = {
          email_address: req.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: req.first_name || '',
            LNAME: req.last_name || ''
          }
        };

        mailchimp.post('/lists/' + config.mailchimp.subscribers_list + '/members', data, next);
      }
    };
  };

  return {
    lists: lists(),
  };
};

module.exports = Mailchimp;
