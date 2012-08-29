---
layout: post
category: JVM
description: 《深入Java虚拟机》的读书笔记
keywords: jvm, java 类加载, 类加载, 显示类加载,
title: 类和对象的生命周期【更新】
tags: [java, class, JVM]
summary: 介绍了类和对象的生命周期接受，以及如何查看虚拟机类加载的过程。
---

##Section 1:类和对象的生命周期

1.	装载
2.	连接（验证、准备、解析）
3.	初始化

类只有在被主动使用的时候才会初始化，主动初始化有6中情况：

1.	创建某个类的新实例。（new或者反射、反序列化等）
2.	调用某个类的静态方法。
3.	调用类或者接口的静态字段。final的静态字段除外，任何对final的静态字段引用都会直接被编译器优化成相应的值。
4.	使用反射
5.	初始化某个子类时，要求超类必须初始化。此规则不适用于接口：子接口初始化时，只有使用到父接口的非常量字段时，父接口才会初始化。	
6.	虚拟机启动时，被包含为启动类的类（即包含main方法的）。

###一.装载
1.	通过全限定类名，将class的二进制流装载
2.	产生方法区内部的数据结构
3.	生成Class类实例。

###二.连接
连接分为三个步骤：验证、准备、解析

* 验证：检查Class对象的字节码有效性；检查是否符合Java语义（比如final类不能有子类等）。
* 准备：为类变量分配内存，设置初始值。此处的初始值是指变量的原始初始值，而不是程序赋予的初始值。
* 解析：虚拟机可以推迟这一步。解析是将符号引用替换成直接引用。

###三.初始化
初始化是为类变量赋予正确的初始值。
所有的类变量初始化语句和静态初始化器都会被放在`<clinit>`方法里。

###四.卸载
当类不再需要被使用是，类就会被从方法区中释放


##Section 2:类的实例（对象）的生命周期
类的实例可以通过以下四种方法创建：

1.	new
2.	反序列化的readObject
3.	反射的Class.newInstance()或者java.refelect.Constructor
4.	clone

编译器会为每个类生成至少一个初始化方法：`init`。

对象的创建还包含隐式的情况（多为编译器优化）。如
	
	String a="abc"+var1

会创建2个String对象和一个StringBuffer对象等。

##Section 3:类加载的查看
通过JVM参数 -verbose:class 可以查看类的加载情况。

参考[此处](https://github.com/llohellohe/cp/tree/master/src/yangqi/hotspot/classlifecycle)的代码例子.

	类Student继承了类People。
	接口StudentService继承了接口PeopleService。
	DummyServiceImpl实现了StudentService。
	
	在Show.java的main方法中如下调用
	
	Student s=new Student();
		
	new DummyServiceImpl();
	

使用 `java -verbose:class Show`执行后可以看到（已经略去其它java必须类的加载）:
	
	[Loaded yangqi.hotspot.classlifecycle.Show from file:/Users/yangqi/opensource/cp/bin/]
	[Loaded yangqi.hotspot.classlifecycle.People from file:/Users/yangqi/opensource/cp/bin/]
	[Loaded yangqi.hotspot.classlifecycle.Student from file:/Users/yangqi/opensource/cp/bin/]
	[Loaded yangqi.hotspot.classlifecycle.PeopleService from file:/Users/yangqi/opensource/cp/bin/]
	[Loaded yangqi.hotspot.classlifecycle.StudentService from file:/Users/yangqi/opensource/cp/bin/]
	[Loaded yangqi.hotspot.classlifecycle.DummyServiceImpl from file:/Users/yangqi/opensource/cp/bin/]
	
可以看到,Show作为启动类，第一个被加载。

因为Student的父类是People，所以要初始化Student必须加载People。

DummyServiceImpl的接口和父接口同理，不过此时虽然加载了这些接口，但是他们并没有被初始化。参考Section1中初始化的6中情况中的第五种。	

