'use strict';

var options = { zkroot: 'localhost:2181', namespace: 'canon', start: 'all' };
var mcb = require('microbial')(options);


mcb.run([{group: 'canonicalProducer', topicName: 'response', responseChannel: true}], [], function(err) {
  if (err) { return console.log(err); }
  console.log('up and running');
  setInterval(function() {
    mcb.request({topicName: 'request'}, { request: 'mumble', greeting: 'hello' }, function(res) {
      console.log('response: ' + res);
    });
  }, 1000);
});





