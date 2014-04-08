'use strict';

var uuid = require('uuid');

module.exports = function(env) {

  var configs = {
    postal: {
      nodeType: 'both',
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
      nodeType: 'both',
      bus: {
        name: 'kafka',
        config: {brokers: [{host: 'localhost', port: 9092}],
                                               clientId: 'fish',
                                               maxBytes: 2000000},
        topics: [{type: 'request', name: 'request', partition: 0},
                 {type: 'response', name: 'response', partition: 0}]
      },
      services: [
        {path: __dirname + '/hello', init: {} },
        {path: __dirname + '/goodbye', init: {} }
      ]
    },
    axon: {
      nodeType: 'both',
      bus: {
        name: 'axon',
        topics: [{type: 'request', name: 'request'},
                 {type: 'response', name: 'response'}]
      },
      services: [
        {path: __dirname + '/hello', init: {} },
        {path: __dirname + '/goodbye', init: {} }
      ]
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

