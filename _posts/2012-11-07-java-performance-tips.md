---
layout: post
category: Java Performance 读书笔记
description: 《Java Performance》的读书笔记第六章
keywords: vmstat, java performance, performance tunning
title: JVM Performance Profile Tips
tags: [java, 性能, JVM]
summary: JVM Performance Profile Tips
---



###Volatile
每次给类型的字段更新，必须发起一次CUP的指令，使各个CPU上的Cache Update。这个可能会导致性能问题。

###数据结构的大小重定