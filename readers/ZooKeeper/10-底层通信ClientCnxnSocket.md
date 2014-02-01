###ClientCnxnSocket
类ClientCnxnSocket负责ZooKeeper客户端和服务端的底层通信，负责协议的解析（通过apache jute），它采用了socket实现。



它通过NIO的ByteBuffer进行数据处理。

####各个属性


1.	ByteBuffer lenBuffer  //接受到的消息的长度
2.	ByteBuffer incomingBuffer //接受到的消息
3.	long sendCount,recvCount //发送和接受的字节数量
4.	long lastHerd,lastSend //最后的心跳发送和接受时间
5.	long now //当前时间
6.	long sessionId //session id，只是用来记录日志或者发生异常的时候用于追溯
7.	ClientCnxn.SendThread sendThread 

####重要的方法 readConnectResult

readConnectResult 方法负责将接收到的ByteBuffer转成BinaryInputArchive，

ConnectResponse通过BinaryInputArchive的deserialize出各个数据：

1.	int protocolVersion
2.	int timeOut
3.	long sessionId
4.	byte[] password
5.	boolean readOnly //是否为只读模式


###ClientCnxnSocketNIO
ClientCnxnSocketNIO是ClientCnxnSocket的NIO实现，

用了NIO的Selector和SelectionKey机制。


####建立连接 connect

		//创建SocketChannel
 		SocketChannel sock = createSock();
        try {
           //将SocketChannel注册到Selector上，返回selectionkey
           registerAndConnect(sock, addr);
        } catch (IOException e) {
            LOG.error("Unable to open socket to " + addr);
            sock.close();
            throw e;
        }
        initialized = false;

        /*
         * Reset incomingBuffer
         */
        lenBuffer.clear();
        incomingBuffer = lenBuffer

####是否已经连接 isConnected
如果SelectionKey不为null代表已经连接。

####远程socket和本地socket地址获得 getRemoteSocketAddress和getLocalSocketAddress

调用SocketChannel的remote 和 local socket方法

####关闭连接 close

调用selector的close方法

####清理 cleanup

先调用socket关闭input,再调用socket关闭output,最后执行socket的close方法。

最后关闭SocketChannel。

等待100毫秒后，将SelectionKey置为null。

####唤醒 wakeupCnxn

调用Selector的wakeup方法。

####置为可写、置为不可写
通过SelectionKey来操作。

####数据传输 doTransport
通过NIO来传输数据。

####testableCloseSocket
关闭

####发送数据 sendPacket

        SocketChannel sock = (SocketChannel) sockKey.channel();
        if (sock == null) {
            throw new IOException("Socket is null!");
        }
        p.createBB();
        ByteBuffer pbb = p.bb;
        sock.write(pbb);


###需要看的
1.	Java NIO  Selector和SelectionKey机制  ByteBuffer