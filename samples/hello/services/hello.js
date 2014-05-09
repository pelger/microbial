'use strict';

var options = { zkroot: 'localhost:2181', namespace: 'canon', start: 'all', ensureTeardown: true };
var mcb = require('../../../')(options);



var whatever = function(req, res) {
  console.log('whatever');
  res.respond({say: 'whatever'});
};



var hello = function(req, res) {
  console.log('hello');
  res.respond({say: 'hello'});
};



var delegate = function(req, res) {
  console.log('mumble');
  res.request({topicName: 'request'}, {request: 'fallback'}, function(res2) {
    res.respond(res2.response);
  });
};



mcb.run([{group: 'hello', topicName: 'request'},
         {group: 'hello', topicName: 'response', responseChannel: true}],
           [{ match: { request: 'say' }, execute: whatever},
            { match: { request: 'say', greeting: 'hello' }, execute: hello},
            { match: { request: 'mumble', greeting: 'hello' }, execute: delegate }],
            function(err) {
  if (err) { return console.log(err); }
  console.log('up and running');
});

