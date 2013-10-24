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

var fs = require('fs');
var assert = require('assert');



/**
 * store kafka offsets for each topic and partition handled by this node
 */
module.exports = function(options) {
  assert(options);
  var _options = options;
  var _meta;


  var _flush = function(cb) {
    fs.writeFile(_options.bus.meta, JSON.stringify(_meta), 'utf8', function(err) {
      if (cb) {
        cb(err);
      }
    });
  };



  var setWatermark = function(topic, partition, offset, cb) {
    if (!_meta[topic]) {
      _meta[topic] = {};
    }
    _meta[topic]['' + partition] = { offset: offset };
    _flush(cb);
  };



  var incrementWatermark = function(topic, partition, increment, cb) {
    if (!_meta[topic]) {
      _meta[topic] = {};
    }
    if (!_meta[topic]['' + partition]) {
      _meta[topic]['' + partition] = {offset: 0};
    }
    _meta[topic]['' + partition].offset = _meta[topic]['' + partition].offset + increment;
    _flush(cb);
  };



  var getWatermark = function(topic, partition) {
    return _meta[topic] && _meta[topic]['' + partition] ? _meta[topic]['' + partition].offset : 0;
  };



  var construct = function() {
    if (fs.existsSync(_options.bus.meta)) {
      var data = fs.readFileSync(_options.bus.meta, 'utf8');
      _meta = JSON.parse(data);
    }
    else {
      _meta = {};
    }
  };


  var tearDown = function() {
  };


  construct();
  return {
    tearDown: tearDown,
    getWatermark: getWatermark,
    setWatermark: setWatermark,
    incrementWatermark: incrementWatermark
  };
};

