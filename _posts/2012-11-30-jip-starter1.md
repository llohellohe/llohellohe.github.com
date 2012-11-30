---
layout: post
category: Java
description: JIP的使用原理
keywords: jip, java performance, performance tunning
title: JIP使用指南-入门
tags: [java, 性能]
summary: JVM Performance Profile Tips
---

###JIP使用指南-入门

JIP是sourceforge上的一个开源项目，用于性能监测。通过它，可以方便的找到代码中，各个方法的执行时间，哪个方法是最消耗性能的。

可以在JIP[项目主页](http://jiprof.sourceforge.net/)下载源代码包，也可以在[此处](http://llohellohe.github.com/download/profile.jar)下载执行的Jar包。

###简单使用示例：

约定JIP被放在目录$JIP_HOME中，本文示例中放置在:/Users/yangqi/opensource/jip/jip-src-1.2/profile/profile.jar

简单的RunTest类如下，这个类很简单，其中foo1()被调用了3次，每次循环打印不同次数的信息。foo2()方法被调用了一次。


	package jip.test;

	public class RunTest {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		RunTest test=new RunTest();
		test.foo1(100);
		test.foo2();
		test.foo1(10000);
		test.foo1(10);
	}
	
	public void foo1(int size){
		for(int i=0;i<size;i++){
		System.out.println("foo"+i);	
		}
	}
	
	public void foo2(){
		System.out.println("foo2 1");	
	}
	
	}
	
javac编译后，执行命令：
	
	java -javaagent:/Users/yangqi/opensource/jip/jip-src-1.2/profile/profile.jar  jip/test/RunTest
	
会发现在当前目录下多了一个profile.txt文件。
	
	+------------------------------
	| Thread: 1
	+------------------------------
		      Time            Percent
	       ----------------- ---------------
	 Count    Total      Net   Total     Net  Location
	 =====    =====      ===   =====     ===  =========
	     1    158.3      2.3   100.0     1.4  +--RunTest:main       (jip.test)
	     1      0.0      0.0     0.0          | +--RunTest:<init>   (jip.test)
	     3    156.0    156.0    98.5    98.5  | +--RunTest:foo1     (jip.test)
	     1      0.0      0.0     0.0          | +--RunTest:foo2     (jip.test)

	+--------------------------------------
	| Most expensive methods (by net time)
	| Frame Count Limit: Unlimited
	+--------------------------------------

		       Net
		  ------------
	 Count     Time    Pct  Location
	 =====     ====    ===  ========
	     3    156.0   98.5  jip.test.RunTest:foo1
	     1      2.3    1.4  jip.test.RunTest:main
	     1      0.0    0.0  jip.test.RunTest:<init>
	     1      0.0    0.0  jip.test.RunTest:foo2

	+--------------------------------------+
	| Most expensive methods summarized    |
	+--------------------------------------+

		       Net
		  ------------
	 Count     Time    Pct  Location
	 =====     ====    ===  ========
	     3    156.0   98.5  jip.test.RunTest:foo1
	     1      2.3    1.4  jip.test.RunTest:main
	     1      0.0    0.0  jip.test.RunTest:<init>
	     1      0.0    0.0  jip.test.RunTest:foo2


可以看到统计信息如下：

main()方法一共执行了158.3毫秒，其中三次foo1()方法站了156秒。其它几乎不耗时。

统计中还包含了最耗时间的方法，其中Net指的是方法本身的净消耗时间。

###指定配置文件
可以传给JIP一个配置文件，设置JIP的不同行为。

先简单的修改统计结果文件目录。

新建一个jip.properties ，里面只有一个配置：

	file=/tmp/RunTestResult.txt
	
然后重新运行：
	
	java -javaagent:/Users/yangqi/opensource/jip/jip-src-1.2/profile/profile.jar -Dprofile.properties=/tmp/jip.properties  jip/test/RunTest
	
这时候统计结果就被输出到了/tmp/RunTestResult.txt 文件中。


###简单原理
JIP的时间统计的工作原理可以简单的认为[后续教程会详细介绍]，在每次方法调用的时候，都会统计下方法调用的时间，然后汇总。

它是直接通过ASM修改字节码来完成此项工作的。


主要用到了Java Instrumentation API ，它允许在JVM加载类的时候，可以改变字节码，从而改变类的行为。

用到Instrumentation需要以下几个步骤：

1.通过-javaagent传入一个jar包。
2.jar包的MANIFEST.MF中定义premain-class:如JIP中定义为:
	
	Premain-Class: com.mentorgen.tools.profile.Main
	
实现方法：
	
	public static void premain(String args, Instrumentation inst) ；
	
premain中向Instrument注册了一个字节码转换类，正是这个字节码转换类在每个方法的调用前后插入了计算时间并统计字节码。

这样JVM在拿到这些字节码初始化类的时候，实际上这个方法已经被加上了时间统计的功能。

而字节码的修改则使用了ASM库来完成。

简单的流程图如下

#####使用JIP前
![使用JIP前](http://llohellohe.github.com/imgs/jip/before-jip.png)

#####使用JIP后
![使用JIP后](http://llohellohe.github.com/imgs/jip/after-jip.png)



下一篇介绍JIP的详细的用法。