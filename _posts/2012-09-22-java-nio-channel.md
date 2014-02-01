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


ScatteringByteChannel 接口继承了ReadableByteChannel，可以批量输入到ByteBuffer数组中。

Scattering Read 用于将通道中的数据读入到多个Buffer中，比如分开处理消息头和消息体。


GatheringByteChannel 接口继承了WritableByteChannel，可以批量输出到ByteBuffer数组中。

Gathering Write用于将多个Buffer写入到同个Channel中。

###二.文件通道

FileChannel总是阻塞的，它实现了ByteChannel\ScatteringByteChannel\GatheringByteChannel\同时实现了AbstractInterruptiableChannel。

FileChannel只能通过FileInputStream\FileOutputStream\RandomAccessFile的getChannel（）方法获得。

####文件大小
FileChannel.size()可以返回文件的大小，
File.length()同样可以返回文件大小，经过测试，使用File.length()比FileChannel获得文件大小快。

###三.Socket通道

Socket通道由SocketChannel,DatagramChannel,ServerSocketChannel组成，

其中SocketChannel,DatagramChannel继承了AbstractSelectableChannel,实现了ByteChannel

\ScatteringByteCHannel和GatheringByteChannel。

![nio-channles](/imgs/nio-socket-channles.png)

由于ServerSocketChannel只用于生成SocketChannel，本身不传输数据，故它只继承了AbstractSelectableChannel。

如果使用传统方式创建Socket，那么调用getChannel()将始终返回null。


####（一）.ServerSocketChannel
通过ServerSocketChannel.open()创建ServerSocketChannel，

通过配置configureBlocking（false）可以将其设置为非阻塞模式。


