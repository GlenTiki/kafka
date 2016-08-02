var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish',
                              group: 'multiconsumer',
                              maxBytes: 2000000
                            });

var topic = 'my-replicated-partitioned-topic';

consumer.tearUp(function() {
  // note there is no partition in the first object/param of this call
  consumer.poll({topic: topic}, poll);

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
      // console.log('message', message)
      commit();
    });

    // kafka.on('debug', console.log.bind(null, 'debug ' + consumer));

    kafka.on('error', function(error) {
      console.log('error for consumer: ' + consumer, 'code:', JSON.stringify(error));
    });
  }

  var msg = 0;

  setInterval(function() {
    console.log('trying to produce');
      consumer.produce({topic: topic}, [{key: 'peanut', value: 'butter'}, 'message ' + msg++], function(err, response) {
        // console.log('kafka response to produce:', response);
      });
    }, 5000);
});
