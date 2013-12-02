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
var postal = require('postal')();



/**
 * microbial postal.js driver
 */
module.exports = function(options) {
  assert(options && options.bus && options.bus.topics);

  var _options = options;
  var _channels = [];
  var _subscriptions = [];



  /**
   * place a request onto postal command channel
   */
  var request = function(req) {
    var reqChannel = _.find(_channels, function(channel) { return channel.topic.type === 'request'; });
    var resChannel = _.find(_channels, function(channel) { return channel.topic.type === 'response'; });
    reqChannel.channel.publish(JSON.stringify(_.omit(req, '$id')) , {request: req, $inf: {type: 'request', req: reqChannel, res: resChannel}});
  };



  /**
   * place a response onto a named postal response channel
   */
  var respond = function(req, res) {
    var resChannel = _.find(_channels, function(channel) { return channel.topic.name === req.$inf.res.topic.name; });
    resChannel.channel.publish(JSON.stringify(_.omit(req, '$id')), {response: res, $inf: {type: 'response', req: resChannel, res: null}});
  };



  /**
   * create subscriptions to named channels
   */
  var construct = function() {
    assert(options.bus.name === 'postal');
    _.each(_options.bus.topics, function(topic) {
      var channel = postal.channel(topic.name);
      var subscription = channel.subscribe('*', _options.bus.callback);
      _channels.push({topic: topic, channel: channel});
      _subscriptions.push({topic: topic, subscription: subscription});
    });
  };



  /**
   * tear down all subscriptions
   */
  var tearDown = function() {
    _.each(_subscriptions, function(subscription) {
      subscription.subscription.unsubscribe();
    });
  };


  construct();
  return {
    request: request,
    respond: respond,
    tearDown: tearDown
  };
};


