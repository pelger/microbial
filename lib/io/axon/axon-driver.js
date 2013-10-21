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

var _ = require('underscore');
var assert = require('assert');
var axon = require('axon');



/**
 * microbial axon.js driver
 * uses axon req/rep sockets to send and recieve messages over the bus
 */
module.exports = function(options) {
  assert(options && options.bus && options.bus.topics);

  var _options = options;
  var _reqSocket;
  var _resSocket;
  var _cbt;



  /**
   * place a request onto axon
   */
  var request = function(req) {
    _reqSocket.send(JSON.stringify(_.omit(req, '$id')), JSON.stringify({request: req, $inf: {type: 'request'}}), function(res) {
      _options.bus.callback(JSON.parse(res.toString()));
    });
  };



  /**
   * place a response onto axon by calling the stored callback
   */
  var respond = function(req, res) {
    if (_options.nodeType === 'host' || _options.nodeType === 'both') {
      _cbt.fetch(res.$id)(JSON.stringify({response: res, $inf: {type: 'response'}}));
    }
  };



  /**
   * create subscriptions to named channels
   */
  var construct = function() {
    _cbt = require('../../util/cbt')();

    if (_options.nodeType === 'client' || _options.nodeType === 'both') {
      _reqSocket= axon.socket('req');
      _reqSocket.bind(3000);
    }

    if (_options.nodeType === 'host' || _options.nodeType === 'both') {
      _resSocket= axon.socket('rep');
      _resSocket.connect(3000);

      _resSocket.on('message', function(task, data, callback) {
        var req = JSON.parse(data.toString());
        _cbt.track(req.request.$id, callback);
        _options.bus.callback(req);
      });
    }
  };



  /**
   * tear down all subscriptions
   */
  var tearDown = function() {
    _resSocket.close();
    _reqSocket.closeServer();
  };


  construct();
  return {
    request: request,
    respond: respond,
    tearDown: tearDown
  };
};


