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

var assert = require('chai').assert;
var mcb;

var options = { zkroot: 'localhost:2181', namespace: 'cfgtest', start: 'config' };


describe('config test', function() {

  beforeEach(function(done) {
    this.timeout(1000000);
    mcb = require('../../../lib/microbial')(options);
    mcb.setup(function(err) {
      assert(!err);
      done();
    });
  });



  afterEach(function(done) {
    mcb.tearDown();
    done();
  });



  it('should connect to zookeeper and set the config block', function(done){
    var config = mcb.blankConfig();
    mcb.addTopicToConfig(config, 'request', 'queue', 'request', 2, 'random');
    mcb.addTopicToConfig(config, 'response', 'queue', 'response', 1, 'direct');
    mcb.writeConfig(config, function(err) {
      assert(!err);
      done();
    });
  });



  it('should pull the config from zookeeper if it exists already', function(done){
    var config = mcb.getConfig();
    assert(config.topology.topics.length === 2);
    done();
  });



  it('should register and deregister for a topic correctly', function(done){
    this.timeout(1000000);
    debugger;
    mcb.register({group: 'wibble', topicName: 'request'}, function(err, slot) {
      assert(!err);
      mcb.deregister({group: 'wibble', topicName: 'request'}, slot, function(err) {
        assert(!err);
        done();
      });
    });
  });



  it('should update the offset position correctly', function(done){
    this.timeout(1000000);
    debugger;
    mcb.register({group: 'wibble', topicName: 'request'}, function(err, slot) {
      assert(!err);
      mcb.deregister({group: 'wibble', topicName: 'request'}, slot, function(err) {
        assert(!err);
        done();
      });
    });
  });



  /*
  it('should not register for a topic if all slots are taken', function(done){
    mcb.register({topicName: 'request'}, function(err, slot0) {
      assert(!err);
      assert(slot0 === 0);
      mcb.register({topicName: 'request'}, function(err, slot1) {
        assert(!err);
        assert(slot1 === 1);
        mcb.register({topicName: 'request'}, function(err, slot) {
          assert(err);
          assert(slot === -1);
          mcb.deregister({topicName: 'request'}, slot1, function(err) {
            assert(!err);
            mcb.deregister({topicName: 'request'}, slot0, function(err) {
              assert(!err);
              done();
            });
          });
        });
      });
    });
  });
  */
});

