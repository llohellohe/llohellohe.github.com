---
layout: post
category: linux
description: 介绍使用 amazon 提供的弹性云计算服务 ec2 ，搭建 wordpress 服务。和传统的lampp相比，使用nginx替代apache，提供资源的利用率。本文介绍了mysql,php,nginx和wordpress的安装。
keywords: linux, amazon ec2, 弹性计算,云计算
title: 使用免费的Amazon EC2 服务搭建nginx+wordpress
tags: [linux, amazon ec2, 弹性计算,云计算]
summary: 使用免费的Amazon EC2 服务搭建nginx+wordpress
---
###Amazon EC2和Amazon S3
Amazon Elastic Compute Cloud (Amazon EC2) 是 Amazon 提供的弹性云计算服务，

`C2`的含义是 Cpmpute Cloud，并不是什么第二代的含义。

如同Amazon Simple Storage Service (Amazon S3) 解决了云中的存储问题一样，EC2解决了云中的计算问题。

和其他VPS收费方式不同，EC2完全是按使用收费，用多少付费多少，且没有最低消费。

首次注册EC2的用户，可以免费使用一年的低配服务(8G存储，0.6G内存)，

下文介绍如何注册成为EC2用户，以及登录服务器安装nginx和wordpress。

###注册成为Amazon EC2用户
登录Amazon的[AWS服务](http://aws.amazon.com/)，点击注册成为新会员。

![注册新会员](/imgs/ec2/register.jpg)

过程中需要填写个人基本信息和信用卡，需要注意的是，在填写手机号码的时候，记得填写中国的（+86）。

Amazon会拨打你手机的来验证注册，手机上输入页面上的PIN码即可通过验证。

全部验证通过后，会产生1美元的预售权交易（用于验证信用卡，会返回）。

接着就可以使用EC2了。

###创建免费EC2实例

访问[EC2控制台](https://console.aws.amazon.com/ec2/home)，点击launch instance。

![启动实例](/imgs/ec2/launch.jpg)

选择带`Free tier eligible`字样的实例类型创建即可，创建过程中需要保存key pair 文件，此文件用于 SSH 登录EC2服务器用。

![选择实例类型](/imgs/ec2/select.jpg)

为了安装软件方便，我选了ubuntu。

free tier类型的实例每月可以免费使用750个小时，0.6G内存，免费的存储空间按照操作系统的不同分为6G~8G不等。

一般实例在创建完成几分钟内就可以访问了。



###SSH 登录 EC2 服务器
访问 [instances页面](https://console.aws.amazon.com/ec2/v2/home?region=us-west-2#Instances:)，选择刚才创建的实例，点击CONNECT按钮即可获得登录服务器的用户名和公网IP。

![启动实例](/imgs/ec2/connect.jpg)

![启动实例](/imgs/ec2/connect-method.jpg)


由于SSH使用密钥文件访问时，KEY_PAIR_PEM文件的访问权限不能太大，因此需要先使用

	chmod 400 KEY_PAIR_PEM 
	
将访问权限降低。

然后使用 
	
	ssh -i KEY_PAIR_PEM_PATH USER_NAME@IP
登录。

登录后使用 `sudo su` 可以切换到root权限。


使用下面命令为下一步的安装做准备：

	apt-get update

 
###安装mysql server和client

	apt-get install mysql-server mysql-client
	
安装过程中需要输入root密码。

###安装PHP
由于要使用Nginx，所以这里选择安装带fastcgi版本的php

	apt-get install php5-fpm
	
按需安装相应的PHP模块，这里选择个通用的模块列表

	apt-get install php5-mysql php5-curl php5-gd php5-intl php-pear php5-imagick php5-imap php5-mcrypt php5-memcache php5-ming php5-ps php5-pspell php5-recode php5-snmp php5-sqlite php5-tidy php5-xmlrpc php5-xsl
	
安装完成后

	/etc/init.d/nginx reload
	
###安装并启动Nginx

	apt-get install nginx
	
修改nginx配置文件
	
	vi /etc/nginx/nginx.conf
	
将user改成你的ec2用户名

	user ubuntu;
	
同时在events配置中，加上

	use epoll;
	
修改虚拟主机配置 

	vi /etc/nginx/sites-available/default	

在 server配置段中加入

        location ~ \.php$ {
                try_files $uri =404;
                fastcgi_pass 127.0.0.1:9000;
                fastcgi_index index.php;
                include fastcgi_params;
        }


完成后启动：
	
	/etc/init.d/nginx start
	

###测试Nginx是否启动

在EC2上运行

	curl http://localhost

如果输出welcome nginx 字样，说明nginx安装成功。	

###开放外部80端口访问
由于EC2的80端口默认不对外开放，因此在外部无法直接使用IP访问。

访问[Security Groups](https://console.aws.amazon.com/ec2/home?region=us-west-2#s=SecurityGroups)页面。

选择一个安全配置文件（和instances中配置的安全策略文件对应），然后开放80端口的访问。

![开放80端口](/imgs/ec2/open-80.jpg)

###安装wordpress
安装过程不赘述，下载wordpress，并解压到WORD_PRESS_PATH目录。

再次修改 `/etc/nginx/sites-available/default`文件，

将root目录改成 WORD_PRESS_PATH。

其它简要步骤如下

1.	创建wordpress数据库
3.	将wp-config-sample.php文件重名为wp-config.php，同时修改相关数据库相关配置
4.	浏览器中访问/wp-admin/install.php 完成安装


参考资料：

1.	[ubuntu 12.04 安装 Nginx+PHP5 (PHP-FPM) +MySQL主机详解](http://imcn.me/html/y2012/11870.html)
2.	[Amazon AWS EC2免费一年的云VPS申请教程](http://www.zhixiu86.com/bencandy.php?fid-72-id-2079-page-1.htm)
3.	[Amazon EC2常见问题](http://aws.amazon.com/cn/ec2/faqs/)

