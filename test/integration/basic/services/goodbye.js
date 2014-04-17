'use strict';

module.exports = function() {

  var goodbye = function(req, res) {
    res.respond({say: 'pfo'});
  };

  return [{ match: { request: 'fallback' }, execute: goodbye }];
};

