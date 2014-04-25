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
var spawner = require('./util/spawn')();


/**
 * microbial interface
 * options = { zkroot: 'localhost:2181', namespace: 'config', start: 'all' | 'config' };
 */
module.exports = function(options) {
  assert(options);

  var _options;
  var _kernel;
  var _cfg;
  var _setupDone = false;
  var _topics = [];
  var _slots = [];



  /**
   * setup and teardown
   */
  var setup = function(cb) {
    _cfg.setup(function(err) {
      if (!_options.start || _options.start === 'all') {
        _kernel = require('./kernel/kernel')(_cfg.get(), _cfg);
      }
      _setupDone = true;
      cb(err);
    });
  };



  var deregAll = function(index, topics, slots, cb) {
    _cfg.deregister(topics[index].group, topics[index].topicName, slots[index], function() {
      if (index < topics.length - 1) {
        deregAll(index + 1, topics, slots, cb);
      }
      else {
        cb();
      }
    });
  };



  var tearDown = function(cb) {
    if (_topics.length > 0) {
      deregAll(0, _topics, _slots, function() {
        _cfg.tearDown();
        if (_options.start === 'all') {
          _kernel.tearDown();
        }
        if (cb) { cb(); }
      });
    }
    else {
      _cfg.tearDown();
      if (cb) { cb(); }
    }
  };



  var registerTopics = function(index, topics, cb) {
    register(topics[index], function(err, slot) {
      if (err) { return cb(err); }
      _topics.push(topics[index]);
      _slots.push(slot);
      if (index < topics.length - 1) {
        registerTopics(index + 1, topics, cb);
      }
      else {
        cb();
      }
    });
  };



  var engage = function(topics, services, cb) {
    if (!_.isArray(topics)) {
      topics = [topics];
    }

    registerTopics(0, topics, function() {
      load(services);
      cb(null);
    });
  };



  var run = function(topics, services, cb) {
    if (!_setupDone) {
      setup(function(err) {
        if (err) { return cb(err); }
        engage(topics, services, cb);
      });
    }
    else {
      engage(topics, services, cb);
    }
  };



  /**
   * kernel forwarders
   */
  var request = function(topic, req, callback) {
    if (!_setupDone) {
      setup(function(err) {
        if (err) { return callback(err); }
        _kernel.request(topic, req, callback);
      });
    }
    else {
      _kernel.request(topic, req, callback);
    }
  };



  /**
   * config forwarders
   */
  var blankConfig = function() { return _cfg.blankConfig(); };
  var addTopicToConfig = function(config, name, semantics, partitionCount, produceAlgorithm) { _cfg.addTopic(config, name, semantics, partitionCount, produceAlgorithm); };
  var addBrokerToConfig = function(config, hostname, port, maxBytes) { _cfg.addBroker(config, hostname, port, maxBytes); };
  var getConfig = function() { return _cfg.get(); };
  var writeConfig = function(config, cb) { _cfg.write(config, cb); };



  /**
   * register as a consumer against a topic / partition channel
   */
  var register = function(topic, cb) {
    _cfg.register(topic.group, topic.topicName, function(err, slot){
      if (!_options.start || _options.start === 'all') {
        _kernel.register(topic, slot, function() {
          cb(err, slot);
        });
      }
      else {
        cb(err, slot);
      }
    });
  };



  var deregister = function(topic, slot, cb) {
    _cfg.deregister(topic.group, topic.topicName, slot, function() {
      cb();
    });
  };




  var deregisterAll = function(group, topicName, cb) {
    _cfg.deregisterAll(group, topicName, cb);
  };



  var load = function(servicePaths) {
    _kernel.load(servicePaths);
  };



  /**
   * create
   */
  var construct = function(options) {
    _options = options;
    _cfg = require('./config/config')(_options);
  };



  var spawn = function(path, cb) {
    spawner.recursively(path, cb);
  };



  var kill = function() {
    spawner.kill();
  };



  var dumpConfig = function() {
    _cfg.dump();
  };



  process.on('exit', tearDown.bind());
  process.on('SIGINT', function() {
    tearDown(function() {
      process.exit(0);
    });
  });



  construct(options);
  return {
    run: run,
    request: request,
    spawn: spawn,
    kill: kill,

    setup: setup,
    tearDown: tearDown,

    blankConfig: blankConfig,
    addTopicToConfig: addTopicToConfig,
    addBrokerToConfig: addBrokerToConfig,
    getConfig: getConfig,
    writeConfig: writeConfig,
    deregisterAll: deregisterAll,
    register: register,
    deregister: deregister,

    dumpConfig: dumpConfig
  };
};

