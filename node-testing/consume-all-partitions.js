/**
  * Testing kafkaesque script.
  *
  * this script has been created to test Kafkaesques ability to allow a single
  * consumer the ability to poll data from ALL partitions in a single instance
  * To test this I have created three kafka brokers in a local cluster.
  * I have then created a topic (my-replicated-partitioned-topic) which is replicated
  * X amount of times, and partitioned 3 times.
  * I then connect to any one of those kafka brokers DIRECTLY with a single
  * consumer. This consumer will then poll for data from ALL of the partitions
  * because by allowing the consumer to not specify a partition in the `.poll()`
  * function call, kafkaesque should automatically poll ALL partitions for that
  * topic.
  *
  */

var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish',
                              group: 'multiconsume',
                              maxBytes: 2000000
                            });

consumer.tearUp(function() {
  // note there is no partition in the first object/param of this call
  consumer.poll({topic: 'my-replicated-partitioned-topic'}, poll);

  // I expect poll to be called three times, where the kafka object is an EventEmitter
  // for a partition in the topic
  // poll should expect to be called for EVERY partition in a topic.
  var i = 0;
  function poll(err, kafka) {
    var consumer = i++;
    console.log('*** in here ', consumer);
    if (err) console.log('error', err);

    kafka.on('message', function(offset, message, commit) {
      console.log('received msg for consumer of partition: ' + consumer + '.', 'offset: ' + offset + '.', message.value);
      commit();
    });

    kafka.on('debug', console.log.bind(null, 'debug ' + consumer));

    kafka.on('error', function(error) {
      console.log('error', JSON.stringify(error));
    });
  }
});
