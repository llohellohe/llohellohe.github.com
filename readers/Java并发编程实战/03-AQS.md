####CAS
compare and swap 或者 compare and set。

	intcompare_and_swap (int* reg, int oldval, int newval)  
如果reg的值是oldval的话，则将其设置为newval。

CAS可以用来做无锁编程。AQS中用到了大量的CAS。

Java中的锁包含三个主要要素：

1.	unsafe.compareAndSwapXXX(Object o,long offset,int expected,int x)
2.	unsafe.park() 和 unsafe.unpark() LockSupport中的对应方法就是调用unsafe的这两个方法。
3.	单向链表结构或者说存储线程的数据结构

其中第一点是保证锁是否正在被使用的状态，并且操作是原子的（有操作系统提供）。

第二点用于那些没有得到锁的线程的等待和唤醒。

第三点则用于存储未获得锁的线程，比如AQS中通过双向队列来存储。


####AbstractOwnableSynchronizer
AbstractOwnableSynchronizer是一个线程独占，即排它的同步器，

它只有一个变量：exclusiveOwnerThread ，用于保存当前的拥有线程。

已经想对应的set和get方法。

####AbstractQueuedSynchronizer
AbstractQueuedSynchronizer继承了AbstractOwnableSynchronizer，以当个int值来表示状态。

它可以同时提供独占模式和共享模式的同步器。

它为其它基于FIFO的同步器提供一个基础框架。

具体同步器只需要实现下面方法即可：

1.	tryAcquire(int)		排它的获取状态
2.	tryRelease(int)    释放状态
3.	tryAcquireShared(int)	 共享的获取状态
4.	tryReleaseShared(int)   释放状态
5.	isHeldExclusively()  是否是独占模式


其它内部方法：

1.	Node enq(final Node node) 插入一个结点到队列中，如果队列不存在则初始化。
2.	Node addWaiter(Node mode) 插入代表当前线程的结点状态


#####Node
Node构成了FIFO队列的节点，每个Node对应每个线程对同步器的访问。

Node包含五个成员变量：

1.	int waitStatus 节点的等待状态
2.	Node next
3.	Node prev
4.	Node nextWaiter condition队列中的后继节点
5.	Thread thread 入队列时的当前线程

AbstractQueuedSynchronizer拥有有Node构成的队列的head结点和tail结点变量。

对锁的请求，请求会形成结点，放到队列的尾部。

锁的释放则从尾部开始。


####参考资料
1. [CAS操作](http://blog.csdn.net/aesop_wubo/article/details/7537960)
2. [无锁队列的实现](http://coolshell.cn/articles/8239.html)
2. 推荐阅读：[AbstractQueuedSynchronizer的介绍和原理分析](http://ifeve.com/introduce-abstractqueuedsynchronizer/#more-8074)
3. 推荐阅读：[深入JVM锁机制2-Lock](http://blog.csdn.net/chen77716/article/details/6641477)
4. 推荐阅读：[Inside AbstractQueuedSynchronizer](http://whitesock.iteye.com/blog/1336409)
3. [JAVA LOCK代码浅析](http://www.blogjava.net/BucketLi/archive/2010/09/30/333471.html)