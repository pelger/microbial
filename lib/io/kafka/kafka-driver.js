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


/**
 * microbial kafka.js driver
 */
module.exports = function(options) {
  assert(options && options.bus && options.bus.topics);

  var _options = options;
  var _request;
  //var _receiver;
  var _response;
  var _sender;
  var _responseListener;
  var _requestListener;



  /**
   * place a request onto kafka
   */
  var request = function(req) {
    debugger;
    _sender.produce({topic: _request.name, partition: _request.partition},
                    JSON.stringify({request: req, $inf: {type: 'request', respondTo: { topic: _response.name, partition: _response.partition}}}),
                    function(err/*, response*/) {
      if (err) { _options.bus.error(err); }
    });
  };



  /**
   * place a response onto kafka
   */
  var respond = function(req, res) {
    debugger;
    _sender.produce({topic: req.$inf.respondTo.topic, partition: req.$inf.respondTo.partition}, JSON.stringify({response: res, $inf: {type: 'response'}}), function(err/*, response*/) {
      if (err) { _options.bus.error(err); }
    });
  };



  /**
   * Poll kafka for message and responses
   *
   * node type
   */
  var construct = function() {
    _options = options;
    _request = _.find(_options.bus.topics, function(topic) { return topic.type === 'request'; });
    _response = _.find(_options.bus.topics, function(topic) { return topic.type === 'response'; });

    if (_options.nodeType === 'client' || _options.nodeType === 'both') {
      _responseListener = require('kafkaesque')(_options.bus.config);
      _responseListener.tearUp(function() {
        _responseListener.poll({topic: _response.name, partition: _response.partition}, function(err, kafka) {
          if (err) { _options.bus.error(err); return; }

          kafka.on('message', function(message, commit) {
            debugger;
            _options.bus.callback(JSON.parse(message.value));
            commit();
          });

          kafka.on('error', function(error) {
            _options.bus.error(error);
          });
        });
      });
    }
    if (_options.nodeType === 'host' || _options.nodeType === 'both') {
      _requestListener = require('kafkaesque')(_options.bus.config);
      _requestListener.tearUp(function() {
        _requestListener.poll({topic: _request.name, partition: _request.partition}, function(err, kafka) {
          if (err) { _options.bus.error(err); return; }

          kafka.on('message', function(message, commit) {
            debugger;
            _options.bus.callback(JSON.parse(message.value));
            commit();
          });

          kafka.on('error', function(error) {
            _options.bus.error(error);
          });
        });
      });
    }
    _sender = require('kafkaesque')(_options.bus.config);
    _sender.tearUp(function() {});
  };



  /**
   * tear down all subscriptions
   */
  var tearDown = function() {
    _sender.tearDown();
    if (_responseListener) { _responseListener.tearDown(); }
    if (_requestListener) { _requestListener.tearDown(); }
  };



  construct();
  return {
    request: request,
    respond: respond,
    tearDown: tearDown
  };
};


