---
layout: post
category: Java
description: Java Reference
keywords: java reference
title: Java Reference
tags: [java, java reference]
summary: Java Reference
---
###一.引用的基类Reference

类 java.ref.Reference是所有引用对象的基类。

它的构造方法是包私有的，分别是：

1.	Reference(T referent)
2.	Reference(T referent,ReferenceQueue queue)

它有以下几部分组成：

1.	T referent:被引用的对象
2.	Reference pending
3.	Reference next
4.	ReferenceQueue queue 是为了给程序的反馈，说明这个对象已经被GC了，以便程序做后续的处理。

Reference有个ReferenceHandler，在类初始化的时候会启动这个Handler线程，不断的操作pending和next。

####基本方法

1.	get()返回被应用的对象--referent
2.	clear()将referent置为null
3.	isEnqueued（）判断引用是否进入队列，如果创建引用时没有指定队列，则总是返回false
4.	enqueue()将引用放入队列中，此方法只为Java调用，如果是虚拟机的话，会直接将引用放入队列，而不会调用此方法。



###二.软引用SoftReference
当虚拟机判断某个对象是软引用时，它可以清除它。软引用指示的对象保证在虚拟机抛出OutOfMemoryError之前已经清除。

只要该引用指示的对象是强引用的，该对象就不会被清除。

它有两个成员变量：

1.	long clock:由虚拟机更新的时间。
2.	long timestamp:时间戳，每次get()时，this.timestamp=clock。虚拟机可能通过这个时间戳来选择被清理的Reference。


###三.弱引用WeakReference
弱引用，该类继承了基类Reference，没有任何个性化。弱引用可以用于实现内存敏感的缓存，因为虚拟机会自动清楚弱引用对象(每次full gc后就会清理，没有实验验证过)。

软引用不保证对象被终结或者重新申明。意味着软引用通过get()获得时，很可能变成了null。

当对象是弱可达时，垃圾回收器将清除所有该对象的弱引用。

典型的例子是，WeakHashMap，它的`Entry<K,V>`继承了WeakReference，

	 Entry(Object key, V value,
              ReferenceQueue<Object> queue,
              int hash, Entry<K,V> next) {
            super(key, queue);
            this.value = value;
            this.hash  = hash;
            this.next  = next;
        }
        

WeakHashMap则用弱引用实现了HashMap。它的key是weak reference的，但是value不是。

每次WeakReference.get() 返回非null时候，是强引用的，它可以避免被get后，对象gc收集。


###四.虚引用PhantomReference
虚引用只能通过PhantomReference(T referent,ReferenceQueue queue)构造。

它的get()方法总是返回null。

###五.FinalReference
用于finalization实现的引用。同PhantomReference一样，它只能通过FinalReference(T referent,ReferenceQueue queue)构造。