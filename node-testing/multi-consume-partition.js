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
  consumer.poll({topic: 'my-replicated-partitioned-topic', partition: 0}, poll);
  consumer.poll({topic: 'my-replicated-partitioned-topic', partition: 1}, poll);
  consumer.poll({topic: 'my-replicated-partitioned-topic', partition: 2}, poll);
  
  var i = 0;
  function poll(err, kafka) {
    console.log('*** in here ', i++);
    if (err) console.log('error', err);

    kafka.on('message', function(offset, message, commit) {
      console.log('received msg for consumer.', 'offset: ' + offset + '.', message.value);
      commit();
    });

    kafka.on('debug', console.log.bind(null, 'debug: '));

    kafka.on('error', function(error) {
      console.log('error', JSON.stringify(error));
    });
  }
});
