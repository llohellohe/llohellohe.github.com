---
layout: post
category: Java Concurrency
description: 介绍多线程编程中的一些基础类和方法。
keywords: java concurrency
title: Java 多线程基础类介绍
tags: [java concurrency]
summary: Java 多线程基础类介绍
---


###一.Runnable
接口Runnable是所有希望以线程方式执行的接口。它只定义了一个无参数、无返回值的run()方法。


###二.Thread
Thread实现了Runnable，它可以有多种类型的构造函数。但最终都会转换为init()方法来初始化一个线程。

init()方法有四个参数：

1.	线程组ThreadGroup
2.	Runnable target
3.	名称:默认为"Thread-"+tid
4.	stackSize

初始化时，如果线程组不存在，则使用父线程的线程组。

线程初始化后，线程组中会添加一个没有启动的线程。

当调用start()方法后，会往线程组中添加一个启动的线程。

线程的启动和停止最终都将调用本地方start0和stop0。

线程的toString()方法，当线程组不为空时，toString()方法返回线程名称、优先级和线程组。

否则只返回线程名称和优先级。

####等待线程结束：join()

通过join()方法可以等待直到线程结束。

方法join(1000)为等待1s后结束。通过join可以实现线程的超时时间，但是是有限制的。

因为在Java中一个线程只能自己主动结束运行，其它线程只能发中断信息给它，而不能强制关闭它。

如测试线程TestThread:
	
	class TestThread extends Thread{
	public void run(){
		System.out.println("In Thread:"+this.getName()+" current:"+currentThread());
		
		while(!this.isInterrupted()){
			System.out.println(new Date());	
		}
	}
	}
	
在线程被中断前，一直打印时间。

另个线程这样调用TestThread，如果等待1s后，TestThread没有结束的话，就发个中断给它。

	Thread t=new TestThread();	
		t.start();
		try {
			t.join(1000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		t.interrupt();


####取消任务

使用Thread.stop()方法来取消线程是不推荐的，原因是它会导致很多的状态不一致。

因此可以选用取消标记变量或者中断的方法来取消任务。

#####（一）.标记变量
通过一个变量标记来确定任务是否继续执行。它的代码可能是这样的：

	private volatile stop=false;
	
	while(!stop){
	//do somethin
	}
	
	method:stop(){
	stop=true;
	}
	
volatile 为保证多个线程对于这个变量可见，可以按照需求判断是否使用volatile 。



#####（二）.中断

	while(!Thread.currentThread().isInterrupted()){
      //do somethin
    }	
    method:stop(){
	Thread.currentThread().interrupt();
	}
	
	
###三.Callable和Future

####Callable
Callable是个接口，代表所有需要被执行并且需要返回值的调用。

Callable只有一个方法：

	T call() throws Exception
	
使用Callable有两个好处：

1.	具有返回值（可以通过Future.get()获得）。单纯通过Runnable的run方法是无法获得返回值的。
2.	抛出异常，所有在Thread或者Runnable里面的异常会被吃掉，除非你做额外控制（比如自己出测了ExceptionHandler）。
	
通过

	ExecutorService.submit(Callable<T>)
	
可以返回Future<T> 。




通过Future的get()方法可以获得返回值，改方法会一直阻塞，知道获得值。

通过 

	Executors.callable(Runnable task, T result)


可以讲一个Runnable准换成一个Callable


####Future
接口Future定义了一些基础方法：

get(),get(long timeout,TimeUnit)方法使用来获得返回值的。

isDone()、isCancelled()方法用于判断状态。

cancel()用于取消任务。

实现FutureTask内部使用Sync来做控制。

#####实例一：使用ExecutorService获得Future

TestCallable实现了Callable接口，并返回字符串的长度。


	class TestCallable implements Callable<Integer>{

	private String word;
	
	TestCallable(String word){
			this.word=word;
	}
	
	@Override
	public Integer call() throws Exception {
		return Integer.valueOf(word.length());
	}
	
	}
    
通过submit()提交后，得到Future。然后调用get()得到返回值，因为本例中无所谓顺序，只是求总和，所以f1和f2的调用顺序没有什么要求。
    
	public static void main(String[] args) throws InterruptedException, ExecutionException {
		// TODO Auto-generated method stub
		Future <Integer>f1=pool.submit(new TestCallable("mp3"));
		Future <Integer>f2=pool.submit(new TestCallable("book"));
		
		int i=f2.get();
		i+=f1.get();
		
		System.out.println(i);
		
		pool.shutdown();
	}
	
	
#####实例二：使用FutureTask

FutureTask实现了接口RunnableFuture ,而RunnableFuture继承了Runnable和Future 。

	Callable<Integer> callable=new TestCallable("may here");
		
		FutureTask <Integer>task=new FutureTask<Integer>(callable);
		
		new Thread(task).start();
		
		System.out.println(task.get());




###附：JVM关闭的钩子
通过
	
	Runtime.getRuntime().addShutdownHook(new Thread(){
			public void run(){
				System.out.println("FUCK");
			}
		});
		
可以注册JVM被cancel+c或者正常关闭时的钩子。



####参考资料

1.	dananourie ,[Using Callable to Return Results From Runnables](https://blogs.oracle.com/CoreJavaTechTips/entry/get_netbeans_6) 