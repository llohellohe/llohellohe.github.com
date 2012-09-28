---
layout: post
category: Java Network
description: Java 网络编程基础, Java IP地址, Java InetAddress用法,以及Socket地址的表示。
keywords: java network, java socket, java InetAddress, Socket Address 用法, InetSocketAddress用法。
title: IP地址和Socket地址：InetAddress、InetSocketAddress
tags: [java, java network, InetAddress, Inet4Address, Inet6Address, InetSocketAddress]
summary: Java IP地址和Socket地址的表示InetAddress、InetSocketAddress，以及用法。
---
###一.IP地址的代表类：InetAddress

InetAddress代表IP协议的地址，它的两个子类Inet4Address和Inet6Address分别代表IPv4和IPv6协议。
ps:IP协议是UDP\TCP协议的基础。

InetAddress可以获得：	
	
	1.主机名：getHostName()
	2.主机IP地址:getHostAddress()
	

Java使用DNSNameService正向通过主机名获得IP地址，或者通过IP地址反向解析得到主机名。

对于DNS解析结果，会缓存一定的时间，具体实现参看JDK源码。

DNS解析在Linux下可以通过`host`命令。

InetAddress不能被直接实例化，但是可以通过主机名或者ip地址获得。

	InetAddress address=InetAddress.getLocalHost();
			
	InetAddress address2=InetAddress.getByName("www.hupu.com");
			
	InetAddress address3=InetAddress.getByName("74.125.128.106");
	
	InetAddress address4=InetAddress.getByAddress(new byte[]{10.16.26.21});


通过主机名获得时，也可以以IP地址的形式。

通过getAddress()可以获得以byte形式的IP地址，由于byte最大127，表示128~255之间的IP时需要作次位运算转换，参看IPAddressUtil.IPAddressUtil(string) 源码。

对于IPv4的地址，返回的byte[]长度是4的，而IPV6地址的byte[]长度为8。

IPv6地址总共有8段，每段用16进制表示，连续的0可以表示：：，但是只能出现一次。

比如2001:da8:9000::7


###InetAddress源代码[查看](https://github.com/llohellohe/cp/blob/master/src/yangqi/net/InetAddressRunner.java)

###二.Socket地址代表类：InetSocketAddress
Socket地址可以IP地址(InetAddress)+端口的表示。

因此创建InetSocketAddress有三种方法：

	1.new InetSocketAddress(int port):将内部通过InetAddress.anyLocalAddress()创建一个通配的IP地址[0.0.0.0或者::0]。
	2.new InetSocketAddress(String host,int port):将内部通过InetAddress.getByName(host)创建一个通配的IP地址。
	3.new InetSocketAddress(InetAdress address,int port)。
	
最终都将装换为InetAddress+port表示的形式。

	0.0.0.0代表网络上的所有主机，而非广播地址。广播地址是255.255.255.255






