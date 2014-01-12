###线程安全性
要编写线程安全的代码，其核心在于要对状态访问操作进行管理，特别是共享的和可变状态的访问。

Java的主要同步机制是关键字synchronized，它提供乐一种独占的加锁方式，意味着只有一个线程能持有这种锁。

即使每个操作是原子的，复合操作也不一定能保证原子性。


###重入
重入意味着已经取得锁的线程，如果再次请求自己获得的锁，那么也是允许的。

重入的一种实现方法是，每个锁关联一个线程持有者和计数器。如果计数值为0时，锁将被释放。

###对象的共享
使用同步可以避免多个线程在同一时刻访问相同的数据。

同步还有另外个重要方面，即保证内存可见性。我们不仅希望某个线程正在使用对象状态而另个线程同时在修改改状态。

而且希望当一个线程修改了对象状态后，其它线程能够看到状态的变化。

因此，加锁的意义不仅在于互斥，还包括内存可见性。




####重排序
Java内存模型允许编译器和CPU对操作顺序进行重排序。

使用volatile类型后，编译器和运行时都会注意到这个变量是共享的，因此在读取volatile类型时，总会返回最新的值。

####发布和逸出
当某个不该被发布的对象被发布时，称为逸出。

####ThreadLocal
ThreadLocal可以用于保证线程封闭。

开发人员不该滥用ThreadLocal，避免引入隐式的耦合。

ThreadLocal[详细分析](https://github.com/llohellohe/llohellohe.github.com/blob/master/readers/Java%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98/05-ThreadLocal.md)。

###基础构建模块
####同步容器类
同步容器类Vector\HashTable对于某个公有方法都进行同步，使得每次只有一个线程能访问容器的状态。

同步容器类的效率低，而且需要注意避免ConcurrentModificationException。

诸如Set的toString()方法会隐藏的调用迭代器。

####并发容器
ConcurrentHashMap采用了分段锁(Lock Striping)的机制，在并发情况下具有良好的性能。

同时ConcurrentHashMap提供了一系列复合的原子操作，如：

1.	putIfAbsent(K,V)仅当k没有对应的v值时插入
2.	remove(K,V)仅当K对应的值为v时删除
3.	replace(K,old,new)仅当k为old时才替换为new。

Queue和BlockingQueue是Java 5.0后新增的容器类，提供了先进先出的队列。

Queue在没有元素时将返回null，而BlockingQueue则将阻塞，直到队列不为空。

BlockingQueue可以用于生产者-消费者模式。

Java 6中增加了双端队列Deque(发音deck)和BlockingDeque。

Deque可以在队首和队尾插入和移除。


和BlockingQueue不同的是，多个线程可以分别拥有一个BlockingDeque，让自己的为空时，可以从别的线程的BlockingDeque的队尾获得数据，这样可以提升更高的效率。

####同步工具类
除了BlockingQueue,同步工具类还有信号量semaphore、闭锁latch、栅栏barrier。

[CountDownLatch](https://github.com/llohellohe/llohellohe.github.com/blob/master/readers/Java%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98/02-CountDownLatch.md)是一种闭锁latch，countDown方法用于将计数递减，await方法等待直到计数器为0。

[Semaphore](https://github.com/llohellohe/llohellohe.github.com/blob/master/readers/Java%E5%B9%B6%E5%8F%91%E7%BC%96%E7%A8%8B%E5%AE%9E%E6%88%98/01-Semaphore.md)则维护了一组资源的许可，当获取资源时，首先要通过acquire获得许可，然后通过release返回许可。

CyclicBarrier类似CountDownLatch，CountDownLatch用于等待的事件，而CyclicBarrier则用来等待线程。

CountDownLatch是一个线程等待多个线程，而CyclicBarrier则是多个线程同时等待。

CyclicBarrier像水闸一样，只有所有的水都到齐，超过一定的阈值，才能防闸出水。

FutureTask在Executor中表示异步操作，如果操作未完成，则get会等到操作结束。否则立即返回。
