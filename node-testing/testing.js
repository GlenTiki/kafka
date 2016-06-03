var kafkaesque = require('kafkaesque');

var consumers = {};

for (var i = 0; i < 3; i ++) {
  createConsumer(i);
}

function createConsumer(i) {
  consumers['consumer' + i] = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish',
                              group: 'cheese',
                              maxBytes: 2000000
                            });

  consumers['consumer' + i].tearUp(function() {
    consumers['consumer' + i].poll({topic: 'my-replicated-partitioned-topic', partition: i}, function(err, kafka) {
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

var up = true;
setInterval(function() {
  if (up) takeDown();
  else bringUp();
  up = !up;

  function takeDown() {
    console.log('consumer2 going down!')
    consumers.consumer2.tearDown();
    consumers.consumer2 = null;
  }

  function bringUp() {
    console.log('consumer2 going up!')
    createConsumer(2);
  }
}, 10000);
