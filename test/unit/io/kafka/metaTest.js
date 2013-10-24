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

var assert  = require('chai').assert;
var fs = require('fs');
var options;
var metaPath;


describe('kafka meta data test', function(){

  beforeEach(function(done) {
    options = require('../../../../lib/defaults.kafka.json');
    metaPath = __dirname + '/meta.json';
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }
    done();
  });


  it('should start with a zero count', function(done){
    options.bus.meta = __dirname + '/meta.json';
    var meta = require('../../../../lib/io/kafka/meta')(options);
    assert(meta.getWatermark('request', 0) === 0);
    done();
  });


  it('should record counts correctly', function(done){
    options.bus.meta = __dirname + '/meta.json';
    var meta = require('../../../../lib/io/kafka/meta')(options);
    meta.setWatermark('request', 0, 10);
    assert(meta.getWatermark('request', 0) === 10);
    meta.incrementWatermark('request', 0, 5);
    assert(meta.getWatermark('request', 0) === 15);
    done();
  });


  it('should serialize counts correctly', function(done){
    options.bus.meta = __dirname + '/meta.json';
    var meta = require('../../../../lib/io/kafka/meta')(options);
    meta.setWatermark('request', 0, 10, function(err) {
      assert(!err);
      var metaTwo = require('../../../../lib/io/kafka/meta')(options);
      assert(metaTwo.getWatermark('request', 0) === 10);
      done();
    });
  });
});

