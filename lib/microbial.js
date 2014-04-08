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
 *
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
        _kernel.setup();
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
  var request= function(req, callback) { _kernel.request(req, callback); };
  var respond = function() { _kernel.respond(); };



  /**
   * config forwarders
   */
  var blankConfig = function() { return _cfg.blankConfig(); };
  var addTopicToConfig = function(config, name, semantics, group, partitionCount, produceAlgorithm) { _cfg.addTopic(config, name, semantics, group, partitionCount, produceAlgorithm); };
  var addServiceToConfig = function(config, path, init) { _cfg.addService(config, path, init); };

  var getConfig = function() { return _cfg.get(); };
  var writeConfig = function(config, cb) { _cfg.write(config, cb); };
  var register = function(topicName, cb) { _cfg.register(topicName, cb); };
  var deregister = function(topicName, slot, cb) { _cfg.deregister(topicName, slot, cb); };



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
    respond: respond,
    blankConfig: blankConfig,
    addTopicToConfig: addTopicToConfig,
    addServiceToConfig: addServiceToConfig,
    getConfig: getConfig,
    writeConfig: writeConfig,
    register: register,
    deregister: deregister
  };
};

