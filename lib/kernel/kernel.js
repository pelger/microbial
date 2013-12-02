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


/**
 * microbial kernel
 */
module.exports = function(options) {
  assert(options);

  var _options = options;
  var _bus;
  var _executor;



  /**
   * make a request by placing a command on the bus
   */
  var request = function(req, callback) {
    _bus.request(req, callback);
  };



  /**
   * respond to a request previously received from the bus
   */
  var respond = function(res) {
    _bus.respond(this.req, res);
  };



  /**
   * receive a request from the bus
   */
  var receive = function(req) {
    _executor.execute(req, { request: request, respond: respond, req: req });
  };



  /**
   * load microservices
   */
  var setup = function() {
    if (_options.nodeType === 'host' || _options.nodeType === 'both') {
      _executor.load(_options.services);
    }
  };



  /**
   * unload and unsubsribe from bus
   */
  var tearDown = function() {
    _executor.unload();
    _bus.tearDown();
  };



  /**
   * initialize the bus and executor
   */
  var construct = function() {
    _bus = require('./bus')(_options, receive, request, respond);
    _executor = require('./executor')();
  };


  construct();
  return {
    setup: setup,
    tearDown: tearDown,
    request: request,
    respond: respond
  };
};


