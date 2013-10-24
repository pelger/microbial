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
var Producer = require('Prozess').Producer;



/**
 * Kafka producer
 */
module.exports = function(options) {
  assert(options);
  var _options = options;
  var _producers = {};



  var send = function(req, topicType) {
    var channel = _.find(_producers, function(producer) {
      return producer.topic.type === topicType;
    });
    var payload = { $inf: channel.topic };
    payload[topicType] = req;
    channel.producer.send(JSON.stringify(payload), function(err) {
      if (err) { _errorHandler(err); }
    });
  };



  var _errorHandler = function(err){
    console.log('Kafka producer error: ', err);
  };



  var construct = function() {
    _.each(_options.bus.topics, function(topic) {
      var producer= new Producer(topic.name, {host : _options.bus.host });
      producer.connect();
      producer.on('error', _errorHandler);
      producer.on('brokerReconnectError', _errorHandler);
      _producers[topic.name] = {topic: topic, producer: producer};
    });
  };



  var tearDown = function() {
  };



  construct();
  return {
    tearDown: tearDown,
    send: send
  };
};


