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
var Consumer = require('Prozess').Consumer;
var POLLING_INTERVAL = 10000;


/*
 * TODO: need to manage partition and offeset amongst consumers
 *       initially through config, eventually through zookeeper or similar
 */
/**
 * Kafka consumer
 */
module.exports = function(options) {
  assert(options);
  var _options = options;
  var _consumers = {};
  var _meta = require('./meta')(_options);



  /**
   * TODO: ensure long poll and immediate recall
   */
  var _poll = function(topicName, partition) {
    var consumer = _consumers[topicName + '_' + partition];
    consumer.consumer.consume(function(err, messages){
      var count = 0;
      _.each(messages, function(message) {
        _options.bus.callback(JSON.parse(message.payload.toString()));
        ++count;
      });
      _meta.incrementWatermark(topicName, partition, count, function(wmerr) {
        if (err) { _options.bus.error(err); }
        if (wmerr) { _options.bus.error(wmerr); }
        _poll(topicName, partition);
      });
    });
  };



  /**
   * partition and offset - from zookeeper or seaport or sys channel on bus ??
   */
  var construct = function() {
    _.each(_options.bus.topics, function(topic) {
      var offset = _meta.getWatermark(topic.name, topic.partition);
      var consumer = new Consumer({host : _options.bus.host, topic : topic.name, partition : topic.partition, offset : offset, polling: POLLING_INTERVAL});
      consumer.connect(function(err){
        if (err) { throw err; }
        _consumers[topic.name + '_' + topic.partition] = {topic: topic, partition: topic.partition, offset: offset, consumer: consumer};
        _poll(topic.name, topic.partition);
      });
    });
  };



  var tearDown = function() {
  };



  construct();
  return {
    tearDown: tearDown,
  };
};

