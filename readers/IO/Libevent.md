libevent是事件驱动的IO库。

libevent通过eventop对外封装底层操作系统的I/O模型，比如select\epoll\kqueue\devpoll等。

###Reactor模式
反应堆模式，是一种事件驱动模式，通过使用反应堆模式提升效率。

可以用好莱坞原则解释“不要打电话给我，我会打电话给你”。

Reactor模式区别于普通的调用模式，普通的调用模式是程序主动调用API或者函数。

而Reactor模式则相反，它通过注册相应的接口到反应器上，当有事件发生时，反应堆通过调用相应的回调函数来处理事件。

1.	事件源 ，比如I/O事件
2.	事件多路分发器 event demultiplexer ，包含注册事件方法：register_handler(),和分发 demultiplexer()。程序先通过注册事件处理器，这样等指定事件发生时，就可以以非阻塞的方式通知程序。
3.	反应器 reactor ，内部使用event demultiplexer注册和撤销事件
4.	事件处理器 event handler ,用来处理read\write\timeout\close等事件。




NIO java 库

1.	http://netty.io/
2.	https://grizzly.java.net/
###资料

1.	GOOGLE_DRIVE/性能优化/libevent源码深度剖析.pdf
2.	epoll http://blog.csdn.net/sparkliang/article/details/4770655
3.	IO并发模式 http://blog.csdn.net/success041000/article/details/6725110
4.	Reactor 模式 http://blog.csdn.net/success041000/article/details/6725110