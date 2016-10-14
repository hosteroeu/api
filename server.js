var http = require('http'),
  app = require('./app'),
  config = require('./config');

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port: ', app.get('port'));
});
