---
layout: post
category: Java
description: 《ASM》的读书笔记
keywords: java , java asm ,asm 
title: JVM ASM - Method
tags: [java, asm, JVM]
summary: Java ASM - Method
---


以下类的说明，均以asm 4.0为准。

本文中的代码示例源代码可以在此[查看](https://github.com/llohellohe/cp/blob/master/src/yangqi/asm/ClassPrinter.java)。

###一.结构
Java代码是在线程中执行的，每个线程都有自己的执行堆栈（excution stack）。

该堆栈由桢（Frame）组成，每次方法调用，都会往堆栈里面压入一桢，当方法执行完（正常或者异常结束）后，从栈顶弹出。

桢又有两部分组成：

1. **本地变量区local variable**
2. **操作数栈operand stack**

其中本地变量是可以根据下标随机访问的数组，而操作数栈是一个后入先出的栈。

本地变量和操作数都是有一个个槽组成的，long和double需要两个槽来存储。

比如调用方法a.equals(b)，会初始化一个大小为2的本地变量区，分别放入a 和 b。

本地变量和操作数栈的大小由编译器决定，同时被编译到class中。


####操作码 Opcodes
操作码可以分为两大类：

1.	从本地变量压入到操作数栈，或者反之。比如ILOAD\LLOAD用于从本地变量push到操作数栈，而ISTORE\LSTORE则负责从操作数栈更新到本地变量中。
2.	从操作数栈弹出数据，然后再压入	

#####示例一：People

Source code:
package yangqi.hotspot.classlifecycle;

public class People extends Creature {

    private String name;

    private int    age;
    
    private String school;
    
    private int phone;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    
    
    
    public String getSchool() {
		return school;
	}

	public void setSchool(String school) {
		this.school = school;
	}

	public int getPhone() {
		return phone;
	}

	public void setPhone(int phone) {
		this.phone = phone;
	}

	@Override
    public String toString() {
        return "People [name=" + name + ", age=" + age + "]";
    }

    public void speak() {
        System.out.println("I say hello");
    }

	}

`javac -p` 反编译后看到如下操作码

		public java.lang.String getName();
  		Code:
   		0:   aload_0
   		1:   getfield        #22; //Field name:Ljava/lang/String;
   		4:   areturn
   		
   		
   		public java.lang.String getSchool();
 		Code:
   		0:   aload_0
   		1:   getfield        #33; //Field school:Ljava/lang/String;
   		4:   areturn
   		
   		public int getPhone();
  		Code:
   		0:   aload_0
   		1:   getfield        #37; //Field phone:I
   		4:   ireturn
   		
   		public int getAge();
  		Code:
   		0:   aload_0
   		1:   getfield        #28; //Field age:I
   		4:   ireturn

   		
   		public void setName(java.lang.String);
 		Code:
  		0:   aload_0
   		1:   aload_1
   		2:   putfield        #22; //Field name:Ljava/lang/String;
   		5:   return
   		
   		public void setSchool(java.lang.String);
  		Code:
   		0:   aload_0
   		1:   aload_1
   		2:   putfield        #33; //Field school:Ljava/lang/String;
   		5:   return
   		
   		public void setAge(int);
  		Code:
  		0:   aload_0
   		1:   iload_1
   		2:   putfield        #28; //Field age:I
   		5:   return
   		
   		
   		public void setPhone(int);
  		Code:
   		0:   aload_0
   		1:   iload_1
   		2:   putfield        #37; //Field phone:I
   		5:   return
   		
以getPhone()方法为例：
初始化时，本地变量只有this,操作数栈为空。
通过aload_0 将第一个对象类型压倒操作数栈里面。
然后弹出，执行`getfield`，最后通过`ireturn`返回int。

setAge(int)
初始化时，本地变量有this和int,操作数栈为空。
通过aload_0将第一个对象压到操作数栈里面，iload_1将第二个变量以int类型压到操作数栈顶。

注意点：
在各种资料上说aload_1 iload_2 是说加载本地变量中的第一个对象，和加载本地变量中的第二个int。

其实这种说法是不对的，经过我的测试。

在本地变量中，第一个总为this,之后为方法的参数。

如test（）方法:
	
	 public void test(int a,String s1,int b,String s2,int c,int d ,int e){
    	this.age=a;
    	this.age=b;
    	this.age=c;
    	this.age=d;
    	this.phone=e;
    	this.name=s1;
    	this.school=s2;
    }
它的操作码如下：

  	Code:
  	0:   aload_0
   	1:   iload_1
   	2:   putfield        #28; //Field age:I
   	5:   aload_0
   	6:   iload_3
   	7:   putfield        #28; //Field age:I
   	10:  aload_0
   	11:  iload   5
   	13:  putfield        #28; //Field age:I
   	16:  aload_0
   	17:  iload   6
   	19:  putfield        #28; //Field age:I
   	22:  aload_0
   	23:  iload   7
   	25:  putfield        #37; //Field phone:I
   	28:  aload_0
   	29:  aload_2
   	30:  putfield        #22; //Field name:Ljava/lang/String;
   	33:  aload_0
   	34:  aload   4
   	36:  putfield        #33; //Field school:Ljava/lang/String;
   	39:  return
   	
   	
可以看到：
iload_1 的含义是将本地变量中的第二个元素，以int类型压入操作数栈中。 

iload 5是说将本地变量中的滴6个元素压入操作数栈中。

aload_2 是将本地变量中的第三个元素以对象形式压入栈中。

aload   4 是将本地变量中的第四个元素以对象形式压入栈中。


其它Opcodes如：

`invokestatic` 调用静态方法。

`invokevirtual`调用实例方法。

`invokespecial` 调用超类构造方法、私有方法、实例化初始方法。

`invokeinterface` 调用接口的方法。

`ldc`将int fload String从常量池推送到栈顶。

`ldc2_w`将double\long 从常量池推送到栈顶（宽索引）。

`iinc`将int类型增加指定值。

