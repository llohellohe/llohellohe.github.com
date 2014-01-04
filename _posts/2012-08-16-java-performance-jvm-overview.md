---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记第三章
keywords: vmstat, java performance, performance tunning
title: JVM Overview
tags: [java, 性能, JVM]
summary: JVM Overview
---

###一.JVM的三大组成部分

1. VM Runtime
2. GC
3. JIT

###VM Runtime

####（一）.命令行选项 Command Line Options
命令行选项分为三种

1.	标准选项。在JVM规范中定义的选项，所有虚拟机实现都必须遵循。
2.	非标准选项(非标准)。 以`-X`开头的参数。
3.	开发者选型(非标准)。 以`-XX`开头的参数。

对于开发者选项，可以通过 `+`或者`-`号来设置布尔选项。

如`-XX:+AggressiveOpts`,将AggressiveOpts设为true 。

简单的参数介绍：


	1.	-XX:-DisableExplicitGC 禁用显示GC
	2.	-XX:MaxNewSize=size 新生代占整个堆内存的大小
	3.	-XX:ErrorFile=./hs_err_pid<pid>.log JVM crash时，将错误信息打印到某个文件
	4.	-XX:-PrintGCDetails 开启GC细节
	5.	-XX:-TraceClassLoading class loader装载细节

具体非稳态参数可以参考：
[中文](http://kenwublog.com/docs/java6-jvm-options-chinese-edition.htm)
[英文](http://www.oracle.com/technetwork/java/javase/tech/vmoptions-jsp-140102.html)
[标准](http://docs.oracle.com/javase/7/docs/technotes/tools/solaris/java.html)

####（二）.VM 的生命周期 VM Lifecycle

1.	解析命令行参数
2.	指定堆大小和JIT类型
3.	指定环境变量，如LD_LIBRARY_PATH,CLASS_PATH
4.	如果命令行参数中没有指定main-class，则从Jar包中的manifest中获取。
5.	使用JNI_CreateJavaVM方法创建JVM.会依次加载各类依赖到的库。
6.	加载main class
7.	使用CallStaticVoidMain方法执行main方法。
8.	当main执行完毕后，使用DetachCurrentThread来介绍线程
9.	调用DestroryJavaVM来结束JVM。先会调用`java.lang.Shutdown.shutdown()`，触发一些钩子和释放函数。


JAVA类加载，复习下JVM规范。

##GC
HotSpot VM使用了分代回收的机制，这个机制建立在两个观察结果之上：

1.	大部分对象很快的会变成不可达
2.	很少存在老对象对新对象的引用

因此内存被分成了几块区域：年轻代、年老代和永久区。

###内存划分：
####(一).年轻代
其中年轻代被分为:Eden和两块survivor区域。发生在年轻代的GC叫做young gc或者minor gc。

因为年轻代比较小，因此young gc通常比较快。

通常年轻代使用的是copy方式，即ygc时，从eden和其中一个survivor的存活对象拷贝到另外个survivor区域。

如果此时eden中存活的对象过大，导致另外个survivor区域放不下，那就直接放到old区，这被成为premature promotion（过早提升）。

如果old区还是不够，则会先出发full gc 后再出发ygc。 


#####Card Table
需要注意的是，为了判断年轻代的对象是否存活，需要观察下是否有从old去到young区的引用。

如果直接扫描old区将非常的耗费，所以会有个一个叫做Card Table的方式。

首先将年老带按照512个字节的大小分成若干份，然后有个叫做card table的数组，如果存在对young区的引用，则将这个下标标记为dirty。

##### 快速的分配对象：TLAB
在分配对象的时候，需要保证线程安全，避免多个对象分配到同个内存区域。

而此时必须加锁，为了避免此成为瓶颈。

便产生了Thread Local Allocation Buffers的概念，线程可以在自己的内存空间内（预先分配给线程的地址空间）分配对象，而不需要加锁，以此来增加吞吐量。

如果对象分配的内存大小超过了TLAB ,那么就必须通过加锁来同步内存地址空间的分配了。

####(二).年老代
年老代放的是生命周期相对比较长的对象。

####(三).永久区
永久区放的通常是Class metadata,interned strings等

###GC的策略
####(一).串行GC
每次GCd的时候，将停止整个应用（Stop World）进行垃圾啊回收。

Mark Compact 收集器将不引用的对象做标记，回收后将剩余对象像对顶压缩，这样可以腾出连续的内存区域。Mark Compact可以用于ygc也可以用于fgc。

串行GC适合用于Client模式。

####(二).并行GC
通过多线程的方式，避免因为GC造成的等待。


####(三).CMS
Concurrent Mark Sweap 并发标记清除。
 
CMS分为初始化标记（initial mark）=》并发标记=》重新标记(remark)=》并发清除(concurrent sweap)等几个阶段。

CMS并不是没有暂停，而是只有两次很小的暂停，初始化标记和重新标记。

其中并发标记是指在CMS开始期间，应用有更新的部分需要从新标记，此时可以起多个线程标记。Remark阶段也可以起多个线程同时标记。

并发清除的并发是指垃圾回收和应用同时进行。

注意两个并发的区别。

CMS并不会进行碎片压缩。


####(四).Garbage First(G1)
G1垃圾回收将内存切割成一小块一小块的区域，它是下一代的垃圾回收器。

G1意味着可以使用不连续的区域组成年老代和年轻代，也以为着可以动态调整年轻代大小。

比起CMS，优势如下：

1.	不再具有内存碎片
2.	可以精确控制停顿时间

ps:以上部分需要深入了解下，尤其是G1。

####参考资料

	http://www.iteye.com/topic/473874
	http://blog.csdn.net/java2000_wl/article/details/8030172
	http://blog.csdn.net/chjttony/article/details/7883748
	
