---
layout: post
category: Linux
description: 使用grep sed curl 等 压缩和优化页面
keywords: linux command, Shell, Bash
title: BASH压缩和优化页面
tags: [linux, Shell , Bash]
summary: BASH压缩和优化页面
---

今天很郁闷，就郁闷的写了个用BASH压缩html页面的脚本。

作为菜鸟，欢迎大家优化。

该脚本简单实现了：

1.	合并多个JS到一个文件，同时出去多余空格，单行`/* */`注释,空行
2.	合并多个CSS到一个文件，同时出去多余空格，单行`/* */`注释,空行
3.	将合并后的JS放到页面底部
4.	将合并后的CSS放到页面顶部

脚本下载地址：http://llohellohe.github.com/temp/tunning.sh

当然你可以直接运行

	curl -o go.sh http://llohellohe.github.com/temp/tunning.sh &&  sh go.sh
	
你会发现本地多了个b.html .
然后在浏览器里面运行 file:///XXXXX/b.html 即可。

###脚本解释
#####（一）.下载测试页面

	curl -o a.html  "http://llohellohe.github.com/temp/a.html"

`-o` 参数可以指定下载的文件名，此处指定为a.html

a.html 里面的内容很简单，引用了3个js和2个css.

	
	<html>

	<script src="http://llohellohe.github.com/temp/test1.js"></script>
	<script src="http://llohellohe.github.com/temp/test2.js"></script>
	<script src="http://llohellohe.github.com/temp/test3.js"></script>
	<link rel="stylesheet" type="text/css" href="http://llohellohe.github.com/temp/test1.css" />
	<link rel="stylesheet" type="text/css" href="http://llohellohe.github.com/temp/test2.css" />
	<body>
	<div   id="wrapper">
	<a href="#"     onclick="foo3()"> hello     </a>
	</div>
	</body>
	
效果就是一条不是很粗的黑条和一个hello，点击hello会弹出个窗口说一句话。


#####（二）.处理JS

指定统一的文件名`JS_NAME=${PAGE%%.html}.js` 

此处用到了bash的字符串匹配，将a.html替换成a.js 。
	
	grep -E -o '(http://.*.js)'

其中`-o` 用于grep 只输出行中匹配的部分。即为：

	http://llohellohe.github.com/temp/test1.js
	http://llohellohe.github.com/temp/test2.js
	http://llohellohe.github.com/temp/test3.js


	for js in $JSS
	do
        curl "$js" | sed '/\/\*/d' | sed -e 's/\( \)\{1,\}/\1/g' |  sed '/^$/d'  >> $JS_NAME
	done
遍历这些js，将其下载下来，并且使用sed去除单行注释、去除多个空格、去除空行，并重定向到统一的js文件中 。

#####（三）.处理CSS
同上

#####（四）.将JS放在页面底部，将CSS放在页面顶部

	cat $PAGE | sed '/.js/d' | sed '/.css/d' | sed -e 's:</body>:<script src="'$JS_NAME'"></script></body>:g' | sed -e 's:<body>:<lin rel="stylesheet" type="text/css" href="'$CSS_NAME'" /><body>:g' | sed -e 's/\( \)\{1,\}/\1/g' | sed '/^$/d' > b.html
	
	
原理是将<body>替换成CSS标签+body,将</body>	替换成JS+body

然后就是去除多余空格、去除空行 

##### （五）.一些不足


1.	压缩很简单，对于引号内，尖括号后的空格没有压缩。
2.	因为对于sed不是特别擅长，有些地方多次使用了sed
3.	还有很多，管它呢，本来就是写着玩玩的
