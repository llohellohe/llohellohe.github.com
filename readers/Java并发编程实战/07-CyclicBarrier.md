###CyclicBarrier和CountDownLatch的区别。
CyclicBarrier用于在到达的线程到初始化的数目时，才打开栅栏放行。

当其中一个线程到达时，调用await方法等待，只有所有的线程都到达了，才能进行下一步操作。

CyclicBarrier和CountDownLatch很像，CountDownLatch用于等待的事件，而CyclicBarrier则用来等待线程。

CountDownLatch是一个线程等待多个线程，而CyclicBarrier则是多个线程同时等待。

CyclicBarrier像水闸一样，只有所有的水都到齐，超过一定的阈值，才能防闸出水。


###CyclicBarrier的构造函数
CyclicBarrier有两个构造函数

	CyclicBarrier(int count)
	
	CyclicBarrier(int count,Runnable action)
	
	
这个Runnable将在所有线程都到达后，其它线程被唤醒前执行。

使用CyclicBarrier使20个Graunt兽族步兵到达后，才发动攻击的[例子](https://github.com/llohellohe/cp/blob/master/src/yangqi/jcp/barrier/Graunt.java)。