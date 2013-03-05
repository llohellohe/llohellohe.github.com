---
layout: post
category: mac
tags : [hosts, mac, linux]
keywords: hosts被重写,重启后hosts被重写,hosts rewitten after reboot
description: mac linux /etc/hosts文件重启后被重写问题解决，Cisco AnyConnect的/etc/hosts.ac文件是问题的原因，通过mh脚本可以解决这个问题。
summary: 解决Mac重启后，hosts被重写的问题。
title: hosts重启后被重写及解决方案
---


以前发现在Ubuntu重启后，`hosts` 文件又恢复到了修改前，十分奇怪。

一开始觉得是Linux的问题，最近在Mac上同样的现象又出现了。

查看 /etc/目录下，发现了两个一摸一样的文件,`hosts`和`hosts.ac` ，vimdiff一下，居然一模一样！

看来原因找到了。

### Cisco AnyConnect 捣的鬼
仔细回想了一下，发现/ect/hosts.ac是出现在 VPN 客户端:`Cisco AnyConnect`后,hosts.ac应该是any client的缩写。

这货每次在重启后，都会把/etc/hosts重新覆盖一遍。

所以,除非你同时修改了/etc/hosts.ac 文件，否则单独只修改/etc/hosts都会被重置。

####下面开始实验证明一下

#####首先测试下做个软链是否有效：


	删除原来hosts.ac
	sudo rm /etc/hosts.ac
	建立软链
	sudo ln -s /etc/hosts.ac /etc/hosts
		
重启后发现，两个hosts文件都不在了。。。悲剧 。

#####尝试反着操作
	删除原来hosts
	sudo rm /etc/hosts
	建立软链
	sudo ln -s /etc/hosts /etc/hosts.ac
		
再次重启，发现软连接消失了，依旧变成了连个一模一样的hosts.ac 。

### 实验证明
每次重启，hosts.ac都会重新复制给hosts，

所以如果你希望hosts保留的话，每次修改hosts后，请同时复制给hosts.ac文件


如果不小心被误删除了，可以使用原始的hosts文件内容恢复：
		
	255.255.255.255 broadcasthost
	::1             localhost
	fe80::1%lo0     localhost
	
### 偷懒的解决方案

在BASH的PATH目录下，创建`mh`脚本，以后通过这个脚本修改hosts文件

	#!/bin/bash

	#!/bin/bash
##modify hosts

		if [ -f /etc/hosts ];then
		        echo "/etc/hosts exists,back up to ~/hosts.bak"
		        cp /etc/hosts ~/hosts.bak
		        sudo rm /etc/hosts
		fi
		
		if [ ! -L /etc/hosts ];then
		        echo "link /etc/hosts.ac => /etc/hosts"
		        sudo ln -s /etc/hosts.ac /etc/hosts
		fi
		
		sudo vi /etc/hosts.ac
                        
		