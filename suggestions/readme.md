# Don't specify partition when polling = poll all partitions for a topic

When starting a kafkaesque instance/consumer, the code is as follows:

```javascript
var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish' + i,
                              group: 'cheese',
                              maxBytes: 2000000
                            });

consumer.tearUp(function() {
  consumer.poll({topic: 'some-topic', partition: 0}, function(err, kafka) {
    if (err) console.log('error', err);

    kafka.on('message', function(offset, message, commit) {
      console.log('received msg for consumer.', 'offset: ' + offset + '.', message.value);
      commit();
    });

    kafka.on('debug', console.log.bind(null, 'debug: '));

    kafka.on('error', function(error) {
      console.log('error', JSON.stringify(error));
    });
  });
});
```

Notice how when calling `consumer.poll()`, we specify a partition. My suggestion
would be to allow users to NOT specify a partition, and kafkaesque will auto poll
all partition's in a specific topic.

Currently, if you wanted to poll several partitions in the same topic, you might
do it like so:

```javascript
var kafkaesque = require('kafkaesque');

var consumer = kafkaesque({
                              brokers: [
                                {host: 'localhost', port: 9093}
                              ],
                              clientId: 'fish' + i,
                              group: 'cheese',
                              maxBytes: 2000000
                            });

consumer.tearUp(function() {
  consumer.poll({topic: 'some-topic', partition: 0}, poll);
  consumer.poll({topic: 'some-topic', partition: 1}, poll);
  .
  .
  .
  consumer.poll({topic: 'some-topic', partition: N}, poll);

  function poll(err, kafka) {
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
```
