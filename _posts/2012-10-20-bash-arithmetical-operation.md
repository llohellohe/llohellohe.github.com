---
layout: post
category: Bash
tags : [linux, shell, bash, 算术操作]
keywords: bash, 算术操作
description: 本文介绍了如何在Bash中执行算术操作，加减乘除等。
summary: bash中的算数操作
title: BASH中的算术操作
---


本文将介绍下在Bash下的简单算术操作和字符串操作，当然虽然Bash很强大，但是有些算术和字符串功能还是直接使用高级语言比较好。

### 算数操作

####(一).双括号

	i=1
	((j=(i+20)-1*3))
	echo $j  
	##j=18
最简单的就是双括号来进行算术运算，双括号里面支持 + - * / 去模等运算方式。

如果需要把返回值赋值的话，可以使用$(())

	h=$((j=(i+20)-1*3))
	echo $h

双括号支持自增操作：
	
	i=1
	((i++))
	echo $i

####(二).let

let是Bash自带的函数，使用let也可以完成算术操作

	i=1
	let "k=(i+20)-1*3" 
	echo $k
	##j=18
	
在使用`let`时，加上双引号总是个好习惯。

`let`也支持自增操作：
	
	i=1
	let "i++"
	echo $i
	let "i+=10"
	
####(三).expr
使用expr也可以拿到算术结果，不过比较恶心的是必须保证数字和运算符号之间必须有空格,而且不要带上双引号，因为带上双引号的话，expr命令会认为参数只有一个。

	i=2
	z=$(expr 10 + 2 - 1 )
	echo $z
	##z=11
	
####(四).bc
bc是个小型的计算器，你可以`bc`下，它会出现一个轻便的计算器，但是功能十分强大。

	l=$(echo "(20+1)*2" | bc)
	echo $l
	##l=42

所有源代码示例可以在此[查看](https://github.com/llohellohe/shell-world/blob/master/suanshu.sh)。