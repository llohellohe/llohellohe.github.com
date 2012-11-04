---
layout: post
category: Java
description: 《ASM》的读书笔记
keywords: java , java asm ,asm 
title: JVM Performance Monitor
tags: [java, asm, JVM]
summary: Java ASM 基础
---


以下类的说明，均以asm 4.0为准。

###基本类图
ASM的基础类结构如下图所示：

![asm class summary](http://llohellohe.github.com/imgs/asm/summary.png)
其中抽象类 ClassVisitor 定义了基于事件访问类的方法一些方法。
它有两个构造方法：

1.	ClassVisitor(int API_VERSION)
2.	ClassVisitor(int API_VERSION,ClassVisitor visitor)
ps:4.0中一些常量定义在Opcodes接口中，如ASM4这个API_VERSION
###三大类介绍
####(一).ClassVisitor
ClassVisitor 定义了几种方法：

1.访问类的头部：
public void visit(
        int version,
        int access,
        String name,
        String signature,
        String superName,
        String[] interfaces)
        

2.访问类的源代码文件：
 public void visitSource(String source, String debug)  
  
 ps:此处source为类名.java， 并没有带上路径名     

3.访问外部类：
 public void visitOuterClass(String owner, String name, String desc) 
 
4.访问类的annotation：
 public AnnotationVisitor visitAnnotation(String desc, boolean visible) 
 
5.访问类的属性（并不是字段）：
 public void visitAttribute(Attribute attr) 6.访问内部类：
public void visitInnerClass(
        String name,
        String outerName,
        String innerName,
        int access)
        
7.访问类字段（不包含父类的）：
 public FieldVisitor visitField(
        int access,
        String name,
        String desc,
        String signature,
        Object value)
        

8.访问方法：
public MethodVisitor visitMethod(
        int access,
        String name,
        String desc,
        String signature,
        String[] exceptions)   
      
9.访问结束：visitEnd()
用于告诉asm所有访问都结束了


示例1：
	
	 ClassPrinter printer = new ClassPrinter();
     
     ClassReader cr = new ClassReader("yangqi.hotspot.classlifecycle.People");
     
     cr.accept(printer, 0);
     
     
ClassPrinter.java


	public class ClassPrinter extends ClassVisitor {

    public ClassPrinter() {
        super(Opcodes.ASM4);
    }

    /**
     * @param args
     * @throws IOException
     */
    public static void main(String[] args) throws IOException {

        ClassPrinter printer = new ClassPrinter();
        ClassReader cr = new ClassReader("yangqi.hotspot.classlifecycle.People");

        System.out.println(cr.getClassName());

        cr.accept(printer, 0);

    }

    public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {

        System.out.println("METHOD VISIT [ access:" + access + ",name:" + name + ",desc:" + desc + ",signature:"
                           + signature);
        return null;
    }

    public void visit(int version, int access, String name, String signature, String superName, String[] interfaces) {
        System.out.println("version:" + version + ",name" + name + " extends " + superName + " {");
    }

    public void visitSource(String source, String debug) {
        System.out.println("SOURCE VISIT " + source + ",debug " + debug);
    }

    public void visitEnd() {
        System.out.println("}");
    }

    public void visitAttribute(Attribute attr) {
        System.out.println("VISIT attr");
    }

    public FieldVisitor visitField(int access, String name, String desc, String signature, Object value) {

        System.out.println("VISIT FILED [ access:" + access + ",name:" + name + " desc: " + desc + ",signature:"
                           + signature + ",value:" + value);
        return null;
    }
	}
上面的ClassPrinter继承了ClassVisitor,并且重载了部分方法。


####(二).ClassReader
ClassReader定义了四种构造函数，目的均是为了从一个字节数组得到一个类。

分别是：

1.	 public ClassReader(final String name)   //通过*ClassLoader.getSystemResourceAsStream(clazz.getName().replace(".", "/") + ".class")获得InputStream*
2.	 public ClassReader(final InputStream is)
3.	 public ClassReader(final byte[] b)
4.	 public ClassReader(final byte[] b, final int off, final int len)

ClassReader的getClassName(),getInterfaces()等方法可以获得类的基本信息。

代码示例1中的accept（ClassVisitor visitor,int flag）方法，接受一个ClassVisitor参数和和一个标志值，标志值可以改变访问的默认行为。

ClassReader的accept()方法调用后，会根据ClassVisitor中重载的各个方法来访问字节数组，并做出相应行为。


####(三).ClassWriter

ClassWriter继承了ClassVisitor，它可以用来重新改变字节数组，以便更改类的定义或者产生新的类。

ASM4.0中已经不再有ClassAdapter这个类。
       