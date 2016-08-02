#!/usr/bin/env bash

# Start zookeeper
zkserver start &> $(dirname $0)/../zookeeper.log &

# Start kafka instances/nodes
JMX_PORT=9997 kafka-server-start $(dirname $0)/../config/broker1.properties &> $(dirname $0)/../broker1.log &
JMX_PORT=9998 kafka-server-start $(dirname $0)/../config/broker2.properties &> $(dirname $0)/../broker2.log &
JMX_PORT=9999 kafka-server-start $(dirname $0)/../config/broker3.properties &> $(dirname $0)/../broker3.log &
