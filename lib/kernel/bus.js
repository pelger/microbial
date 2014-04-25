/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var assert = require('assert');
var uuid = require('uuid');
var _ = require('underscore');


/**
 * microbial bus interface
 */
module.exports = function(options, receiverFn, requestFn, respondFn, zk) {
  assert(options);
  var _options;
  var _bus;
  var _cbt;
  var _receiver;
  var _request;
  var _respond;
  var _responseChannel;



  /**
   * register as a consumer on a topic / partition pair
   */
  var register = function(topic, slot, callback) {
    if (topic.responseChannel) {
      _responseChannel = topic;
      _responseChannel.slot = slot;
    }
    _bus.register(topic, slot, callback);
  };



  /**
   * create a unique id for this request and place it onto the bus
   * create a matching entry in the callback table
   */
  var request = function(topic, req, callback) {
    var id = uuid.v4();
    req.$id = id;
    _cbt[id] = { callback: callback, ts: (new Date()).getTime() };
    console.log('REQUEST: ' + JSON.stringify(req));
    _bus.request(topic, req, _responseChannel);
  };



  /**
   * place a response onto the bus, ensuring that the response has the correct id
   * put this into the correct topic and partition as identified in the request
   */
  var respond = function(req, res) {
    if (req.request && req.request.$id) {
      res.$id = req.request.$id;
    }
    console.log('RESPOND: ' + JSON.stringify(res));
    _bus.respond(req, res);
  };



  /**
   * receive a message from the bus, this will either be a direct command or a response
   * to a command placed by this process. If this is a direct command then call this processes
   * registered reciever function, if a response then lookup the associated callback execute
   * it and remove it from the lookup table
   */
  var receive = function(req) {
    console.log('RECEIVE: ' + JSON.stringify(req));

    if (req.$inf.type === 'request') {
      if (_receiver) {
        _receiver(req);
      }
    }
    else if (req.$inf.type === 'response') {
      var cb = _cbt[req.response.$id];

      if (cb) {
        delete _cbt[req.response.$id];
        if (cb.callback) {
          cb.callback({ request: _request, respond: _respond, req: req, response: req.response });
        }
      }
      else {
        // TODO: fix this...
        //console.log('WARNING: unknown handler, response message dropped');
      }
    }
    else {
      assert(false);
    }
  };



  /**
   * bus error handler
   */
  var error = function(err) {
    console.log('**********');
    console.log(err);
    console.log('**********');
  };



  /**
   * add default request channel for subsciption and create a unique id for this processes
   * response channel. Pass these to the bus for subscription.
   */
  var construct = function() {
    _options = options;
    _receiver = receiverFn;
    _request = requestFn;
    _respond = respondFn;
    _options.bus = {};
    _.each(_options.topology.topics, function(topic) {
      if (topic.name === '$uuid') {
        topic.name = uuid.v4();
      }
    });
    _options.bus.callback = receive;
    _options.bus.error = error;
    _bus = require('../io/' + _options.topology.bus + '/' + options.topology.bus + '-driver')(_options, zk);
    assert(_bus && _bus.request);
    _cbt = {};
  };



  /**
   * tear down the bus
   */
  var tearDown = function() {
    _bus.tearDown();
  };



  construct();
  return {
    register: register,
    request: request,
    respond: respond,
    error: error,
    tearDown: tearDown
  };
};

