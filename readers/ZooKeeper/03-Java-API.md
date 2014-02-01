####创建ZooKeeper Session

	ZooKeeper(
	 String connectString,
	 int sessionTimeout,
	 Watcher watcher
	)
	
sessionTimeout单位为毫秒，

Watcher 是个借口，通过这个接口可以收到session建立或者断开的事件，

同样地，也能监视ZK数据的变化。

当连接成功后，会获得SyncConnected的通知，

如果连接断开，则会收到DISCONNECT通知。

#####telnet
通过telnet zkserver，可以获取些基本信息。

如
	telnet localhost 2181 
	
	stat 可以查看zk的基本信息，包括有哪些客户端连接。
	
	dump 查看连接的过期时间
	
####Create


	String create(String path,byte[]data,ACL,CreateMode)

正确创建后，返回节点的path,否则抛异常。

CreateMode是节点类型的枚举。

####Stat

	 byte[] getData(String path,boolean watch,Stat stat)
	 
Stat 非必须，如果有的话，会将节点的信息复制到这个对象。

返回节点的数据信息。

如果watch为true的话，一旦后续数据发生变化，那么在创建session时的watch对象将收到通知。

同步版本的master[实现](https://github.com/llohellohe/zookeeper/blob/master/src/main/java/yangqi/zookeeper/example/masterworker/Master.java)


####异步操作
ZK的操作都提供了异步操作版本，有了异步版本后，可以消除部分while循环了。

比如create的异步操作，

	void create(String path, byte[] data,	        List<ACL> acl,	        CreateMode createMode,	        AsyncCallback.StringCallback cb,	        Object ctx)

前四个参数和同步操作相同，多了个callback和用于上下文传递的ctx。

其中Callback有多种类型，比如StringCallback和DataCallback。

StringCallback有个接口方法：

	 public void processResult(int rc, String path, Object ctx, String name);
	 
rc为返回的状态码，通过状态码可以判断操作是否成功。

ctx即用于传递的上下文对象。

####Master-Worker实例
[同步操作版本的master](https://github.com/llohellohe/zookeeper/blob/master/src/main/java/yangqi/zookeeper/example/masterworker/Master.java)

[异步操作版本的master](https://github.com/llohellohe/zookeeper/blob/master/src/main/java/yangqi/zookeeper/example/masterworker/AsynMaster.java)




