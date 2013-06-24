---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记第四章
keywords: vmstat, java performance, performance tunning
title: JVM Performance Monitor
tags: [java, 性能, JVM]
summary: JVM Performance Monitor
---



###Seciont 1:GC

####GC的详情：-XX:+PrintGCDetails
可以开启GC详细信息，如下代码：
	
		Map<Integer, String> map = new WeakHashMap<Integer, String>();

		int i = 0;
		for (;i<10;i++) {
			map.put(i, new String("more memory!")+i);
		}
		for (;;i++) {
			map.put(i, new String("more memory!")+i);
			if(i%10000==0)
			System.out.println(i+":"+map.size());
		}

使用如下参数运行：

	-XX:NewSize=30m -XX:MaxNewSize=30m -XX:NewRatio=3 -XX:NewSize=5m -XX:+UseSerialGC  -XX:+PrintGCDetails
	
	
可以看到
	
	[GC [DefNew: 27648K->3071K(27648K), 0.0280012 secs] 98173K->84120K(153600K), 0.0280202 secs] [Times: user=0.03 sys=0.00, real=0.02 secs] 


其中DefNew说明使用了串行回收器，27648K是young区回收前的占用，3071K是回收后的占用，括号里面的27648K是整个young区的大小。

98173K是heap区在回收前的大小，84120K是回收后的，括号里面的153600K是整个heap的大小。

####打印时间：-XX:+PrintGCDateStamps
使用此参数可以打印时间信息
	
	2012-10-23T18:18:26.075+0800: [GC [DefNew: 27647K->3072K(27648K), 0.0279851 secs] 123036K->106444K(153600K), 0.0280028 secs] [Times: user=0.03 sys=0.00, real=0.03 secs] 3840000:168419
	


`-XX:+PrintGCTimeStamps` 可以显示从程序启动开始的时间

	9.432: [GC 9.432: [DefNew: 24576K->3072K(27648K), 0.0332439 secs] 139454K->128392K(219116K), 0.0332637 secs] [Times: user=0.03 sys=0.00, real=0.03 secs] 
10930000:232757

####查看GC导致的应用暂停时间
-XX:+PrintGCApplicationConcurrentTime和-XX:+PrintGCApplicationStoppedTime

	Application time: 0.0354146 seconds
	1.271: [GC 1.271: [DefNew: 27647K->3072K(27648K), 0.0298471 secs] 95006K->80871K(153600K), 	0.0298711 secs] [Times: user=0.03 sys=0.00, real=0.03 secs] 
	Total time for which application threads were stopped: 0.0299554 seconds


其中-XX:+PrintGCApplicationConcurrentTime 显示的是和应用并发进行的GC时间。上面的Application time。

-XX:+PrintGCApplicationStoppedTime则为应用暂停后的GC时间。上面的Total time for...
####显示调用的System.gc()
对于显示调用的GC，可以看到具有（System）

	[Full GC (System)    [PSYoungGen: 99608K->0K(114688K)]    [PSOldGen: 317110K->191711K(655360K)]    416718K->191711K(770048K)    [PSPermGen: 15639K->15639K(22528K)],    0.0279619 secs]    [Times: user=0.02 sys=0.00, real=0.02 s
    
    
###Seciont 2:观察GC的工具
#####jconsole
系统自带的监测工具，直接启动，连接上即可。

对于远程应用，需要这个应用在启动的时候带上参数`-Dcom.sun.management.jmxremote`

jconsole可以实时查看系统的堆、非堆等情况。

其中非堆部分有一块叫做Code Cache的区域，这是给JIT使用的内存，以及用来存储编译后代码的地方。


#####virtual vm
使用virtual vm 可以观察本地和远程的java进程。

观察远程时，必须在远程启动jstatd，方可连上。

ps:jps 也可以观察远程的java进程。

virtual vm 不但可以直接dump内存查看，也可以查看heap 的dump文件。

	jmap -dump:format=b,file=/tmp/map.hprof 4491  
可以直接file=>load 打开dump的内存并分析。
######virtual gc
可以在virtual vm中安装virtual gc插件，可以查看GC时的图标信息。  
ps: 
a.`-verbose:class` 可以查看class的加载信息
b.jstack 查看死锁信息时比较有用，注意查看多个线程等待的锁的地址信息(下面的0x22e88b10)。



	waiting to lock <0x22e88b10> (a Queue)
	at Queue.enqueue(Queue.java:31)	- waiting to lock <0x22e88b10> (a Queue)
	
	