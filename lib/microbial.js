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
 */
module.exports = function(options) {
  assert(options);

  var _options;
  var _kernel;


  /**
   * kernel forwarders
   */
  var request= function(req, callback) { _kernel.request(req, callback); };
  var respond = function() { _kernel.respond(); };
  var setup = function() { _kernel.setup(); };
  var tearDown = function() { _kernel.tearDown(); };



  /**
   * tear up the kernel
   */
  var construct = function() {
    // test if funciton or object 
    _options = options;
    _kernel = require('./kernel/kernel')(_options);
  };



  construct();
  return {
    setup: setup,
    tearDown: tearDown,
    request: request,
    respond: respond
  };
};

