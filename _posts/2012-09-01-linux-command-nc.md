---
layout: post
category: Linux
description: Linux命令和Shell脚本
keywords: linux command, Shell, Bash
title: nc命令替代scp
tags: [linux, Shell , Bash]
summary: 使用nc传输文件
---

##scp传输文件
每次使用scp传输文件总需要输入密码，虽然可以通过建立通道解决重复输入密码的问题，但有时候实在是不方便。

##nc出马

###传输文件
nc命令可以方便的解决传输文件需要密码的问题，用法很简单

	machine1:nc -l 1234 < FILE
	##1234是端口
	
	machine2:nc IP 1234 > FILE
	
这样就通过nc建立了两台机器的断口连接，通过这个端口可以达到文件传输的目的。


###聊天
当然也可以用类似方法进行聊天：
	
	machine1:nc -l 1234
	hi
	
	machine2:nc IP 1234
	hi
	
	
	
	
###替代telnet

可以用来替代telnet，比如操作memcached
	
	yangqio2rmbp:bin yangqi$ nc 127.0.0.1 11212
	stats
	STAT pid 20310
	STAT uptime 43192
	STAT time 1346466979
	STAT version 1.4.13
	
更多nc的用法和原理，请 man nc。 
	