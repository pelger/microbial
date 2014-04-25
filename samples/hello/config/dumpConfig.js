'use strict';

var options = { zkroot: 'localhost:2181', namespace: 'canon', start: 'config' };
var mcb = require('microbial')(options);

mcb.setup(function(err) {
  if (!err || (err && err.name && err.name === 'config_block_not_available')) {
    mcb.dumpConfig(function() {
    });
  }
  else {
    console.log(err);
  }
});


