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
  consumer.poll({topic: 'my-replicated-partitioned-topic'}, poll);

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
