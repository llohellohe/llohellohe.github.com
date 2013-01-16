所有统计信息都有Profiler类处理。

其中InteractionList 继承了LinkedList,是个包含Frame的列表。

一个Frame代表一次方法调用，具有方法名称、调用时间、调用次数、线程ID等信息。

ThreadDictionary继承了HashMap，它的Key为线程Id,value为方法调用的Frame桢的列表。

Controller用于控制Profiler的各个参数，是否dump线程，包含和排除的类等。

ProfileTextDump负责以文本格式输出内容。


通过ASM的MethodVisitor，将方法调用前后先调用Profiler.start(classname,methodname)以及Profiler.end(classname,methodname)方法。

如开始的时候，先将类名和方法名压入到操作数栈，然后调用start()方法。

	this.visitLdcInsn(_className);
	this.visitLdcInsn(_methodName);
	this.visitMethodInsn(INVOKESTATIC, 
				Controller._profiler, 
				"start", 
				"(Ljava/lang/String;Ljava/lang/String;)V");
				
				

测试：
一个类具有3个方法，其中两个方法中，添加方法前后打印一行话，并且捕捉到构造函数。