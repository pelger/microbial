'use strict';

var mcb = require('../../../../lib/microbial')({zkroot: 'localhost:2181', namespace: 'canon', start: 'all'});



var whatever = function(req, res) {
  res.respond({say: 'whatever'});
};



var hello = function(req, res) {
  res.respond({say: 'hello'});
};



var delegate = function(req, res) {
  res.request({ request: 'fallback'}, function(res2) {
    res.respond(res2.response);
  });
};



mcb.run({group: 'hello', topicName: 'request'}, [{ match: { request: 'say' }, execute: whatever},
                                                 { match: { request: 'say', greeting: 'hello' }, execute: hello},
                                                 { match: { request: 'mumble', greeting: 'hello' }, execute: delegate }], function(err) {
  console.log(err);
  console.log('up and running');
});

