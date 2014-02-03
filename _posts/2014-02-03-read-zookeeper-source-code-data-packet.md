---
layout: post
category: 分布式
description: 本文介绍了分布式协调系统ZooKeeper的数据传输协议实现。
keywords: 分布式,ZooKeeper,ZooKeeper源代码,ZooKeeper数据传输协议,Packet,Jute
title: ZooKeeper源代码解读之数据传输协议Packet
tags: [分布式,ZooKeeper,ZooKeeper源代码]
summary: ZooKeeper源代码解读之传输协议
---
Tips:[ZooKeeper学习目录](https://github.com/llohellohe/zookeeper/blob/master/README.md)

###一.传输包 Packet
Packet是ZooKeeper的传输包，封装了ZooKeeper数据传输所需要的相关信息。

客户端和服务端通过Packet交换数据信息。

包含：

1.	请求头 RequestHeader
2.	响应头 ReplyHeader
3.	请求 Record request
4.	响应 Record response
5.	ByteBuffer bb
5.	客户端路径 cientPath
6.	服务端路径 serverPath
7.	boolean finished
8.	AsyncCallback cb
9.	Object ctx
10.	WatchRegistration watchRegistration
11.	boolean readOnly


####createBB 方法
createBB方法用于将数据写到ByteBuffer中。

写入步骤为：

1.	创建Binary类型的OutputArchive
2.	写入长度字段len,字段长度先为-1
3.	写入header,RequestHeader
4.	如果请求类型为Connect，则写入connect，以及readOnly
5.	如果请求类型不为Connect,则写入request
6.	将OutputArchive装换成ByteArray后，写入到ByteBuffer
7.	最终计算除长度字段外的ByteBuffer长度，并写入ByteBuffer


 	ByteArrayOutputStream baos = new ByteArrayOutputStream();
    BinaryOutputArchive boa = BinaryOutputArchive.getArchive(baos);
    boa.writeInt(-1, "len"); // We'll fill this in later
    if (requestHeader != null) {
        requestHeader.serialize(boa, "header");
    }
    if (request instanceof ConnectRequest) {
        request.serialize(boa, "connect");
        // append "am-I-allowed-to-be-readonly" flag
        boa.writeBool(readOnly, "readOnly");
    } else if (request != null) {
        request.serialize(boa, "request");
    }
    baos.close();
    this.bb = ByteBuffer.wrap(baos.toByteArray());
    this.bb.putInt(this.bb.capacity() - 4);
    this.bb.rewind()



###二.jute简介

apache jute是跨平台的序列化和反序列化工具，用于快速的产生消息体类,以及相对应的读写方法。

[Jute介绍](http://hadoop.apache.org/docs/r1.1.1/api/org/apache/hadoop/record/package-summary.html#package_description)


Jute通过javacc编译rcc.jj文件,生成RCC工具，然后通过RCC使用zookeeper.jute文件生成对应的消息体类。


###三.Zookeeper的Jute配置文件
`zookeeper.jute`文件中定义了各个消息类。

如定义在包`org.apache.zookeeper.data`下定义Id这个消息体，具有schema和id两个字符串属性。

	
	module org.apache.zookeeper.data {
	    class Id {
	        ustring scheme;
	        ustring id;
	    }
	}

如定义在包`org.apache.zookeeper.proto`下定义RequestHeader这个消息体，具有int类型的xid和type属性。

	module org.apache.zookeeper.proto {
	    class RequestHeader {
	        int xid;
	        int type;
	    }
	}

	
###四.消息体的接口Record
所有消息类都继承了接口Record。

RequestHeader和Response也集成了Record接口。

接口Record定义了序列化和反序列化方法，

	public void serialize(OutputArchive archive, String tag)
        throws IOException;
        
    public void deserialize(InputArchive archive, String tag)
        throws IOException
        

接口InputArchive和OutputArchive分别定义了数据的读和写的方法。

jute中包含了Binary\CSV和XML的实现。

####消息体举例：RequestHeader
RequestHeader实现了 Record，用来表示消息头。

RequestHeader中有两个int字段xid和type。

type 定义在OpCode 中，如ping的值为11 ,create为1 。


RequestHeader的序列化方法：

先调用startRecord方法，然后写入两个字段后调用endRecord方法。

	a_.startRecord(this,tag);
    a_.writeInt(xid,"xid");
    a_.writeInt(type,"type");
    a_.endRecord(this,tag)
    
RequestHeader的反序列化方法：

先调用startRecord方法，然后读入两个字段后调用endRecord方法。

	a_.startRecord(tag);
    xid=a_.readInt("xid");
    type=a_.readInt("type");
    a_.endRecord(tag)

