'use strict';


/**
 * bus config
 */
var bus = {name: 'kafka',
           config: {brokers: [{host: 'localhost', port: 9092}],
                    clientId: 'fish',
                    maxBytes: 2000000}};


/**
 * web node 1
 */
module.exports = function() {

  var bus = {name: 'kafka',
             config: {brokers: [{host: 'localhost', port: 9092}],
                      clientId: 'fish',
                      maxBytes: 2000000}};

  return {
    nodeType: 'client',
    bus: bus,
    topics: [{type: 'request', name: 'request', partition: 0},
             {type: 'response', name: 'response', partition: 0}]
  };
};



/**
 * web node 2
 */
module.exports = function() {

  var bus = {name: 'kafka',
             config: {brokers: [{host: 'localhost', port: 9092}],
                      clientId: 'fish',
                      maxBytes: 2000000}};

  return {
    nodeType: 'client',
    bus: bus,
    topics: [{type: 'request', name: 'request', partition: 1},
             {type: 'response', name: 'response', partition: 1}]
  };
};


/**
 * service node 1
 */
module.exports = function() {
  return {
    nodeType: 'host',
    bus: bus,
    services: [{path: __dirname + '/hello', init: {} },
               {path: __dirname + '/goodbye', init: {}}],
    topics: [{type: 'request', name: 'request', partition: 1}]
  };
};

