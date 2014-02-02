---
layout: post
category: 分布式
description: 本文介绍了分布式协调系统ZooKeeper的客户端初始化过程。详细介绍了ZooKeeper的客户端是如何工作的,ClientCnxnSocketNIO是如何初始化的。
keywords: 分布式,ZooKeeper,ZooKeeper源代码,ZooKeeper客户端初始化过程,ClientCnxn,ClientCnxnSocketNIO
title: ZooKeeper源代码解读之ClientCnxnSocketNIO
tags: [分布式,ZooKeeper,ZooKeeper源代码]
summary: ZooKeeper源代码解读之ClientCnxnSocketNIO
---

###简介
ClientCnxnSocketNIO 使用JAVA NIO的形式进行数据通信。关于ClientCnxn的处理过程参看文章 :[ZooKeeper源代码解读之ClientCnxn](http://www.hiyangqi.com/%E5%88%86%E5%B8%83%E5%BC%8F/read-zookeeper-source-code-client-cnxn.html)

SocketChannel作为数据的传输通道，分为服务端的ServerSocketChannel和客户端的SocketChannel两种类型。

通过Selector可以在通道上注册选择器，当指定的事件到来时，通过选择器可以选择关心的事件并处理。

SelectionKey中定义了四种事件类型：

1.	接收连接 OP_ACCEPT 
2.	连接 OP_CONNECT
3.	读 OP_READ
4.	写 OP_WRITE


###创建SocketChannel

####步骤一：创建SocketChannel,并设置相关socket参数

		SocketChannel sock;
		//工厂方法，创建SocketChannel实例
        sock = SocketChannel.open();
        //将通道设置成非阻塞模式
        sock.configureBlocking(false);
        //socket close后立即返回，不延迟等待缓冲区的数据发送完毕
        sock.socket().setSoLinger(false, -1);
        // 禁用TCP的Nagle算法，设置为不延迟发送模式
        sock.socket().setTcpNoDelay(true);
        
######SO_LINGER
linger=拖延的意思，SO_LINGER只对close起作用。

默认情况下，调用socket的close方法后将立即返回，但是如果缓冲区中还有数据没有发送的话，

调用close方法后，会先发送数据，然后再返回。

######TCP NO_DELAY

设置延迟为false之后，将禁用Nagle算法。

设置为true之后，将启用Nagle算法。

Nagle算法是为了合并一些小的TCP包，避免因为多个小包导致网络阻塞。

当两个条件满足时，数据将被发送出去。

1.	积累的数据量到达最大的 TCP Segment Size
2.	收到了一个 Ack

[神秘的40ms延迟](http://jerrypeng.me/2013/08/mythical-40ms-delay-and-tcp-nodelay/)

[TCP NO_DELAY详解](http://bbs.chinaunix.net/thread-3767363-1-1.html)

####步骤二：将端口和地址注册到通道上

	 //创建选择器
	 Selector selector=Selector.open();
	 //将Selector和连接事件注册到通道上，获得SelectionKey
	 sockKey = sock.register(selector, SelectionKey.OP_CONNECT);
	 //连接到指定Socket地址
     boolean immediateConnect = sock.connect(addr);
     if (immediateConnect) {
     		//连接后，调用SendThread的相关方法
            sendThread.primeConnection();
     }
     
###创建SocketChannel总结
主要步骤如下：

1.	通过SocketChannel的open方法获得通道
2.	配置通道的属性（阻塞非阻塞）以及socket相关属性
3.	将Selector和相关事件注册到通道上，并且获得SelectionKey
5.	调用通道的Connect方法，连接到服务端。
6.	获得Selector的select方法，获得事件个数
7.	遍历selector的SelectionKey，如果Key可读，则调用read方法，将数据读到ByteBuffer中。
8.	当事件发生后，需要继续注册，以便获得下一步的数据。


###数据传输
####doTransport方法
通过Selector注册CONNECT\READ\WRITE事件到SocketChannel上。

*	如果事件类型为CONNECT，则更新相关时间以及调用SendThread的primeConnection方法。
*	如果事件类型为READ或者WRITE，调用doIO方法。

		//等待到至少一个Select事件，超时时间为waitTimeout
 		selector.select(waitTimeOut);
        Set<SelectionKey> selected;
        synchronized (this) {
        	//获得SelectionKey
            selected = selector.selectedKeys();
        }
        // Everything below and until we get back to the select is
        // non blocking, so time is effectively a constant. That is
        // Why we just have to do this once, here
        updateNow();
        for (SelectionKey k : selected) {
            SocketChannel sc = ((SocketChannel) k.channel());
            //查看返回的集合中是否包含CONNECT事件
            if ((k.readyOps() & SelectionKey.OP_CONNECT) != 0) {
            	 //查看连接是否已经就绪
                if (sc.finishConnect()) {
                    updateLastSendAndHeard();
                    sendThread.primeConnection();
                }
                //查看返回的集合中是否包含READ事件和WRITE事件
            } else if ((k.readyOps() & (SelectionKey.OP_READ | SelectionKey.OP_WRITE)) != 0) {
                doIO(pendingQueue, outgoingQueue, cnxn);
            }
        

####doIO 方法
 
#####read
如果SelectionKey 是可读的，那么则读取数据。

读之前首先需要知道数据的大小，即将数据读入到lenBuffer中，然后读取数据的长度。

根据这个长度初始化IncomingBuffer的大小。


	if (sockKey.isReadable()) {
            int rc = sock.read(incomingBuffer);
            if (rc < 0) {
                throw new EndOfStreamException(
                        "Unable to read additional data from server sessionid 0x"
                                + Long.toHexString(sessionId)
                                + ", likely server has closed socket");
            }
            if (!incomingBuffer.hasRemaining()) {
                incomingBuffer.flip();
                if (incomingBuffer == lenBuffer) {
                    recvCount++;
                    readLength();
                } else if (!initialized) {
                    readConnectResult();
                    enableRead();
                    if (findSendablePacket(outgoingQueue,
                            cnxn.sendThread.clientTunneledAuthenticationInProgress()) != null) {
                        // Since SASL authentication has completed (if client is configured to do so),
                        // outgoing packets waiting in the outgoingQueue can now be sent.
                        enableWrite();
                    }
                    lenBuffer.clear();
                    incomingBuffer = lenBuffer;
                    updateLastHeard();
                    initialized = true;
                } else {
                    sendThread.readResponse(incomingBuffer);
                    lenBuffer.clear();
                    incomingBuffer = lenBuffer;
                    updateLastHeard();
                }
            }
         
    }    

#####readConnectResult
如果尚未初始化，则调用readConnectResult方法。

readConnectResult 方法负责将接收到的ByteBuffer转成BinaryInputArchive，

ConnectResponse通过BinaryInputArchive的deserialize出各个数据：

1.	int protocolVersion
2.	int timeOut
3.	long sessionId
4.	byte[] password
5.	boolean readOnly //是否为只读模式

#####开启和关闭读、写
比如开启读，在SelectionKey中插入READ操作

        int i = sockKey.interestOps();
        if ((i & SelectionKey.OP_READ) == 0) {
            sockKey.interestOps(i | SelectionKey.OP_READ);
        }

比如关闭读，

        int i = sockKey.interestOps();
        if ((i & SelectionKey.OP_WRITE) != 0) {
            sockKey.interestOps(i & (~SelectionKey.OP_WRITE));
        }

#####write 写
Packet 是内部协议数据的封装。

