/**
  * Testing kafkaesque script.
  *
  * this script has been created to test Kafkaesques implementation of the offset
  * commit and fetch api.
  * To test this I have created three kafka brokers in a local cluster.
  * I have then created a topic (my-replicated-partitioned-topic) which is replicated
  * X amount of times, and partitioned 3 times.
  * I then connect to any one of those kafka brokers DIRECTLY with 3 individual
  * consumers, all in the same group. each of these consumers consume a stream
  * of data within that partition, and after each piece of data in the topic is
  * consumed, they commit the offset of the most recently consumed to kafka.
  *
  * Every 10 seconds, consumer2 will go down or up, depending on its state.
  * While down, it loses its current offset within the partition.
  * When it comes back up, it fetches its current commited offset from kafka and
  * will consume any NEW messages it missed while it was down.
  *
  */

var kafkaesque = require('kafkaesque');

// create an object to cache the open consumers
var consumers = {};

// create three consumers.
for (var i = 0; i < 3; i ++) {
  createConsumer(i);
}

// function to which takes an index (number) and creates a consumer based on it
function createConsumer(i) {

  // create a consumer object and connect it to one of the members of the cluster
  // this can be the metadata broker. kafkaesque figures out topic/partition leaders
  // by itself.
  consumers['consumer' + i] = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish' + i,
                              group: 'multiconsumer-indiv',
                              maxBytes: 2000000
                            });

  // Tear up (open) the connection.
  consumers['consumer' + i].tearUp(function() {
    // poll the partition relevant to the consumer
    consumers['consumer' + i].poll({topic: 'my-replicated-partitioned-topic', partition: i}, function(err, kafka) {
      // handle messages... etc
      if (err) console.log('error', err);

      kafka.on('message', function(offset, message, commit) {
        console.log('received msg for consumer: ' + i + '.', 'offset: ' + offset + '.', message.value);
        commit();
      });

      kafka.on('debug', console.log.bind(null, 'debug for ' + i));

      kafka.on('error', function(error) {
        console.log('ks error ' + i, JSON.stringify(error));
      });
    });
  });
}

// here we invert consumer2 state every 10 seconds.
var up = true;
setInterval(function() {
  if (up) takeDown();
  else bringUp();
  up = !up;

  function takeDown() {
    console.log('consumer2 going down!');

    // tear the connection down
    consumers.consumer2.tearDown();
    // delete the cached object
    consumers.consumer2 = null;
  }

  function bringUp() {
    console.log('consumer2 going up!');

    createConsumer(2);
  }
}, 10000);
