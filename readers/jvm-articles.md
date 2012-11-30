JVM相关资料


###Java Performance
####测试系统性能：

定义好系统的边界，即定义出SUT,比如web服务器+数据库服务作为整体的系统，还是单独的web服务器。

定义好性能指标：response,吐吞量，load等等。

可重复测试。

####JIT
javac只是将.java静态编译成了.class字节码，JVM负责解析字节码并执行。
这样的执行效率远没有直接让操作系统执行机器码高，JIT Just in time 就是为了解决这个问题，它通过动态收集数据，将常用的字节码转成机器码。其中涉及到方法Inline等。。。具体参见java perfomance 第8章【没有细看】




###字节码
[操作码助记符](http://blog.csdn.net/jiangshide/article/details/7713505)

###规范
[Java7 VM Spec](http://docs.oracle.com/javase/specs/jvms/se7/html/index.html)