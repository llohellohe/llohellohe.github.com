---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记，第一章和第二章
keywords: vmstat, java performance, performance tunning
title: 操作系统的性能监测
tags: [java, 性能, 操作系统]
summary: 操作系统的性能监测
---

##一.性能优化的指导准则
性能优化有两种基本的方法：

1.	自上而下（Top Down）,即从应用端逐步分析到底层。
2.	自下而上 （Bottom Up）,即从底层逐步分析到应用端。


两者适合于解决不同的性能问题。

 

##二.操作系统的性能监测 
一些概念：

1.	性能监测 performance monitor:用于检测性能数据
2.	性能分析 performance profile:用于诊断性能问题，通过性能检测的数据或者其它得出性能问题的结论
3.	性能调优 performance tunning:用于优化性能，修改源代码等

###(一).CPU的使用率 


cpu的使用率包含用户态的使用率和内核（系统）态的使用率。

如果发现内核/系统态的使用率过高，很有可能是I/O设备交互频繁或者是共享的资源竞争频繁。

#### vmstat命令 
监测CPU的使用率可以使用`vmstat`命令
如每10秒打印一次：

	vmstat 10 
	procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
	r b swpd free buff cache si so bi bo in cs us sy id wa
	0 0 484100 262056 453412 325828 0 0 7 9 5 14 3 1 96 0
	0 0 484100 262056 453412 325828 0 0 0 0 208 245 1 1 98 1
其中us为用户态所占的cpu,sy为系统态所占的cpu。


如果需要查看指定的cpu，可以使用mpstat -p CUP_NUM。

#### 额外的

TOP等命令可以实时看到CPU状态。

* H可以查看轻量级进程（lightweight process）。
* f查看需要显示的列。
* o可以排序。
 

在Java中可以通过 `Runtime.availableProcessors()`这个native获得实际的cpu个数。

###二.CPU调度器的运行队列

running queue里面放的是系统的轻量级进程（lightweight process）。

一般running queue的大小为处理器的1倍以内比较理想。

如果大于3~4倍则需要关注下，在JVM层，可以考虑优化算法和数据结构；
一般JIT Complier会优化复杂的代码；

`vmstat`同样可以观察RunningQueue	
 

下图的第一列r，代表running queue

	procs -----------memory---------- ---swap-- -----io---- --system-- -----cpu------
	r b swpd free buff cache si so bi bo in cs us sy id wa st
	0 0 242620 2068548 205240 2458640 0 0 1 7 0 0 1 0 99 0 0

###三.内存使用率

当系统的物理内存即将耗尽时，系统会使用交换分区进行swap in ,swap out操作。又称page in,page out.

对于GC来说，如果GC发生在系统内存耗尽，频繁使用page in ,page out的话，会十分耗性能。

因为GC需要遍历内存对象，以确定对象是否可以回收。

vmstat的si so分别对应swap in , swap out。

 

###四.Context Switiching,InVoluntary Context# Switching

Involuntary Context Switching是指非主动的不占用CPU,而是由于超时等原因导致的不占用CPU。


###五.线程迁移

一般来说，对于非运行状态的线程需要重新运行时，操作系统会优先把它放到之前运行过的处理器中。

如果该处理器十分繁忙，则会将线程迁移到其它处理器，这个过程叫Tread Migration。

###六.网络 I/O

Network I/O也会影响程序的性能；

如果网络延迟严重、或者数据一直在网卡缓冲区排队，都会影响到程序的性能。

尽量使用Java的NIO代替原来的Blocking Socket。 

###七.磁盘 I/O
磁盘I/O往往是性能监测的重点，可以使用`iostat`命令查看磁盘的负载状态。

	iostat -x
	avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.54    0.02    1.28    0.31    0.00   95.86

	Device:         rrqm/s   wrqm/s     r/s     w/s    rkB/s    wkB/s avgrq-sz avgqu-sz   	await r_await w_await  svctm  %util
	sda               0.42     3.92    1.35    1.38    14.09    21.02    25.72     0.03   	12.50    4.30   20.50   3.21   0.88
	
其中:
* %iowait 是指cpu等待I/O设备的空余时间
* %idle 是指cpu的空闲时间（不等待I/O设备） 
* rrqm/s 每秒合并的读请求数,read request merged / s 
* wrqm/s 每秒合并的写请求数,write request merged / s
* r/s 每秒读请求数
* w/s 每秒写请求数
* rKB/s 每秒读入数
* wKB/s 每秒写入数