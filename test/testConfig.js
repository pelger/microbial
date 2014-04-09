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

var options = { zkroot: 'localhost:2181', namespace: 'config', start: 'config' };

exports.setConfig = function(cb) {
  var mcb = require('../lib/microbial')(options);
  mcb.setup(function(err) {
    if (err) { return cb(err); }
    var config = mcb.blankConfig();

    mcb.addBrokerToConfig(config, 'localhost', 9092, 2000000);
    mcb.addTopicToConfig(config, 'request', 'queue', 'request', 2, 'random');
    mcb.addTopicToConfig(config, 'response', 'queue', 'response', 1, 'direct');
    mcb.writeConfig(config, function(err) {
      mcb.tearDown();
      cb(err, mcb);
    });
  });
};

