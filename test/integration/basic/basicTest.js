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


describe('basic test', function() {
  
  beforeEach(function(done) {
    var testBus = process.env.TEST_BUS ?  process.env.TEST_BUS : 'postal';
    //var testBus = process.env.TEST_BUS ?  process.env.TEST_BUS : 'axon';
    //var testBus = process.env.TEST_BUS ?  process.env.TEST_BUS : 'kafka';
    console.log('testing with: ' + testBus);
    var options = require('./options.test.js')(testBus);
    mcb = require('../../../lib/microbial')(options);
    mcb.setup();
    done();
  });


  afterEach(function(done) {
    mcb.tearDown();
    done();
  });


  it('should tearup a service and respond to a request', function(done){
    this.timeout(1000000);
    mcb.request({request: 'say'}, function(res) {
      assert(res.response.say === 'whatever');
      setTimeout(done, 2000);
    });
  });

  it('should pattern match correclty', function(done){
    var timer = setTimeout(function() {
      assert('failed no match found!!' === false);
    }, 1500);

    mcb.request({request: 'say'}, function(res) {
      assert(res.response.say === 'whatever');
      mcb.request({request: 'say', greeting: 'hello' }, function(res) {
        assert(res.response.say === 'hello');
        clearTimeout(timer);
        done();
      });
    });
  });


  it('should receive no response for an undefined command', function(done){
    setTimeout(function() {
      done();
    }, 1500);

    mcb.request({request: 'fish'}, function() {
      assert(false);
    });
  });


  it('should receive a pfo for mumbling by chaining calls between services', function(done){
    this.timeout(1000000);
    /*
    var timer = setTimeout(function() {
      assert('chain failed!!' === false);
    }, 1500);
    */

    mcb.request({request: 'mumble', greeting: 'hello'}, function(res) {
      assert(res.response.say === 'pfo');
     // clearTimeout(timer);
      done();
    });
  });
});


