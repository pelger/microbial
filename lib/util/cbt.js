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


/**
 * callback table
 */
module.exports = function() {
  var _table;



  /**
   * track callback by id
   */
  var track = function(id, cb) {
    _table[id] = { callback: cb, ts: (new Date()).getTime() };
  };



  /**
   * return and remove the callback
   */
  var fetch = function(id) {
    var cb = _table[id];
    delete _table[id];
    return cb.callback;
  };



  /**
   * purge entries older than ts 
   */
  var purge = function(/*ts*/) {
  };



  var construct = function() {
    _table = {};
  };



  construct();
  return {
    track: track,
    fetch: fetch,
    purge: purge
  };
};

