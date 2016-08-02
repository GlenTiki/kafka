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
  //
  //
  var msg = 0;
  var produced = 0;
  var consumed = 0;

    // note there is no partition in the first object/param of this call
  consumer.poll({topic: topic}, poll);
  var i = 0;
  function poll(err, kafka) {
    var consumer = i++;
    console.log('*** in here ', consumer);

    if (err) console.log('error', err);


    kafka.on('message', function(offset, message, commit) {
      // console.log('received msg for consumer of partition: ' + consumer + '.', 'offset: ' + offset + '.', message.value);
      consumed++
      commit();
    });
    //
    // // kafka.on('debug', console.log.bind(null, 'debug ' + consumer));
    //
    // kafka.on('error', function(error) {
    //   console.log('error', JSON.stringify(error));
    // });
  }

  setInterval(function() {
    // console.log('trying to produce');
    console.log('consumed = ', consumed);
    console.log('produced = ', produced);
    consumed = 0
    produced = 0
  }, 1000);

  // produce()

  function produce() {
    // console.log('producing')
    consumer.produce({topic: topic}, ['message ' + msg], function() {})
    produced++

    if (msg++ % 88 === 0) setImmediate(produce)
    // else if (produced > 2000) setImmediate(produce)
    else produce()
  }
});
