###一.Java NIO的简介
在阻塞的IO模式下，为了提升服务器的性能，通常为每个连接建立一个线程来处理。

这样能提升处理性能，但是当连接过多时，系统的压力就会骤升。

####NIO
Java NIO引入了基于Refactor模式的I/O多路复用机制，提升I/O性能。

NIO具有以下重要的数据类型:通道、缓冲区和选择器。

通道可以向选择器注册，一旦有事件发生，通过遍历选择器可以获得对应的事件。

####通道 Channel
目前有四种类型的通道：

1.	TCP:SocketChannel
2.	TCP:ServerSocketChannel
3.	UDP:DatagramChannel
4.	文件:FileChannel。

通道类似流，但是又有明显的三个不同：

1.	流是单向的，但是通道既可以读也可以写
2.	通道可以异步的读写
3.	通道的数据写入必须基于Buffer，即先写入Buffer或者先读入到Buffer。

[通道的介绍](http://www.hiyangqi.com/java%20nio/java-nio-channel.html)

####缓冲区 Buffer
缓冲区有七种类型（Java 8中primitive类型中除了boolean）：

1.	ByteBuffer
2.	CharBuffer
3.	IntBuffer
4.	DoubleBuffer
5.	FloatBuffer
6.	LongBuffer
7.	ShortBuffer

[Buffer的介绍](http://www.hiyangqi.com/java%20nio/java-nio-buffer.html)。


####选择器 Selector
单线程可以将Channel的事件注册到Selector,实现高效的IO处理。

![image](http://ifeve.com/wp-content/uploads/2013/06/overview-selectors.png)


选择器必须在非阻塞的通道上使用，因此必须将Channel配置成非阻塞模式。

SocketChannel就亦就可以配置成非阻塞模式，而FileChannel则不支持非阻塞。

通过Channel的reigister方法，可以将selector和关心的时间注册上去。

如果关心多个事件，则可以用 “|” 组合多个事件。 

###参考资料
1.	[并发编程网-JavaNIO](http://ifeve.com/overview/)