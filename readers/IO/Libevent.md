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


###Proactor模式
Reactor模式属于同步的I/O模式，而Proactor模式则属于异步I/O模式，需要底层操作系统支持。

区别在于，处理器讲IO操作委托给操作系统，操作系统完成后，将数据放入缓存区。

这样事件处理的时候，不需要额外的发起IO操作，只需要从缓冲区中取即可。


NIO java 库

1.	http://netty.io/
2.	https://grizzly.java.net/
###资料

1.	GOOGLE_DRIVE/性能优化/libevent源码深度剖析.pdf
2.	epoll http://blog.csdn.net/sparkliang/article/details/4770655
3.	IO并发模式 http://blog.csdn.net/success041000/article/details/6725110
4.	Reactor 模式 http://blog.csdn.net/success041000/article/details/6725110
5.	libevent中得Reactor 模式 http://blog.csdn.net/sparkliang/article/details/4957744
6.	Proactor 前摄器 http://www.kuqin.com/ace-2002-12/Part-One/Chapter-8.htm
7.	Reactor和Proactor模式比较 http://liuxun.org/blog/reactor-he-proactor-mo-shi-bi-jiao/
8.	两种高性能 I/O 设计模式 Reactor 和 Proactor【推荐】 http://www.cnblogs.com/daoluanxiaozi/p/3274925.html