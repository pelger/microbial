'use strict';

var mcb = require('../../../../lib/microbial')({zkroot: 'localhost:2181', namespace: 'canon', start: 'all'});



var goodbye = function(req, res) {
  res.respond({say: 'pfo'});
};



mcb.run({group: 'goodbye', topicName: 'request'}, [{ match: { request: 'fallback' }, execute: goodbye }], function(err) {
  console.log(err);
  console.log('up and running');
});

