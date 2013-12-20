####Semaphore作用
作为一个计数的信号量，用来限制访问某些资源的线程数量。

通过tryAcquire 在获得资源前尝试，通过release返回资源。


####源代码分析
#####构造函数
1.	public Semaphore(int permits) 资源的数量
2.	public Semaphore(int permits, boolean fair) 资源的数量，以及是否采用公平策略

Semaphore的内部实现用到了`Sync`。
`Sync`是基于[AQS-AbstractQueuedSynchronizer](https://github.com/llohellohe/llohellohe.github.com/blob/master/readers/Java%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98/03-AQS.md)的一个实现，

它实现了如下方法：

1.	构造函数： Sync(int permits) 设置AQS的状态为许可的数量
2.	nonfairTryAcquireShared(int acquires) 非公平的获得许可，返回剩余的许可数量
3.	tryReleaseShared(int releases) 返回许可
4.	reducePermits(int reductions) 减少许可数量
5.	drainPermits() 将当前许可置为0

在semaphore中的Sync实现了公平和非公平两个策略。公平策略让每个线程获得锁的线程，如果不是队列的第一个的话，则需要需要排队等候。而非公平策略只有在许可资源不够的情况下，才需要等待（好像代码上体现不出来）。

#####公平策略 FairSync
FairSync实现了Sync,同时实现了
	
	int tryAcquireShared(int acquires)

方法。该方法总是让第一个等待的线程获得许可。

#####非公平策略 NonfairSync
NonfairSync同样实现了Sync方法，只不过它的`tryAcquireShared`调用的是父类的`nonfairTryAcquireShared`方法。



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
3. [Semaphore原理分析](http://yhjhappy234.blog.163.com/blog/static/3163283220135158415331/)




