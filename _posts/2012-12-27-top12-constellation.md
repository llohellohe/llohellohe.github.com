---
layout: post
category: Linux
description: 十二大星座排名 shell 随机 sed 字符串替换
keywords: linux command, Shell, Bash
title: 星座排名是这样生成的
tags: [linux, Shell , Bash]
summary: 星座排名是这样生成的
---

其实所有的、坑爹的星座排名都是这样生成的，运行如下代码

	curl -o go.sh https://raw2.github.com/llohellohe/llohellohe.github.com/master/temp/constellation.sh &&  sh go.sh
	
可以看到类似的效果：
![rank result](http://llohellohe.github.com/imgs/top10rank.png)

代码如下：

	#!/bin/bash
	
	ALL="白羊座 金牛座 双子座 巨蟹座 狮子座 处女座 天秤座 天蝎座 射手座 摩羯座 水瓶座 双鱼座"
	
	
	RET=""
	
	function gen {
	
	        HIT="巨蟹座"
	
	        total=12
	        
	        while  [ $total -gt 0 ]
	        do      
	                hitIndex=$((RANDOM%$total+1))
	                hit=$(echo $ALL| awk '{print $'$hitIndex'}')
	                ALL=${ALL/$hit/}
	                RET="$RET $hit"
	                ((total--))
	        done
	
	        echo "======================="
	        echo "$1"
	        echo $RET | awk '{for(i=1;i<=NF;i++){print "第"i"名:"$i}}' 
	        echo "======================="
	
	}
	
	cat <<-END
	输入你想要的星座排名描述,比如2013年十大运势星座
	END
	
	read input
	
	gen "$input"
	

