---
layout: post
category: Java NIO
description: 《Java Nio》的读书笔记第二章
keywords: java nio, nio, java buffer
title: 《Java NIO》 缓冲区
tags: [java, nio, java nio, buffer]
summary: Java NIO Buffer
---

###一.基本概念
####(一).属性
所有缓冲区都继承自抽象类java.nio.Buffer。类Buffer只有一个默认包权限的构造器:
	
	 Buffer(int mark, int pos, int lim, int cap)
	 


Buffer具有四个属性：

1.	capacity:缓冲器的容量。
2.	limit:缓冲器中第一个不能读或者写的位置。
3.	position:下一个要读或者要写的位置。
4.	mark:标记位置，类似书签；调用mark方法将使mark=position

这四个属性的关系始终如下：
0<=mark<=position<=limit<=capacity 。

对应的：

1.	capacity()返回当前的capacity值；显然容量大小是固定的，不能再设置。
2.	limit()返回当前的limit值；limit(int limit)设置limit值。
3.	position()返回当前的position值；position(int pos)设置positio值。
4.	mark()设定mark=position;markValue()返回当前的mark值,不过它的权限是包私有的。为啥？

###二.基本操作（CharBuffer为例）
抽象类Buffer具有7个抽象子类（分别对应Java的7个基本类型（布尔类型除外））。

1.	ByteBuffer
2.	CharBuffer
3.	ShortBuffer
4.	IntBuffer
5.	LongBuffer
6.	FloatBuffer
7.	DoubleBuffer

#####创建
allocate方式：

通过ChaBuffer.allocate(int capacity),将创建HeapCharBuffer的一个实例。
其中HeapCharBuffer是CharBuffer的一个子类，但是是包私有的。
	
	CharBuffer charBuffer=CharBuffer.allocate(10);
	
它将创建一个capacity\limit为10的缓冲器，同时将创建大小为10的char数组作为内部容器（名为hb）。

wrap方式：

通过传入一个char数组来创建CharBuffer。

	CharBuffer charBuffer=CharBuffer.wrap(char[]xx);
最终同allocate方式类似，只不过不再创建char数组，而是直接使用传入的数组。


#####读写
CharBuffer中只定义了抽象的put()和get()系列方法，具体的实现是放在相应子类里面的。

在HeapCharBuffer中，put(char x)方法，首先将position++，当position，大于limit的时候，将抛出BufferOverflowException 。如果正常，将在char数组的position位置放入x。

同样的,get()方法，首先将position++，当position，大于limit的时候，将抛出BufferOverflowException 。如果正常，将返回position对应位置的元素。

所以，无论读写，最好通过hasRemaining方法判断是否position超过了limit。

因此如果读写先后发生，由于position都会++，必须在写完后调用flip（）翻转或者rewind()倒回。

其中：flip方法

将把limit设置成当前写完后的position,表示这是第一个不能读的位置。同时将position置为0。mark=-1。

而rewind方法，不会将limit设置为当前的position。

这样才能数据。

		CharBuffer charBuffer=CharBuffer.allocate(10);
		
		String a="hello";
		
	    for(int i=0;i<a.length();i++){
		charBuffer.put(a.charAt(i));
		}
		charBuffer.flip();
		while(charBuffer.hasRemaining( )){
			System.out.println(charBuffer.get());
		}


为了效率，读和写均具有批量处理的方法。

Buffer的写入一般分为以下四个步骤：

1.	写入数据到Buffer
2.	调用flip方法，从写模式切换到读模式（将position置为开始）
3.	从Buffer中读取数据
4.	调用clear或者compact方法

#####flip 读写模式切换
flip方法用于读写模式的切换。

写完数据后，flip方法将limit置为position,position置为0。


#####clear 清理
clear方法将Buffer中的position置为0，limit置为capacity。

clear表示将Buffer清空，如果Buffer中有未读完的数据，那么将被遗忘。

#####compact 合并
如果有没有读完的数据，compact将把数据整块放置到Buffer的开始出，然后position置为下一个空的位置。


#####复制
复制时，将创建一个新的HeapCharBuffer实例，但是char[]数组是直接传递的，因此对于元素的任何修改，都将影响到其它heap buffer。

#####标记
使用reset()将使position重新回到mark设置的地方（对于某些解析处理，这个将非常有用）。如果mark小于0，则会抛异常。

flip(),clear(),rewind()方法总是会将mark设置为-1。


###二.字节缓冲区

同CharBuffer类似，字节缓冲区也有HeapByteBuffer等实现子类。

额外的，字节是有高位在先和低位在先的区别的，可以通过order方法指定。

ByteOrder则封装了低位和高位的两种顺序。
####（一).直接缓冲区
直接缓冲区通常是I/O操作的最好选择，它性能最高，但是创建直接缓冲区可能会成本更大，而且直接缓冲区不受Java堆栈控制，这可能是个问题。

创建:ByteBuffer.allocateDirect(int cap);

#### (二).视图缓冲区、数据缓冲区。
通过调用ByteBuffer.asCharBuffer()，将创建ByteBuffer的Char视图，它将Byte转成Char展示（调用Bits.getX()方法）。
其它5种Buffer可以通过类似方法创建。

通过ByteBuffer.getChar()将得到一个Char字符。

字节缓冲区的数据提取均是通过java.nio.Bits类的相关操作实现的，同样需要注意BIG_ENDIAN和LITTLE_ENDIAN区别。
