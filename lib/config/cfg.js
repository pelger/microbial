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
 * config creator
 * creates configuration blocks
 */
module.exports = function() {

  /**
   * create a configuration 
   * zkHosts - list of zookeeper hosts [{'host': 'localhost', 'port': 9092}..
   */
  var blank = function(zkHosts) {
    return {
      'topology': {
        'bus': 'kafka',
        'roots': zkHosts,
        'topics': []
      },
      'services': [
      ]
    };
  };



  /**
   * add a topic to an existing config
   * semantics = queue | pubsub
   * produceAlgorithm = roundRobin | random | direct
   */
  var addTopic = function(config, name, semantics, group, partitionCount, produceAlgorithm) {
    config.topology.topics.push({
      'name': name,
      'semantics': semantics,
      'group': group,
      'partitions': partitionCount,
      'produce': produceAlgorithm,
    });
  };



  /**
   * add service pattern to the config, microbial will load services based on these patterns
   */
  var addService = function(config, path, init) {
    config.services.push({'path': path, 'init': init});
  };



  return {
    blank: blank,
    addTopic: addTopic,
    addService: addService
  };
};

