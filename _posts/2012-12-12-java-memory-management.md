---
layout: post
category: Java Performance 读书笔记
description: 
keywords: java memory management
title: Java内存管理
tags: [java, 性能, JVM]
summary: 随便谈谈Java内存管理
---
随便谈谈JAVA的内存管理，懒得画图，看看文字就好了。

对于我不了解的一些东西，就没有说，所以这里不是Java内存管理的全部。
####一.内存管理的好处
为什么要内存管理，如果让程序员自己来显示管理内存的话，会有这么些不好的点。

1.	Dangling Reference（不知道怎么翻译）。释放一片内存区域后，其实有些对象还是引用着这些区域，这时候就会问题。
2.	内存泄露。忘记释放已经可以释放的内存。

总而言之，显示管理内存会有很多意想不到的错误，而现代语言比如Java、Ruby都使用了垃圾回收器的自动管理内存。

通过垃圾回收器，一些不在引用的对象会被自动释放，最大化避免内存泄露（当然，不能完全避免内存泄露这个问题）。

####二.垃圾回收器
#####职责
先明确下垃圾回收器的职责：

1.	分配内存
2.	保证被引用的对象不会被回收，避免Dangling Reference
3.	保证不再被引用的对象会自动回收

垃圾回收器在工作的时候必须保证以下几点：

1.	效率高
2.	避免内存碎片
3.	不能成为应用的瓶颈

#####性能指标
衡量垃圾回收器的好坏也是有一些指标的

1.	应用的吞吐量
2.	垃圾回收器的负载
3.	垃圾回收的暂停时间
4.	垃圾回收的频率
5.	释放的内存大小

对于不同的应用，适用的指标也不同。

比如对于响应性高的应用，对于第三个指标，垃圾回收的暂停时间可能比较苛刻。

#####设计选择
1.	并行VS串行。实用串行的单核CPU垃圾回收，还是并行的多核CPU回收。
2.	并发VS暂停。通过和应用并发回收，还是在垃圾回收的时候，把应用暂时停止。
3.	压缩VS不压缩VS拷贝。通过压缩，可以减少内存内存分片，提升后续的内存分配速度。不压缩的垃圾回收起来更快，缺点是很多内存碎片。拷贝的话，需要额外一片内存区域。


####三.一些垃圾回收器
#####分代回收
一般来说，大部分对象都是短命的，少部分对象比较长命。所以，将内存分为年轻代，和年老代是个好的选择。

对象在年轻代分配，如果经过几次垃圾回收，还存活的话，便提升到年老代。

Java把内存分为：

1.	年轻代
2.	年老代
3.	永久区。永久区存放一些meta信息，比如Class的信息，方法信息等。

年轻代又分为Eden和两个大小一样的survivor区，一般对象都会在Eden区分配（如果对象太大的话，会直接在Old区分配）。

如果年轻代满了，会触发young gc,回收年轻代。

如果年老代满了，会触发full gc，回收年老代。

#####TALB
为了保证线程安全，内存的分配是会加锁的，如果多个线程需要分配内存，那么锁势必会影响效率。

Thread Local Location Buffers,可以预先建立线程自己的内存区域。

这样以后在给对象分配内存的时候，可以减少各个线程直接对分配共享内存加锁，提升效率。

#####串行GC
开启方法`-XX:+UseSerialGC` 。
通过单CPU串行回收，在年老代的时候，通过标记清除法回收对象，

同时会把对象做整理压缩到一个区域内，减少内存碎片。

在年轻代通过copy的方法回收。

串行垃圾回收适用于对于暂停时间要求低的应用。

#####并行GC
开启方法`-XX:+UseParallelGC` 。

在年轻代回收的时候，使用多个CPU同时回收，提升效率。

但是年老代的回收，和串行GC 回收一致。

#####并行压缩GC
开启方法`-XX:+UseParallelOldGC` 。

年轻代中的回收方法和并行GC一致。

年老代中，分为三个步骤：

1.	mark阶段 ,通过多个GC线程，将各个代划分成大小一定的区域，并且标记存活对象的位置和大小信息。
2.	summary阶段, 针对区域进行操作。通常GC后，每个代的前面部分的区域是非常密集的，因此对这些对象做压缩，意义不到。因此这个阶段的第一件事情是找到一个区域中可以压缩的平衡点，对于这个点后面的对象进行压缩。这个过程是串行的。
3.	compact阶段，通过多个GC线程，并发的压缩和清除对象。

GC线程的个数可以通过`–XX:ParallelGCThreads=n` 指定。 

#####CMS(Concurrent Mark And Sweep)
开启方法`-XX:+UseConcMarkSweepGC` 。

年轻代的回收和并行GC一致。

年老代的回收过程分为以下几个步骤：
1.	initiail mark:暂停整个应用（Stop The World）从根对象开始，遍历对象，确定对象是否存活。虽然是单线程的，但是这步骤很快就会完成。
2.	concurrent remark:不暂停应用，和应用并行的执行，查看整个内存空间中存活的对象。因为initail mark后可能有新的对象直接分配到Old区，或者从年轻代promote过来。
3.	remark:暂停整个应用，执行最后的mark。这个阶段会暂停整个应用，同时通过多核并行的扫描整个内存对象，并做标记。
4.	concurrent sweep:并行的清理对象。

CMS整个过程中，只有initial mark和remark阶段会暂定应用，所以它对应用的相应时间影响性比较小。

但是它也有缺点：

1.	内存碎片问题。不进行碎片整理和压缩；为了提升效率，内存不会被整理。因此为对象分配内存的时候，不能简单的分配到区域内后半部分空余的。而是需要通过记录各个空闲内存的列表来实现。每次需要分配时，先查下这个表，看看有没有位置可以放下。
2.	内存空间利用率问题，需要更大的堆空间。为了保证CMS工作的时候，堆还有剩余空间给应用分配对象使用，CMS不会在Old区满的时候才触发，而是达到`–XX:CMSInitiatingOccupancyFraction=n`设置的阈值后就触发。默认n=68。


####四.总结下JVM配置
#####四种垃圾回收器的使用
1.	串行GC:`-XX:+UseSerialGC`
2.	并行GC:`-XX:+UseParallelGC`
3.	并行压缩GC:`-XX:+UseParallelOldGC`
4.	CMS:`-XX:+UseConcMarkSweepGC`

#####分代的配置
1.	堆大小：最大堆大小`-Xms1g` ，初始化堆大小`-Xmx1g`
2.	年轻代大小:初始化`-XX:NewSize=1g`，最大`-XX:MaxNewSize=1g`,年轻代占比：`-XX:NewRatio=8`,在server模式下，年轻代和年老的比率是1：8。
3.	Surivior比率 `-XX:SurviorRation=8`,单个Survior和年轻代的比率，注意survior有两个。
4.	年老代大小：`-XX:MaxPermSize=1g`,年老代的最大大小

#####打印GC信息的一些参数

1.	`-XX:+PrintGCDetails` 打印GC的详细信息
2.	`-XX:+PrintGC`
3.	`-XX:+PrintGCTimeStamps` 打印GC的时间信息

#####其它
1.	`-XX:ParallelGCThreads=3`,在并行GC\并行压缩GC\CMS中并行GC的线程数，默认是CPU的个数。
2.	`-XX:MaxTenuringThreshold`
在新生代中对象存活次数(经过Minor GC的次数)后仍然存活，就会晋升到旧生代。

3.	`-XX:TargetSurvivorRatio`
一个计算期望存活大小Desired survivor size的参数.

计算公式：

 (survivor_capacity * TargetSurvivorRatio) / 100 * sizeof(a pointer)：
survivor_capacity（一个survivor space的大小）乘以TargetSurvivorRatio，
 
表明所有age的survivor space对象的大小如果超过Desired survivor size，则重新计算threshold，以age和

MaxTenuringThreshold的最小值为准，否则以MaxTenuringThreshold为准.

即通过`jstat -gcnew `看到的TT和MTT



####五.一些场景
[利用Arena Allocation避免HBase触发Full GC](http://kenwublog.com/avoid-full-gc-in-hbase-using-arena-allocation)  通过打开`-XX:PrintFLSStatistics=1 ` 可以看到每次GC后Heap的量

