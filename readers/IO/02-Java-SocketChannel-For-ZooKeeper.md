###简介
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

 
        

