####Semaphore作用
作为一个计数的信号量，用来限制访问某些资源的线程数量。

通过tryAcquire 在获得资源前尝试，通过release返回资源。


####源代码分析
#####构造函数
1.	public Semaphore(int permits) 资源的数量
2.	public Semaphore(int permits, boolean fair) 资源的数量，以及是否采用公平策略

Semaphore的内部实现用到了`Sync`。
`Sync`是基于AQS（AbstractQueuedSynchronizer）的一个实现，

在semaphore中实现了公平和非公平两个策略（**原理还没有搞懂**）。


#####主要方法

1.	acquire() 在获得许可前一直阻塞
2.	acquire(int n)获得n个许可
2.	getQueueLength() 正在等待线程的估计数目
3.	release()释放一个许可
4.	tryAcquire() 仅在当前有可用许可时返回
5.	tryAcquire(long timeout, TimeUnit unit) 等待一定时间，以便获得一个许可

#####顾客和餐馆的实例
顾客线程通过acquire()一直阻塞，直到获得位置。

[源代码](https://github.com/llohellohe/cp/blob/master/src/yangqi/jcp/semaphore/RestaturantTest.java)



####参考资料
1. [Java并发编程: 使用Semaphore限制资源并发访问的线程数](http://mouselearnjava.iteye.com/blog/1921468)
2. [深入浅出 Java Concurrency (12): 锁机制 part 7 信号量（Semaphore）](http://www.blogjava.net/xylz/archive/2010/07/13/326021.html)




