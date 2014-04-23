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
var recurse = require('./recursor');
var childProcess = require('child_process');



/**
 * utility for spawning microservices
 */
module.exports = function() {
  var _spawned = [];

  var recursively = function(path, cb) {
    recurse.recurse(path, /.*\.js/,
    function(filePath) {
      console.log('spawning: ' + 'node ' + filePath);
      var proc = childProcess.exec('node ' + filePath);
      _spawned.push(proc);
    },
    function() {
    },
    cb);
  };



  var kill = function() {
    _.each(_spawned, function(proc) {
      proc.kill('SIGHUP');
    });
  };



  return {
    recursively: recursively,
    kill: kill
  };
};


