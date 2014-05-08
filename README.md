# Microbial

## A Node.js micro services toolkit

Experimental! (ish)

## Running the samples
You will need to install Kafka and Zookeeper, follow these instruction: 


###hello sample
Firstly you will need to setup the sample configuration in zookeeper.

```
cd samples/hello/config
node config.js
```

You can view the Zookeeper config at any point:

```
node dumpConfig.js
```

You will also need to create the topics in Kafka. The samples use a 'request' and a 'response' topic each with three partitions. Go ahead and create these in Kafka.

####simpleProducer
The following will run the simple producer. This will post requests into the kafka request topic at the rate of one a second.

```
cd samples/hello/producer
node simpleproducer.js
```

The request topic has three partitions so messages will be distributed across these partitions.

To recieve and respond to messages run the hello client:

```
cd samples/hello/services
node hello.js
node hello.js
node hello.js
```

Run three copies to read messages from each of the three partitions.

