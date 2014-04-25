'use strict';

var options = { zkroot: 'localhost:2181', namespace: 'canon', start: 'all' };
var mcb = require('microbial')(options);

var goodbye = function(req, res) {
  res.respond({say: 'pfo'});
};

mcb.run({group: 'goodbye', topicName: 'request'}, [{ match: { request: 'fallback' }, execute: goodbye }], function(err) {
  if (err) { console.log(err); }
  console.log('up and running');
});

