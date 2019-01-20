var WebSocketClient = require('websocket').client;
var _ = require('underscore');
var async = require('async');

var rancher = require('./../../services').Rancher();
var config = require('./../../config');
var miner_model = require('./../../models').miner.model;

var start = process.env.START || 0;
var end = process.env.END || null;

function find_power(data) {
  var regex1 = /([0-9.])+ hashes\/s/g; // webdollar
  var regex2 = /([0-9.])+ H\/s/g; // nerva, webchain
  var regex3 = /([0-9.])+ kH\/s/g; // nerva
  var regex4 = /([0-9.])+ MH\/s/g; // veruscoin

  var found1 = data.match(regex1);
  var found2 = data.match(regex2);
  var found3 = data.match(regex3);
  var found4 = data.match(regex4);

  var power = 0;

  if (found1) {
    power = parseFloat(found1[0]);
  } else if (found2) {
    power = parseFloat(found2[0]);
  } else if (found3) {
    power = parseFloat(found3[0]) * 1000;
  } else if (found4) {
    power = parseFloat(found4[0]) * 1000 * 1000;
  }

  return power;
}

function find_block(data) {
  // TODO: Find better way
  var regex1 = /  \d{6}/g; // webdollar
  var regex2 = /  \d{6}/g; // webdollar
  var regex3 = /  \d{6}/g; // webdollar

  var found1 = data.match(regex1);
  var found2 = data.match(regex2);
  var found3 = data.match(regex3);

  var block = 0;

  if (found1) {
    block = parseInt(found1[0]);
  } else if (found2) {
    block = parseInt(found2[0]);
  } else if (found3) {
    block = parseInt(found3[0]);
  }

  return block;
}

function get_ws_data_for_uri(uri, callback) {
  var client = new WebSocketClient();
  var timeout;
  var power = 0;
  var block = 0;
  var closed = false;

  client.on('connectFailed', function(error) {
    console.error('Connect Error: ', error.toString());

    clearTimeout(timeout);

    callback(error.toString());
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    // Do not wait more than 10 seconds
    timeout = setTimeout(function() {
      connection.close(1000); // WebSocketConnection.CLOSE_REASON_NORMAL

      callback(null, {
        power: power,
        block: block
      });
    }, 10 * 1000);

    connection.on('error', function(error) {
      console.error('Connection Error: ', error.toString());
    });

    connection.on('close', function() {
      console.log('Connection Closed');
    });

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        power = power || find_power(message.utf8Data);
        block = block || find_block(message.utf8Data);

        if (power && block && !closed) {
          closed = true;
          connection.close(1000); // WebSocketConnection.CLOSE_REASON_NORMAL

          clearTimeout(timeout);

          callback(null, {
            power: power,
            block: block
          });
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

    if (!end || end > miners.length) {
      end = miners.length;
    }

    if (start >= end) {
      console.error('Range overflows', start, end);
      return;
    }

    for (var i = start; i < end; i++) {
      var miner = miners[i];

      if (miner.status === 'started' && miner.deployed === '1') {
        console.log('getting stats for', miner.internal_id);

        calls[miner.id] = (function(_miner, _i) {
          return function(callback) {
            console.log('got', _miner.id, 'index', _i);

            // TODO: Retry
            get_ws_uri_for_miner(_miner.internal_id, function(err, res) {
              get_ws_data_for_uri(res, function(err, res) {
                if (err) return callback(err);

                var power = res.power;
                var block = res.block;

                // Miner has went to 0 power
                if (_miner.power > 0 && power === 0) {
                  // TODO: Send mail to user
                }

                miner_model.update({
                    power: power,
                    block: block
                  }, {
                    where: {
                      id: _miner.id
                    }
                  })
                  .then(console.log)
                  .catch(console.error);

                setTimeout(function() {
                  callback(null, {
                    power: power,
                    block: block
                  });
                }, 200);
              });
            });
          };
        })(miner, i);
      }
    }

    console.time('get_all_ws_links');

    async.series(calls, function(err, results) {
      console.timeEnd('get_all_ws_links');
    });
  });
