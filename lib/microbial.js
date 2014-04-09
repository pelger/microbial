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
 * microbial interface
 * options = { zkroot: 'localhost:2181', namespace: 'config', start: 'all' | 'config' };
 */
module.exports = function(options) {
  assert(options);

  var _options;
  var _kernel;
  var _cfg;



  /**
   * setup and teardown
   */
  var setup = function(cb) {
    _cfg.setup(function(err) {
      if (!_options.start || _options.start === 'all') {
        _kernel = require('./kernel/kernel')(_cfg.get());
      }
      cb(err);
    });
  };



  var tearDown = function() {
    if (_options.start === 'all') {
      _kernel.tearDown();
    }
    _cfg.tearDown();
  };



  /**
   * kernel forwarders
   */
  var request= function(topic, req, callback) { _kernel.request(topic, req, callback); };
  //var respond = function() { _kernel.respond(); };



  /**
   * config forwarders
   */
  var blankConfig = function() { return _cfg.blankConfig(); };
  var addTopicToConfig = function(config, name, semantics, group, partitionCount, produceAlgorithm) { _cfg.addTopic(config, name, semantics, group, partitionCount, produceAlgorithm); };
  var addBrokerToConfig = function(config, hostname, port, maxBytes) { _cfg.addBroker(config, hostname, port, maxBytes); };

  var getConfig = function() { return _cfg.get(); };
  var writeConfig = function(config, cb) { _cfg.write(config, cb); };



  /**
   * register as a consumer against a topic / partition channel
   */
  var register = function(topic, cb) {
    _cfg.register(topic.topicName, function(err, slot){
      _kernel.register(topic, slot, function() {
        cb(err, slot);
      });
    });
  };



  var deregisterAll = function(topicName, cb) {
    _cfg.deregisterAll(topicName, cb);
  };



  var load = function(servicePaths) {
    _kernel.load(servicePaths);
  };



  var deregister = function(topicName, slot, cb) {
    _cfg.deregister(topicName, slot, cb);
  };



  /**
   * create
   */
  var construct = function(options) {
    _options = options;
    _cfg = require('./config/config')(_options);
  };



  construct(options);
  return {
    setup: setup,
    tearDown: tearDown,
    request: request,
    //respond: respond,
    blankConfig: blankConfig,
    addTopicToConfig: addTopicToConfig,
    addBrokerToConfig: addBrokerToConfig,
    getConfig: getConfig,
    writeConfig: writeConfig,
    load: load,
    register: register,
    deregisterAll: deregisterAll,
    deregister: deregister
  };
};

