---
layout: post
category: git
description:  git 的基本概念和操作
keywords: git, git reset, git add
title: Git的基本操作
tags: [git]
summary: Git的基本操作
---


##Git的基本概念
Git上的文件的状态可以分为下面的流程

未跟踪==》git add =>暂存（待提交）==>修改(modified)==>git add==》修改的内容暂存（待提交）=>git commit=>>提交

所有，本地有修改后，必须add一下才会到更新到暂存(待提交状态)。

此时，commit之后才有效果。

如果不小心将文件添加到了暂存，可以使用`git reset HEAD file `恢复。

如果要取消对文件的修改：

	git checkout -- file



对于已经被git版本管理，之后进行的修改，

可以使用

	git commit -a -m "MSG"
	
可以跳过git add文件内容更新这个步骤。


##.gitignore
可以使用Glob方式ignore。

如果以斜杠结尾的话，则会被当做一个目录。
如下：

	# 此为注释 – 将被 Git 忽略
	*.a       # 忽略所有 .a 结尾的文件
	!lib.a    # 但 lib.a 除外
	/TODO     # 仅仅忽略项目根目录下的 TODO 文件，不包括 subdir/TODO
	build/    # 忽略 build/ 目录下的所有文件
	doc/*.txt # 会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
	
## git diff

`git diff` 比较的是当前文件和暂存文件的区别。

如果要比较服务器上的和暂存文件的差别，则可以使用`git diff --cached`

##git mv
使用	`git mv`可以直接将文件移动，相当以下步骤
	
	mv X Y
	git rm X
	git add Y

##git log

	##显示变更的差异
	git log -p	
	
	##显示最近2次变更的差异,-n是指最近n次
	git log -p -2	
	
	##变更的文件
	git log --stat

