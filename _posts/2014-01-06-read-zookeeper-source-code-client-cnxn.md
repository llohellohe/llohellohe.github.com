---
layout: post
category: 分布式
description: 本文介绍了分布式协调系统ZooKeeper的客户端初始化过程。详细介绍了ZooKeeper的客户端是如何工作的,EventThread和SendThread是如何初始化的。
keywords: 分布式,ZooKeeper,ZooKeeper源代码,ZooKeeper客户端初始化过程,ClientCnxn,EventThread,SendThread
title: ZooKeeper源代码解读之ClientCnxn
tags: [分布式,ZooKeeper,ZooKeeper源代码]
summary: ZooKeeper源代码解读之ClientCnxn
---
Tips:[ZooKeeper学习目录](https://github.com/llohellohe/zookeeper/blob/master/README.md)

###一.ClientCnxn作用
ClientCnxn用于客户端和服务端的socket 进行I/O 通信,默认的使用[ClientCnxnSocketNIO](http://www.hiyangqi.com/%E5%88%86%E5%B8%83%E5%BC%8F/read-zookeeper-source-code-nio-socket.html)实现进行通信。

并且它维护了一个服务器的地址列表。在需要的时候，可以进行透明的自动重连。

###二.类初始化
	static {
	        // this var should not be public, but otw there is no easy way
	        // to test
	        disableAutoWatchReset =
	            Boolean.getBoolean("zookeeper.disableAutoWatchReset");
	        if (LOG.isDebugEnabled()) {
	            LOG.debug("zookeeper.disableAutoWatchReset is "
	                    + disableAutoWatchReset);
	        }
	    }
	    
根据传入的参数`zookeeper.disableAutoWatchReset`，决定是否将自动重置watch的开关打开。

###三.构造函数和字段属性
	ClientCnxn(String chrootPath, HostProvider hostProvider, int sessionTimeout, ZooKeeper zooKeeper,
	            ClientWatchManager watcher, ClientCnxnSocket clientCnxnSocket, boolean canBeReadOnly)
	            
以及
   
   
	   ClientCnxn(String chrootPath, HostProvider hostProvider, int sessionTimeout, ZooKeeper zooKeeper,
	            ClientWatchManager watcher, ClientCnxnSocket clientCnxnSocket,
	            long sessionId, byte[] sessionPasswd, boolean canBeReadOnly)
	            
	            
####(一).参数	            
1.	chrootPath 传入的 chroot路径
2.	hostProvider 用于提供服务器连接地址
3.	sessionTimeout 连接的超时时间
4.	ZooKeeper 客户端连接包装类
5.	ClientWatchManager 客户端用于观察的管理器
6.	ClientCnxnSocket 用于socket I/O 的
7.	sessionId 默认为0
8.	sessionPasswd 默认为大小为16的字节数组
9.	canBeReadOnly 是否为只读模式

####(二).初始化过程
        //连接超时时间为sessionTimeout除以总共的连接服务器数
 		connectTimeout = sessionTimeout / hostProvider.size();
 		//读超时时间为 sessionTimeout的0.66667倍
        readTimeout = sessionTimeout * 2 / 3;
        readOnly = canBeReadOnly;

        sendThread = new SendThread(clientCnxnSocket);
        eventThread = new EventThread();

设置对应的连接超时和读超时时间后，初始化用于数据传输的SendThread，以及用于事件处理的EventThread

####(三).所有字段归类
ClientCnxn的字段可以归类成5大类。

1.	连接相关属性，如超时时间等
2.	授权相关属性
3.	数据发送相关属性
4.	状态相关属性
5.	其它属性

具体划分参看类图。


####(四).seenRwServerBefore
这个boolean字段用volatile控制其可见性。

在ZooKeeper构造函数的初始化过程中，如果提供的参数中包含了sessionId，那么这个值将被置为true。

####启动SendThread和EventThread
ZooKeeper构造函数的最后，会调用start()方法，启动sendThread和eventThread

###四.SendThread
SendThread用于发起和接受请求，并处理相应。同时产生心跳信息。

SendThread继承了Thread。

####run方法

#####第一步.更新相关时间
			clientCnxnSocket.introduce(this,sessionId);
            clientCnxnSocket.updateNow();
            clientCnxnSocket.updateLastSendAndHeard();
            
最开始完成了三件事情

1.	在ClientCnxnSocket 中引入SendThread和sessionId
2.	将ClientCnxnSocket的now置成当前时间
3.	将ClientCnxnSocket的最后发送和最后心跳时间置成当前时间


#####第二步.进入循环
ClientCnxn内部维护了一个表示连接状态的volatile变量state，

		while (state.isAlive()) {
		//
		}
如果state不为Closed或者AUTH_FAILED,那么一直在这个循环里面。

#####第三步.建立连接
	if (!clientCnxnSocket.isConnected()) {
         if(!isFirstConnect){
             try {
                 Thread.sleep(r.nextInt(1000));
             } catch (InterruptedException e) {
                 LOG.warn("Unexpected exception", e);
             }
         }
         // don't re-establish connection if we are closing
         if (closing || !state.isAlive()) {
             break;
         }
         startConnect();
         clientCnxnSocket.updateLastSendAndHeard();
	  }
	  
如果连接尚未建立，先判断是否为第一次建立，如果不是第一次，则随机等待一段时间。

否则调用startConnect方法建立连接。

startConnect过程：

1.	将state状态置为CONNECTING
2.	判断rwServerAddress是否为空，如果不为空，则将其置为连接地址。否则调用hostProvider产生连接地址。
3.	设置进程名称
4.	初始化ZooKeeperSaslClient
5.	记录连接信息的日志
6.	调用clientCnxnSocket的connect()方法建立连接。

连接建立后，会调用clientCnxnSocket.updateLastSendAndHeard()更新最新的读写时间和心跳时间。

但是，从代码上看，这个更新时间同最开始的时候时间更新一致,应该先调用下updateNow()方法才对。

#####第四步.判断超时
如果已经连接上了，即state状态为CONNECTED或者CONNECTEDREADONLY，则判断是否超过读超时，如果未连接上，则判断是否超过连接超时。

一旦发生超时，则抛出SessionTimeoutException。

#####第五步.发送心跳
如果已经连接上，即state状态为CONNECTED或者CONNECTEDREADONLY，默认在读超时的一半时间发送心跳。发送心跳使用sendPing()方法。

构造RequestHeader(-2, OpCode.ping)，并且调用queuePacket方法发送这个Header。

#####第六步.发送心跳给RW server
如果state为CONNECTEDREADONLY，那么将使用pingRwServer()发送心跳给rw server。

pingRwServer()方法直接使用Socket建立连接，并且查看相应是否为rw，如果是则抛出RWServerFoundException异常。

***为什么要直接用socket,而不用ClientCnxnSocket？***

#####第七步.传输数据
调用ClientCnxnSocket的doTransport方法传输数据。

	clientCnxnSocket.doTransport(timeOut, pendingQueue, outgoingQueue, ClientCnxn.this); 

需要被发送的数据，被放在`LinkedList<Packet>outgoingQueue`中，

已经发送等待响应的数据放在` LinkedList<Packet> pendingQueue` 中。

#####第八步.退出

 			cleanup();
            clientCnxnSocket.close();
            if (state.isAlive()) {
                eventThread.queueEvent(new WatchedEvent(Event.EventType.None,
                        Event.KeeperState.Disconnected, null));
            }
            ZooTrace.logTraceMessage(LOG, ZooTrace.getTextTraceLevel(),
                                     "SendThread exitedloop.");
                                     
如果state状态不为active，则退出循环。

执行最后的数据发送和处理，同时关闭clientCnxnSocket。

使用EventThread发送连接关闭事件，并且记录日志。

####ClientCnxn时序图
![image](https://raw2.github.com/llohellohe/llohellohe.github.com/master/readers/ZooKeeper/ClientCnxnSocketNIO.png)

[查看原图](https://raw2.github.com/llohellohe/llohellohe.github.com/master/readers/ZooKeeper/ClientCnxnSocketNIO.png)

####五.Packet

Packet用于传播相应的header以及record。

	Packet(RequestHeader requestHeader, ReplyHeader replyHeader,
               Record request, Record response,
               WatchRegistration watchRegistration, boolean readOnly)
               
构造函数包含参数：

1.	请求头RequestHeader
2.	相应头ReplyHeader
3.	请求
4.	响应
5.	WatchRegistration
6.	是否只读

Packet的createBB()方法，用于将数据写入requestHeader和request序列化到NIO的ByteBuffer里面。

Packet还包含客户端ZNode路径，服务端ZNode路径，AsyncCallback和Context等字段。

####六.ClientCnxn相关类图

![image](https://raw2.github.com/llohellohe/zookeeper/master/docs/class-diagram/ClientCnxn.png)
可见ClientCnxn异常复杂，剩余部分将在下一篇文章中描述。
