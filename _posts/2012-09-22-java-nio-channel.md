---
layout: post
category: Java NIO
description: 《Java Nio》的读书笔记第三章
keywords: java nio, nio, java channel
title: 《Java NIO》 通道
tags: [java, nio, java nio, buffer]
summary: Java NIO Channel
---

###一.基本概念
先看下类结构：
![nio-channles](/imgs/nio-channles.png)

Channel接口只定义了两个方法：
	
1.	isOpen():判断通道是否关闭
2.	close():关闭通道

ReadableByteChannel接口和WritableByteChannel都继承了Channel。

它们分别定义了：

1.	int read(ByteBuffer dst)
2.	int write(ByteBuffer src)

read()\write()方法都以ByteBuffer作为参数，返回读取、写入的字节数。


ScatteringByteBuffer 接口继承了ReadableByteBuffer，可以批量输入到ByteBuffer数组中。


GatheringByteBuffer 接口继承了WritableByteBuffer，可以批量输出到ByteBuffer数组中。