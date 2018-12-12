var routers = require('./../middleware').routers;

module.exports = function(app, router) {
  router.get('/', function(req, res, next) {
    res.status(200);
    res.send();
  });
};
