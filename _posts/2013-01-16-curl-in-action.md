---
layout: post
category: Linux
description: curl 的用法，使用curl get post 提交表单，提交文件，保存cookie，带cookie访问
keywords: curl用法，curl post,curl get,curl 提交文件
title: curl使用
tags: [curl, bash, linux]
summary: curl 的用法，使用curl提交表单，get ,post
---

#####从打开百度开始

	curl "http://www.baidu.com"
	
你就会看到百度的页面源代码输出。

在URL前后带上双引号总是个好习惯。避免当url中有`&`等符号时候的错乱。

![image](http://llohellohe.github.com/code/learning-curl/imgs/first-baidu.png)

#####保存页面:
	
	curl "http://www.baidu.com" > /tmp/baidu.html

你会看到一条进度条，然后源码就被重定向到了/tmp/baidu.html。

可以在浏览器中输入file:///tmp/baidu.html看到一张完整的百度首页。

当然下载页面用`-o`参数看上去更加高级一点。

	curl -o /tmp/baidu2.html "http://www.baidu.com"
	
如果URL中具有文件名，那么使用 `-O` 参数也会更方便些，它将直接用url中的文件名称来保存页面。

#####安静点

`-s`参数可以屏蔽进度条之类的输出，稍微清净点。
	
	curl -s -o /tmp/baidu3.html "http://www.baidu.com"
	
#####指定USER-AGENT

`-A`参数用来指定USER-AGENT，来看一段PHP代码。

	<?php
		$LINE_END="\n";
		foreach ($_SERVER as $key => $value) {
		echo "$key => $value $LINE_END";
		}
	?>

用来打印一些基本信息。默认情况下。

可以看到下图：

![image](http://llohellohe.github.com/code/learning-curl/imgs/basic.png)

默认CURL的User-agent为：
	
	curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5

修改User-agent
	
	curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17" http://localhost/learing-curl/show-server-info.php
	


#####指定referer

	curl -e "https://www.google.com/"  http://localhost/learing-curl/show-server-info.php


#####Get请求

先看下面的PHP代码，用于展示GET和POST的表单参数：

	<?php

		foreach ($_GET as $key => $value) {
			echo "param $key : $value\n";
		}
		
		echo "=======POST INFO=======\n";
		
		foreach ($_POST as $key => $value) {
			echo "param $key : $value\n";
		}
	?>

	
	curl "http://localhost/learing-curl/post-get.php?name=a&age=13"
	
可以看到下面的输出：

![image](http://llohellohe.github.com/code/learning-curl/imgs/get.png)
	

#####Post请求
	
	curl   -d "name=1&age=3" http://localhost/learing-curl/post-get.php
	
可以看到下面的输出：

![image](http://llohellohe.github.com/code/learning-curl/imgs/post.png)

	
`-d`参数指定表单以POST的形式执行。

`-G`强制指定表单以GET方法提交。

#####只展示Header
	
	curl -I  http://www.baidu.com
	
可以看到下面的输出：

![image](http://llohellohe.github.com/code/learning-curl/imgs/header.png)


#####保存Header

	curl -D header.txt http://www.alibaba.com
	
#####处理重定向
	
http://localhost/learing-curl/302.php是张会302重定向到百度的页面。

源代码如下：
	
	<?php
		$url="http://www.baidu.com";
		header("Location: $url");
	?>
	
	curl "http://localhost/learing-curl/302.php" 

发现什么都没有输出。

我们来看下返回的header。
	
	curl -I "http://localhost/learing-curl/302.php" 
	
虽然返回了302信息，但是
	
默认curl是不会处理重定向的，可以通过`-L`参数指定。
	
	curl -L "http://localhost/learing-curl/301.php"
	
这样又能看到熟悉的百度页面输出了。
	
#####提交文件

	curl -F upload_file=@test.data http://localhost/learing-curl/upload.php
	
其中upload_file是表单中文件的input名称,test.data是文件路径

提交文件的时候，同时提交其它POST请求，
	
	curl -F upload_file=@test.data -F "name=yangqi" http://localhost/learing-curl/upload.php

upload.php源代码：

	<?php
		$upload_file=$_FILES['upload_file']['tmp_name'];  
		$upload_file_name=$_FILES['upload_file']['name'];
		
		move_uploaded_file($upload_file,"/tmp/$upload_file_name");
		
		
		foreach ($_POST as $key => $value) {
			echo "param $key : $value\n";
		}
		
	?>

####保存cookie
`-c` 将会用标准格式保存cookie

	curl -c cookie.txt http://www.alibaba.com
	
查看cookie.txt会发现一堆cookie，接近1k	

####带Cookie访问 -b 或者--cookie

curl -b "name=data" 或者让 curl -b COOKIE.txt 可以带cookie访问页面。

先来看下测试页面的php源码：

	<?php
	setcookie("age",201);
	
	echo "COOKIE IS \n";
	foreach ($_COOKIE as $key => $value) {
		echo "$key => $value\n";
	}

	?>
	
	先设置一个名为age的cookie，然后打印请求中的cookie。

我们请求下：	

![image](http://llohellohe.github.com/code/learning-curl/imgs/cookie.png)

如果-b后面的参数没有出现=号，则会认为是文件名。

![image](http://llohellohe.github.com/code/learning-curl/imgs/with-cookie.png)

###实例：

####有道字典查询

通过-G -d 的形式提交一个get请求到有道字典，然后截取翻译信息。
	
	curl -s -d "q=$KW&le=eng&keyfrom=dict.top" -G  "http://dict.youdao.com/search"  | grep -A 5 'class="trans-container"'   | grep '<li>' | sed -e 's:[<li></li>]::g'


