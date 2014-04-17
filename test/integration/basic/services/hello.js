'use strict';

module.exports = function(init) {
  var _db = init.db;

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

  return [{ match: { request: 'say' }, execute: whatever},
          { match: { request: 'say', greeting: 'hello' }, execute: hello},
          { match: { request: 'mumble', greeting: 'hello' }, execute: delegate } ];
};

