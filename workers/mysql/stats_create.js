var WebSocketClient = require('websocket').client;
var _ = require('underscore');
var async = require('async');

var rancher = require('./../../services').Rancher();
var config = require('./../../config');
var miner_model = require('./../../models').miner.model;

function get_ws_data_for_uri(uri, callback) {
  var client = new WebSocketClient();
  var timeout;

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ', error.toString());
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    // Do not wait more than 10 seconds
    timeout = setTimeout(function() {
      connection.close(1000); // WebSocketConnection.CLOSE_REASON_NORMAL

      callback(null, 0);
    }, 10*1000);

    connection.on('error', function(error) {
      console.log('Connection Error: ', error.toString());
    });

    connection.on('close', function() {
      console.log('Connection Closed');
    });

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        var event = message.utf8Data;

        var regex1 = /([0-9.])+ hashes\/s/g;
        var regex2 = /([0-9.])+ H\/s/g;
        var regex3 = /([0-9.])+ kH\/s/g;

        var found1 = event.match(regex1);
        var found2 = event.match(regex2);
        var found3 = event.match(regex3);

        var power;

        if (found1) {
          power = parseInt(found1[0]);
        }

        if (found2) {
          power = parseInt(found2[0]);
        }

        if (found3) {
          power = parseInt(found3[0]) * 1000;
        }

        if (power) {
          connection.close(1000); // WebSocketConnection.CLOSE_REASON_NORMAL

          clearTimeout(timeout);

          callback(null, power);
        }
      }
    });
  });

  client.connect(uri);
}

function get_ws_uri_for_miner(internal_id, callback) {
  rancher.services.get(internal_id, function(err, message, body) {
    if (err && err.connect === true) {
      return callback(err);
    }

    var data;
    var container_id;

    try {
      data = JSON.parse(body);
      container_id = data.instanceIds[0];
    } catch (e) {
      return callback(e);
    }

    rancher.services.logs(container_id, function(err, message, body) {
      if (err && err.connect === true) {
        return callback(err);
      }

      var url = body.url + '?token=' + body.token;

      callback(null, url);
    });
  });
}

miner_model.findAll({})
  .then(function(miners) {
    console.log('found miners', miners.length);

    var calls = {};

    for (var i = 0, l = miners.length; i < l; i++) {
      var miner = miners[i];

      if (miner.status === 'started' && miner.deployed === '1') {
        console.log('getting stats for', miner.internal_id);

        calls[miner.id] = (function(_miner) {
          return function(callback) {
            console.log('got', _miner.id);

            // TODO: Retry
            get_ws_uri_for_miner(_miner.internal_id, function(err, res) {
              get_ws_data_for_uri(res, function(err, res) {
                if (err) return callback(err);

                var power = res;

                miner_model.update({
                    power: power,
                  }, {
                    where: {
                      id: _miner.id
                    }
                  })
                  .then(console.log)
                  .catch(console.error);

                setTimeout(function() {
                  callback(null, power);
                }, 100);
              });
            });
          };
        })(miner);
      }
    }

    console.time('get_all_ws_links');

    async.series(calls, function(err, results) {
      console.timeEnd('get_all_ws_links');

      _.each(results, function(power, miner) {
        console.log(power, miner);
      });
    });
  });
