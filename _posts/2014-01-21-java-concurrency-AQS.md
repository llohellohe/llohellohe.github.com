---
layout: post
category: Java Concurrency
description: 介绍多线程编程中的一个基本工具AQS 。
keywords: java concurrency, AQS的用法，AQS的源代码分析和AQS的主要方法以及原理分析
title: Java 多线程基本工具的原理AQS
tags: [java concurrency]
summary: Java 多线程基本工具的内部实现AQS的原理
---
###一.AQS简介
AQS作为同步器的基础框架，可以用来实现锁的语义或者其它同步工具。

锁的API是面向使用者的，定义了锁的获取和释放，而同步器的API则用于内部实现资源的竞争和等待。

AQS可以被定义成共享模式或者排它模式，如果定义为排它模式，那么其它线程对其的获取会被阻止，而共享模式的话则可以获取成功。

AQS定义了获取锁和释放锁的基本方法，子类只需要实现相关方法即可。

1.	boolean tryAcquire(int arg)
2.	boolean tryRelease(int arg) 
3.	int tryAcquireShared(int arg)
4.	boolean tryReleaseShared(int arg)
5.	boolean isHeldExclusively()

###二.辅助类和CAS
####(一).LockSupport
LockSupport可以阻塞线程park或者解除线程的阻塞unpark，

park是“盲目等待”的优化，可以避免因为自旋导致的额外开销。

####(二).CAS
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


####(三).AbstractOwnableSynchronizer
AbstractOwnableSynchronizer是一个线程独占-即排它的同步器，它为其它锁或者同步器的实现提供基础。

它只有一个变量：exclusiveOwnerThread ，用于在排它模式下，保存当前的拥有者线程。

以及相对应的set和get方法。

###三.AbstractQueuedSynchronizer 的源代码分析
AbstractQueuedSynchronizer继承了AbstractOwnableSynchronizer。

AQS有如下几部分组成：

1.	volatile 的int state
2.	volatile 的Node作为队列头结点 head
3.	volatile 的Node作为队列尾结点 tail

它使用volatile的 int值来表示状态，同时使用FIFO的同步等待队列来维护等待的线程。

同步等待队列称为sync队列。



####等待队列和相关操作
等待队列的相关操作有：

1.	compareAndSetHead CAS的设置队列头部结点
2.	compareAndSetTail CAS的设置队列尾部结点



#####(一).结点：Node
Node构成了等待队列sync和Condition队列的基础结点，每个Node对应每个线程对同步器的访问。

Node包含五个成员变量：

1.	int waitStatus 结点的状态
2.	Node next 上一个结点
3.	Node prev 下一个结点
4.	Node nextWaiter condition队列中的后继结点
5.	Thread thread 入队列时的当前线程

对锁的请求，请求会形成结点，放到队列的尾部。

锁的释放则从尾部开始。

waitStatus有如下几种可能

1.	CANCELLED，值为1，表示当前的线程被取消；
2.	SIGNAL，值为-1，表示当前节点的后继节点包含的线程需要运行，也就是unpark；
3.	CONDITION，值为-2，表示当前节点在等待condition，也就是在condition队列中；
4.	PROPAGATE，值为-3，表示当前场景下后续的acquireShared能够得以执行；
5.	值为0，表示当前节点在sync队列中，等待着获取锁。


#####(二).入队列操作enq

	 private Node enq(final Node node) {
	        for (;;) {
	            Node t = tail;
	            if (t == null) { // Must initialize
	                if (compareAndSetHead(new Node()))
	                    tail = head;
	            } else {
	                node.prev = t;
	                if (compareAndSetTail(t, node)) {
	                    t.next = node;
	                    return t;
	                }
	            }
	        }
	    }

入队列操作时，通过一个永久的循环。

由于tail是volatile的，因此总能获得最新的值。

如果tail为空，证明队列还是空得，那么通过CAS的形式设置head。

否则，以CAS的形式设置tail。

#####(三).增加等待结点

参数mode表示结点为共享模式还是排它模式。

	 private Node addWaiter(Node mode) {
	        Node node = new Node(Thread.currentThread(), mode);
	        // Try the fast path of enq; backup to full enq on failure
	        Node pred = tail;
	        if (pred != null) {
	            node.prev = pred;
	            if (compareAndSetTail(pred, node)) {
	                pred.next = node;
	                return node;
	            }
	        }
	        enq(node);
	        return node;
	    }


#####(四).唤醒后继结点

unparkSuccessor方法用于唤醒后继结点，结点的状态为0时，代表处于等待获取锁的状态。

		private void unparkSuccessor(Node node) {
	        
	        int ws = node.waitStatus;
	        // 如果状态小于0，则以CAS的形式将当前结点的状态置为0。
	        if (ws < 0)
	        	compareAndSetWaitStatus(node, ws, 0);
	
	        Node s = node.next;
	        //获得当前结点的后继结点，如果后继结点为null后者状态为已取消
	        if (s == null || s.waitStatus > 0) {
	            s = null;
	            for (Node t = tail; t != null && t != node; t = t.prev)
	                if (t.waitStatus <= 0)
	                    s = t;
	        }
	        //唤醒结点
	        if (s != null)
	            LockSupport.unpark(s.thread);
	    }
	    
	    
###四.状态相关操作
####acquire方法
acquire方法为定义在AQS中final方法。

1.	先尝试通过tryAcquire获得资源。
2.	如果获取失败则将已排它的形式将结点增加到sync队列中。
3.	尝试从acquireQueue队列中获得

	public final void acquire(int arg) {
	        if (!tryAcquire(arg) &&
	            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
	            selfInterrupt();
	    }
	    
####acquireQueued方法
	
	final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }	    
	   





####参考资料
1. [CAS操作](http://blog.csdn.net/aesop_wubo/article/details/7537960)
2. [无锁队列的实现](http://coolshell.cn/articles/8239.html)
2. 推荐阅读：[AbstractQueuedSynchronizer的介绍和原理分析](http://ifeve.com/introduce-abstractqueuedsynchronizer/#more-8074)
3. 推荐阅读：[深入JVM锁机制2-Lock](http://blog.csdn.net/chen77716/article/details/6641477)
4. 推荐阅读：[Inside AbstractQueuedSynchronizer](http://whitesock.iteye.com/blog/1336409)
3. [JAVA LOCK代码浅析](http://www.blogjava.net/BucketLi/archive/2010/09/30/333471.html)