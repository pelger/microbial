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


/**
 * microbial bus interface
 */
module.exports = function(options, receiverFn, requestFn, respondFn) {
  assert(options);
  var _options;
  var _bus;
  var _cbt;
  var _receiver;
  var _request;
  var _respond;


  /**
   * create a unique id for this request and place it onto the bus
   * create a matching entry in the callback table
   */
  var request = function(req, callback) {
    var id = uuid.v4();
    req.$id = id;
    _cbt[id] = { callback: callback, ts: (new Date()).getTime() };
    console.log('REQUEST: ' + JSON.stringify(req));
    _bus.request(req);
  };



  /**
   * place a response onto the bus, ensuring that the response has the correct id
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

      delete _cbt[req.response.$id];
      assert(cb);

      if (cb.callback) {
        cb.callback({ request: _request, respond: _respond, req: req, response: req.response });
      }
    }
    else {
      assert(false);
    }
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
    if (!_options.bus.topics) {
      _options.bus.topics = [{type: 'request', name: 'request'},
                             {type: 'response', name: uuid.v4()}];
    }
    _options.bus.callback = receive;
    _bus = require('../io/' + _options.bus.name + '/' + options.bus.name + '-driver')(_options);
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
    request: request,
    respond: respond,
    tearDown: tearDown
  };
};

