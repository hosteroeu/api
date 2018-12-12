var payment = require('./../models').payment,
  log = require('./../models').log,
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
    /*
    log.create({
      user_id: req.user.sub,
      payment_id: req.id,
      entity: 'payment',
      entity_id: req.id,
      event: 'update',
      message: 'Updated an payment',
      extra_message: JSON.stringify(req.body)
    });
    */

    console.log(req.body);

    // Read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
    req.body.cmd = '_notify-validate';

    var body = req.body;
    console.log(body);

    var options = {
      url: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
      method: 'POST',
      headers: {
        'Connection': 'close'
      },
      body: JSON.stringify(body),
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
        } else if (body.substring(0, 7) === 'INVALID') {

          //The IPN invalid
          console.log('Invalid IPN!');
        } else {
          //Unexpected response body
          console.log('Unexpected response body!');
          console.log(body);
        }
      } else {
        //Unexpected response
        console.log('Unexpected response!');
        console.log(response);
      }
    });

    next();
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
