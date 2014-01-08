---
layout: post
category: 分布式
description: 本文介绍了分布式协调系统ZooKeeper的客户端初始化过程。详细介绍了ZooKeeper的EventThread是如何工作的
keywords: 分布式,ZooKeeper,ZooKeeper源代码,ZooKeeperEventThread,ClientCnxn,EventThread,SendThread
title: ZooKeeper源代码解读之EventThread
tags: [分布式,ZooKeeper,ZooKeeper源代码]
summary: ZooKeeper源代码解读之EventThread
---

本文承接自上一篇[ClientCnxn](http://www.hiyangqi.com/%E5%88%86%E5%B8%83%E5%BC%8F/read-zookeeper-source-code-client-cnxn.html)

###EventThread
EventThread用于处理ZooKeeper中的事件。

它同样继承了Thread。

###构造函数
构造函数的过程只有三步：

 			super(makeThreadName("-EventThread"));
            setUncaughtExceptionHandler(uncaughtExceptionHandler);
            setDaemon(true);
            
1.	设置线程名称
2.	通过`Thead.setUncaughtExceptionHandler`设置UncaughtExceptionHandler，如果不这样做的话，线程内的错误是无法被外部捕获的。接口UncaughtExceptionHandler定义了uncaughtException方法，用于响应的异常处理。
3.	设置为守护进程


###启动
EventThread有用来存放等待处理的事件的LinkedBlockingQueue以及三个volatile的状态变量，

1.	isRunning
2.	wasKilled
3.	使用KeeperState表示的sessionState

run()方法如下：
 
          try {
              isRunning = true;
              while (true) {
                 Object event = waitingEvents.take();
                 if (event == eventOfDeath) {
                    wasKilled = true;
                 } else {
                    processEvent(event);
                 }
                 if (wasKilled)
                    synchronized (waitingEvents) {
                       if (waitingEvents.isEmpty()) {
                          isRunning = false;
                          break;
                       }
                    }
              }
           } catch (InterruptedException e) {
              LOG.error("Event thread exiting due to interruption", e);
           }

            LOG.info("EventThread shut down");

具体步骤如下：

1.	将isRunning状态置为true 
2.	进入无限循环。如果返回的为EventOfDeath，则将wasKilled置为true。然后等待waitingEvents列表变空后，线程退出。
3.	如果上一步返回的为需要处理的事件，则调用processEvent方法处理事件。

####processEvent方法
#####WatcherSetEventPair
判断event是否为WatcherSetEventPair类型的实例。  

WatcherSetEventPair为一个事件，对应一个Watcher的集合。

   private static class WatcherSetEventPair {
        private final Set<Watcher> watchers;
        private final WatchedEvent event;

        public WatcherSetEventPair(Set<Watcher> watchers, WatchedEvent event) {
            this.watchers = watchers;
            this.event = event;
        }
    }
   
如果event为WatcherSetEventPair的实例，那么则调用对应的Watcher集合，让每个Watcher来处理对应的事件。

#####非WatcherSetEventPair
将Event转成Packet	

	Packet p = (Packet) event;
	
Packet封装了各个需要用的数据，比如ZNode路径,callback等。

根据返回的Packet的响应类型的不同，会调用不同的Callback。

1.	如果响应类型为ExistsResponse\SetDataResponse\SetACLResponse,则调用StatCallback
2.	如果响应类型为GetDataResponse,则调用DataCallback
3.	如果响应类型为GetACLResponse,则调用ACLCallback
4.	如果响应类型为GetChildrenResponse,则调用ChildrenCallback
5.	如果响应类型为GetChildren2Response,则调用Children2Callback
6.	如果响应类型为CreateResponse,则调用StringCallback
7.	如果callback类型为VoidCallback,则调用VoidCallback

上述的Response都属于`org.apache.zookeeper.proto`包的一部分，实现了接口`org.apache.jute.Record`。

ZK使用jute生成RPC和序列化相关的代码。zookeeper.jute定义了相关代码。

#####queueEvent方法

			if (event.getType() == EventType.None
                    && sessionState == event.getState()) {
                return;
            }
            sessionState = event.getState();

            // materialize the watchers based on the event
            WatcherSetEventPair pair = new WatcherSetEventPair(
                    watcher.materialize(event.getState(), event.getType(),
                            event.getPath()),
                            event);
            // queue the pair (watch set & event) for later processing
            waitingEvents.add(pair);
            
1.	如果事件的类型为None，即连接状态的变更，则直接返回
2.	将sessionState置为Event中的状态
3.	通过ClientWatchManager,产生需要被通知的Watcher,然后生成WatcherSetEventPair事件
4.	将事件放入waitingEvents列表

SendThread的onConnect方法会调用queueEvent方法


#####queuePacket方法

	public void queuePacket(Packet packet) {
          if (wasKilled) {
             synchronized (waitingEvents) {
                if (isRunning) waitingEvents.add(packet);
                else processEvent(packet);
             }
          } else {
             waitingEvents.add(packet);
          }
       }
 
1.	如果EventThread还存活着，则将事件放入到waitingEvents列表
2.	如果已经处于kill状态中，则判断是否还在运行，如果是则加入到waitingEvents列表中，否则直接处理。

ClientCnxn的finishPacket方法会调用 queuePacket方法

####参考资料：
1.[jute](http://blog.sina.com.cn/s/blog_5e9040780101nn0b.html)