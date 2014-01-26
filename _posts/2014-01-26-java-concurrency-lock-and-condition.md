---
layout: post
category: Java Concurrency
description: 介绍多线程编程中的一个基本工具线程池显式锁ReentrantLock和显式条件队列Condition的内部原理解析，包含显式锁ReentrantLock和显式条件队列Condition的原理。
keywords: java concurrency, java的多线程处理，ReentrantLock的用法，ReentrantLock的源代码分析和ReentrantLock的主要方法以及原理分析，Condition的用法，Condition的源代码分析和Condition的主要方法以及原理分析，
title: 显式锁ReentrantLock和显式条件队列Condition
tags: [java concurrency]
summary: Java 多线程基本工具之显式锁和显式条件队列的分析
---

###一.显式锁和内置锁
在Java 5.0之前，协调共享对象的访问时，只有synchronized和volatile。

Java 6.0增加了一种新的机制：ReentrantLock。

显示锁ReentrantLock和内置锁synchronized相比，实现了相同的语义，但是具有更高的灵活性。

1.	获取和释放的灵活性
2.	轮训锁和定时锁
3.	公平性

内置锁synchronized的获取和释放都在同一个代码块中，而显示锁则可以将锁的获得和释放分开。

同时，显示锁可以提供轮训锁和定时锁，同时可以提供公平锁或者非公平锁。

公平锁，是指线程将按照请求锁的顺序获得锁，而非公平所则允许插队。

###二.源代码分析

####Lock
`java.util.concurrent.locks.Lock`接口定义了显示锁的基本操作

1.	void lock();
2.	boolean tryLock();
3.	定时锁：boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
4.	void unlock(); 记得在finally中释放锁，避免忘记释放锁导致的“定时炸弹”
5.	Condition newCondition();


####ReentrantLock
ReentrantLock实现了接口Lock。

ReentrantLock内部亦采用了AQS实现。


###三.状态依赖性的管理和条件队列

如果依赖的状态没有满足，调用者可以选择等待或者自旋（不断重试）。

自旋会浪费CPU的时钟周期，等待会降低响应性。

依赖状态的操作可以一直阻塞直到可以操作为止，这比先失败再重试方便许多。

正如每个Java对象可以作为一个锁，每个对象可以同样作为一个条件队列，Object的wait.notify,notifyAll构成了条件队列的API。

对象的条件队列和对象的锁是相关联的，要调用条件队列的相关方法，必须先拥有这个锁。

####wait\notify

在获得对象的监视器后，调用它的wait方法将导致当前线程等待，改线程将被放在对象的条件等待队列中，直到其它线程调用notify或者notifyAll方法通知它。

######wait
声明释放对象的锁，并请求操作系统挂起当前线程，等待唤醒。

#####notify
notify唤醒等待对象的线程,并在线程唤醒前获得对象锁。

发出通知的线程应该尽快释放锁，从而保证正在等待的线程能尽快解除阻塞。

[WaitAndNotify的代码例子。](https://github.com/llohellohe/cp/blob/master/src/yangqi/jcp/lock/WaitAndNotify.java)

wait和notify只能在拥有对象的锁后才能调用，否则将抛出IllegalMonitorStateException。它锁住的不是对象而是对象的线程。

###四.显式的条件对象：Condition

正如Lock作为内置锁的显式版本，Condition作为条件队列的显式版本。

内置锁只能有一个条件队列，但Condition则可以使用多个条件谓词进行组合。

Condition和内置的wait\notify方法类似，用于实现线程间的通信。

它的方法有：

1.	void await() throws InterruptedException; //类似Object.wait
2.  boolean await(long time, TimeUnit unit) throws InterruptedException;
4.  void signal();  // 类似Object.notify()
5.  void signalAll();	// 类似Object.notifyAll()

ReentrantLock的newCondition方法返回Condition的实现。

[Condition使用的代码实例](https://github.com/llohellohe/cp/blob/master/src/yangqi/jcp/lock/ConditionSample.java)。

