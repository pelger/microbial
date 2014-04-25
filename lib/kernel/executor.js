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
var _ = require('underscore');
var patrun = require('patrun');


/**
 * microbial executor
 */
module.exports = function() {
  var _pr = patrun();


  /**
   * load microservices from target list
   *
   * targets contains a list of the target code, a target is anything that can be required
   * and exports a JSON block of the following format:
   *
   * return [{ match: { request: 'say', word: 'hello' }, execute: hello},
   *         { match: { request: 'say', word: 'fek' }, execute: fek }];
   *
   * TODO: improve this - i.e. suport recursive paths /** /*.js ...
   * TODO: bing in seneca matching semantics - array search is poor...
   */
  var load = function(services) {
    assert(services);

    if (_.isArray(services)) {
      _.each(services, function(service) {
        _pr.add(service.match, service.execute);
      });
    }
    else {
      _pr.add(services.match, services.execute);
    }
  };



  /**
   * unload all registered services
   */
  var unload = function() {
    // TODO: _pr.removeAll
  };



  /**
   * execute a reigstered microservice
   */
  var execute = function(req, res) {
    assert(req && req.request && res);
    var fn = _pr.find(req.request);
    if (fn) {
      fn(req, res);
    }
  };



  return {
    load: load,
    unload: unload,
    execute: execute
  };
};


