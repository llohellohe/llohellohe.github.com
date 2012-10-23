---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记第四章
keywords: vmstat, java performance, performance tunning
title: JVM Overview
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