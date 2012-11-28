---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记第七章
keywords: vmstat, java performance, performance tunning
title: JVM Performance Step By Step
tags: [java, 性能, JVM]
summary: JVM Performance Step By Step
---

####概述.应用的系统性需求

1.	可用性 Availiability
2.	可管理性 Manageability:包含部署应用、配置应用等
3.	吐吞量  Throughput ：即TPS
4.	响应时间 Latency or Responsiveness：每次请求的处理时间。
5.	内存占用 Memory Footprint
6.	启动时间 Startup time

很多调优都是在这几个指标中的权衡。


####一.选择JVM Runtime
众所周知，runtime有两种模式：client,server。 

Client更快的启动时间，更少的内存占用。

在Java 6 update 24后，有第三种名为tiered的模式可以使用。

	-server -XX:+TieredCompilation
	

当内存大于2g小于32g时，需要运行64位JVM，建议开启对象指针压缩。

	+UseCompressedOops
	
OOP:Ordinary Object Pointer。

一般情况下，64位的JVM会比32位的对象大1.5倍（更长的寻址空间），通过`+UseCompressedOops`可以压缩对象指针，减少内存容量。

`-XX:+UseParallelOldGC` 并发收集年轻代和年老代。

`-XX:+UseParallelGC` 只并发收集年轻代。

`-d64`选择使用64位JVM。

####二.GC调优
GC的三个基础指标：吞吐量、响应时间和内存占用。

GC调优的准则：

1.	每次ygc回收尽量多的对象
2.	每次gc回收尽量多的内存
3.	调优完成吞吐量、响应时间和内存中的至少两个

#####记录GC信息
通过如下JVM参数，可以记录GC信息：

	-XX:+PrintGCTimeStamps -XX:+PrintGCDetails -Xloggc:<filename>

####三.内存占用
一般的，内存可以分为Heap:年轻代+年老代，以及永久代PermGen。

#####heap大小设置
`-Xmx<n>g|m|k` 最大的堆内存

`-Xms<n>g|m|k` 初始化堆内存
#####年轻代大小设置

`-XX:NewSize=<n>g|m|k` 初始化年轻代大小

`-XX:MaxNewSize=<n>g|m|k` 最大年轻代大小

初始化年轻代的大小和最大年轻代大小必须一起设置。

`-Xmn<n>g|m|k`设定初始化、最大、最小的年轻代大小。

#####年老代大小设置
年老代的大小是根据整个Heap区的大小减去年轻代大小得出。

#####Perm区大小设置
`-XX:PermSize=<n>g|m|k`初始化永久代大小

`-XX:MaxPermSize<n>g|m|k`最大永久代大小


当Fullgc时，会同时回收年轻代、年老代和Perm区的对象。除非使用`-XX:-ScavengeBeforeFullGC` 。

	jmap histo[:live]
可以查看内存中的对象。live只查看活着的对象。

####四.逃逸分析 Escape Analysis

分析对象的指针范围称为逃逸分析，比如对象被其它线程访问到，则称为发生了逃逸。

比如：

1.	给一个stataic赋值
2.	线程方法返回值
3.	传递实例引用

对于不发生逃逸的对象，JVM可以继续优化。

比如使对象直接在当前的线程栈里面分配，而不是在堆中分配。这样可以减少堆中的GC次数。

通过`-XX:+DoEscapeAnalysis` 可以开启此优化。在JDK 1.6 update 26后默认开启。


####五.大页 Large page

原理介绍[地址](http://kenwublog.com/tune-large-page-for-jvm-optimization)

开启方法介绍[地址](http://dino.ciuffetti.info/2011/07/howto-java-huge-pages-linux/)

#####页和帧
为了更好的利用和扩展物理内存，操作系统都有MMU（内存管理单元），将虚拟内存地址映射到物理内存地址。

其中分页式的虚拟内存，将虚拟内存分为页（Page），将物理内存分为页帧（Frame），并且保证两者的大小一致，以便让页映射到桢。

两者的映射关系被存放在内存中的页表(Page Table)中。

######TLB（页表寄存器缓冲）
为了进一步优化，将部分页和桢的隐射关系保存在TLB中，只有miss时才访问页表。

因为CPU访问寄存器会通过总线访问内存。

如果要提高TLB的命中率，则必须提高页的大小，这样就可以尽可能多的存储映射关系。


######调整参数
操作系统中查看大页情况：

	cat /proc/meminfo | grep Huge
	
	HugePages_Total:   469
	HugePages_Free:    469
	HugePages_Rsvd:      0
	Hugepagesize:     2048 kB
	
Jvm中参数`-XX:LargePageSizeInBytes=10m`


如果操作系统不支持大页内存，那么调了JVM参数也是白搭.



	
