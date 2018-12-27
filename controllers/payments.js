var payment = require('./../models').payment,
  log = require('./../models').log,
  account = require('./../models').account,
  errors = require('./../errors'),
  config = require('./../config'),
  request = require('request'),
  _ = require('underscore');

var Payments = function() {

  var collection = function(req, res, next) {
    payment.findAll(req, function(err, result) {
      if (err) {
        return next(err);
      }

      res.send(result);
    });
  };

  var create = function(req, res, next) {
    req.body.user_id = req.user.sub;
    req.body.internal_id = req.rancher_environment_id;

    payment.create(req.body, function(err, result) {
      if (err) {
        return next(err);
      }

      log.create({
        user_id: result.user_id,
        payment_id: result.id,
        entity: 'payment',
        entity_id: result.id,
        event: 'create',
        message: 'Created an payment',
        extra_message: JSON.stringify(result)
      });

      res.status(201);
      res.send(result);
    });
  };

  var retrieve = function(req, res, next) {
    payment.find(req, function(err, result) {
      if (err) {
        return next(err);
      }

      if (!result) {
        return next(new errors.not_found('Payment not found'));
      }

      res.send(result);
    });
  };

  var update = function(req, res, next) {
    payment.update(req.body, {
      id: req.id,
      user_id: req.user.sub
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      log.create({
        user_id: req.user.sub,
        payment_id: req.id,
        entity: 'payment',
        entity_id: req.id,
        event: 'update',
        message: 'Updated an payment',
        extra_message: JSON.stringify(req.body)
      });

      res.status(204);
      res.send();
    });
  };

  var remove = function(req, res, next) {
    payment.destroy({
      id: req.id,
      user_id: req.user.sub
    }, function(err, result) {
      if (err) {
        return next(err);
      }

      res.status(204);
      res.send();
    });
  };

  var ipn = function(req, res, next) {
    console.log(req.body);

    // Read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
    var query = ['cmd=_notify-validate'];

    for (var key in req.body) {
      query.push(key + '=' + req.body[key]);
    }

    var body = query.join('&');

    console.log(body);

    var options = {
      //url: 'https://www.sandbox.paypal.com/cgi-bin/webscr', // old
      //url: 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
      url: 'https://ipnpb.paypal.com/cgi-bin/webscr',
      method: 'POST',
      headers: {
        'Connection': 'close'
      },
      body: body,
      strictSSL: true,
      rejectUnauthorized: false,
      requestCert: true,
      agent: false
    };

    // POST IPN data back to PayPal to validate
    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        //Inspect IPN validation result and act accordingly
        if (body.substring(0, 8) === 'VERIFIED') {

          //The IPN is verified
          console.log('Verified IPN!');

          account.findAll({
            email: req.body.payer_email
          }, function(err, result) {
            if (err) {
              console.error('Could not find account');
              console.error(err);
            }

            if (result.length > 0) {
              var user_account = result[0];

              console.log('found account', user_account.id);

              payment.create({
                user_id: user_account.user_id,
                account_id: user_account.id,
                gateway: 'paypal',
                gateway_internal_id: req.body.txn_id,
                amount: req.body.mc_gross,
                event: 'create',
                message: JSON.stringify(req.body)
              }, _.noop);
            } else {
              console.error('Could not find account');
            }
          });
        } else if (body.substring(0, 7) === 'INVALID') {
          //The IPN invalid
          console.error('Invalid IPN!');
        } else {
          //Unexpected response body
          console.error('Unexpected response body!');
          console.error(body);
        }
      } else {
        //Unexpected response
        console.error('Unexpected response!');
        //console.log(response);
      }
    });

    res.status(200);
    res.send();
  };

  return {
    collection: collection,
    create: create,
    retrieve: retrieve,
    update: update,
    remove: remove,
    ipn: ipn
  };
};

module.exports = Payments();
