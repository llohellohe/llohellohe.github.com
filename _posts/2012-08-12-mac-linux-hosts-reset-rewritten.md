---
layout: post
category: mac
tags : [hosts, mac, linux]
keywords: hosts被重写,重启后hosts被重写,hosts rewitten after reboot
description: mac linux /etc/hosts文件重启后被重写问题解决，Cisco AnyConnect的/etc/hosts.ac文件是问题的原因，
summary: 解决Mac重启后，hosts被重写的问题。
title: hosts重启后被重写
---

## 重启后 /etc/hosts 被重写的问题
以前发现在Ubuntu重启后，`hosts` 文件又恢复到了修改前，十分奇怪。

一开始觉得是Linux的问题，最近在Mac上同样的现象又出现了。

查看 /etc/目录下，发现了两个一摸一样的文件,`hosts`和`hosts.ac` ，vimdiff一下，居然一模一样！

看来原因找到了。

### Cisco AnyConnect 捣的鬼
仔细回想了一下，发现/ect/hosts.ac是出现在 VPN 客户端:`Cisco AnyConnect`后，

这货每次在重启后，都会把/etc/hosts重新覆盖一遍。

所以,除非你同时修改了/etc/hosts.ac 文件，否则单独只修改/etc/hosts都会被重置。

因此解决方法很简单：

		删除原来hosts.ac
		sudo rm /etc/hosts.ac
		建立软链
		sudo ln -s /etc/hosts.ac /etc/hosts
		
搞定。