var _ = require('underscore');
var config = require('./../../config');

var benchmark_model = require('./../../models').benchmark.model;

benchmark_model.findAll({})
  .then(function(b) {
    console.log(b.length);

    for(var i=0,l=b.length; i<l; i++) {
      var be = b[i];

      benchmark_model.update({
          cpu_model: be.cpu_model.replace(/\s+/g, " ")
        }, {
          where: {
            id: be.id
          }
        })
        .then(console.log)
        .catch(console.error);

      //break;
    }
  });
