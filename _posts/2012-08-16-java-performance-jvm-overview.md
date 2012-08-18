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
2.	非标准选项(非标准)。 以-X开头的参数。
3.	开发者选型(非标准)。 以-XX开头的参数。

对于开发者选项，可以通过 `+`或者`-`号来设置布尔选项。

如`-XX:+AggressiveOpts`,将AggressiveOpts设为true。

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
9.	调用DestroryJavaVM来结束JVM。先会调用java.lang.Shutdown.shutdown()，触发一些钩子和释放函数。


JAVA类加载，复习下JVM规范。
