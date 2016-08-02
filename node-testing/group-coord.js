var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9095}
                              ],
                              clientId: 'fish',
                              group: 'multiconsumers',
                              maxBytes: 2000000
                            });

consumer.tearUp(function() {
  // consumer.subscribe({topic: 'my-replicated-partitioned-topic'}, sub);
  var i = 0;
  function sub(err, kafka) {
    var consumer = i++;
    console.log('*** in here ', consumer);
    if (err) console.log('error', err);

    kafka.on('message', function(offset, message, commit) {
      // console.log(message)
      console.log('received msg for consumer of partition: ' + consumer + '.', 'offset: ' + offset + '.', message.value);
      commit();
    });

    // kafka.on('debug', console.log.bind(null, 'debug ' + consumer));

    kafka.on('error', function(error) {
      console.log('error', JSON.stringify(error));
    });
  }
});
