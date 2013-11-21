'use strict';

var uuid = require('uuid');

module.exports = function(env) {

  var configs = {
    postal: {
      nodeType: 'host',
      bus: {
        name: 'postal',
        topics: [{type: 'request', name: 'request'},
                 {type: 'response', name: uuid.v4()}]
      },
      services: [
        {path: __dirname + '/hello', init: {} },
        {path: __dirname + '/goodbye', init: {} }
      ]
    },
    kafka: {
    },
    axon: {
    },
    zeromq: {
    }
  };

  if (env && configs[env]) {
    return configs[env];
  }
  else {
    return configs.postal;
  }
};

