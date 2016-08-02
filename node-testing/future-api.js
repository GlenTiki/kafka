var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9095}
                              ],
                              // clientId: 'fishy'
                              group: 'new-group',
                              // maxBytes: 2000000
                            });

var topic = 'my-replicated-partitioned-topic'
var partition = 0

// should all be valid
// consumer.produce({topic: topic, partition: partition}, ['message form 1'], function() {})
// consumer.produce({topic: topic}, 'message form 2', function() {})
// consumer.produce(topic, 'message form 3', function() {})


// get a specific event emitter for each of thesee
// consumer.poll({topic: topic, partition: partition}, poll);
// consumer.poll({topic: topic, offset: 0}, poll);
// consumer.poll({topic: topic, partition: partition, offset: 0}, poll);
// consumer.poll({topic: topic}, poll);
// consumer.poll(topic, poll);

// partition is an event emitter which is called PER partition related to the
// topic which was passed into poll
var x = 0;
function poll(err, partition) {
  var consumer = x++;
  if (err) console.log('error', err);

  partition.on('message', function(message, commit) {
    // console.log('old style bb:', message.value)
    // console.log('received msg for consumer of partition: ' + consumer + '.', 'offset: ' + offset + '.', message.value);
    commit();
  });

  // partition.on('debug', console.log.bind(null, 'debug ' + consumer));

  partition.on('error', function(error) {
    console.log('error', JSON.stringify(error));
  });
}
var subbed = true;
// this connects to the group and uses group management semeantics for balancing
// partitions, etc.
consumer.subscribe('my-replicated-partitioned-topic');
consumer.connect(function(err, kafka) {
  if (err) return console.log('ERROR CONNECTING:', err)

  //subscribe only gets events from commited offset
  // consumer.subscribe('my-replicated-partitioned-topic');
  // // consumer.subscribe('my-replicated-partitioned-topic-2');
  // // consumer.unsubscribe('my-replicated-partitioned-topic-2');

  kafka.on('message', function(message, commit) {
    // console.log(message)
    console.log('received msg:', message.value);
    commit();
  });

  kafka.on('electedLeader', function () {
    console.log('now the leader')
  })

  kafka.on('rebalance.start', function () {
    console.log('rebalance started!')
  });

  kafka.on('rebalance.end', function () {
    console.log('rebalance ended!')
  });

  kafka.on('error', function (err) {
    console.log('error causing disconnect', err)
    consumer.disconnect() // <--- DISCONNECT FROM ENTIRE CLUSTER
  });

  kafka.on('debug', function (info) {
    // console.log('debug:', info)
  });

  // called on cluster connection
  kafka.on('connect', function () {
    console.log('connected!')
  });

  i = 0;
  setInterval(function () {
    if (subbed) {
      // consumer.unsubscribe('my-replicated-partitioned-topic');
    } else {
      // consumer.subscribe('my-replicated-partitioned-topic');
    }
    subbed = !subbed;
    consumer.produce(topic, 'message' + i++)
  }, 5000)
});
