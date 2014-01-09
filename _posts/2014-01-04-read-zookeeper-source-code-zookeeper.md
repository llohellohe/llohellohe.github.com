---
layout: post
category: 分布式
description: 本文介绍了分布式协调系统ZooKeeper的初始化过程，包含源代码的解读，以及相关的类图说明。
keywords: 分布式,ZooKeeper,ZooKeeper源代码,ZooKeeper初始化过程
title: ZooKeeper源代码解读之ZooKeeper
tags: [分布式,ZooKeeper,ZooKeeper源代码]
summary: ZooKeeper源代码解读之ZooKeeper
---


###ZooKeeper
客户端通过创建ZooKeeper的实例和ZooKeeper服务端进行交互，本文描述了ZooKeeper的源代码解读。

创建过程的示意图见文章底部。

####一.ZooKeeper的类初始化
ZooKeeper在初始化的时候，会调用类初始化方法，初始化日志环境(使用SLF4J)，并且记录相关环境变量。

	 static {
	        //Keep these two lines together to keep the initialization order explicit
	        LOG = LoggerFactory.getLogger(ZooKeeper.class);
	        Environment.logEnv("Client environment:", LOG);
	    }
	    
环境变量被存放在Environment的类中， 使用`System.getProperty`获得相应的环境变量，

内部使用Entry这个key-value的结构存放相应地环境变量名和值。

####二.构造函数
ZooKeeper有四种类型的构造函数，分别是：

1.	ZooKeeper(String connectString, int sessionTimeout, Watcher watcher)
2.	ZooKeeper(String connectString, int sessionTimeout, Watcher watcher,
            boolean canBeReadOnly)
3.	ZooKeeper(String connectString, int sessionTimeout, Watcher watcher,
            long sessionId, byte[] sessionPasswd)
4.  ZooKeeper(String connectString, int sessionTimeout, Watcher watcher,
            long sessionId, byte[] sessionPasswd, boolean canBeReadOnly)
            
            
可以分成两个大的类别，即设置sessionId和session密码的，与不设置这两个参数的。

####三.构造函数过程
1.	记录info级别的连接日志
2.	将ZkWatchManager的默认watcher设置成传入的watcher
3.	通过ConnectStringParser将传入的connectString，解析成多个或者一个服务器地址列表
4.	通过服务器列表构建StaticHostProvider
4.	初始化ClientCnxnSocket,可以通过`zookeeper.clientCnxnSocket`指定其实现，默认使用ClientCnxnSocketNIO。
5.	通过StaticHostProvider及其它相关参数，创建ClientCnxn。如果提供了seesionId和sessionPassword，则将seenRwServerBefore置为true。然后启动

sessionId和sessionPassword用于重连的时候验证。

注意：由于客户端和ZooKeeper服务端连接的建立是异步的，因此构造函数调用结束，并不代表连接一定已经建立(虽然概率比较小)。

####五.解析服务器地址：ConnectStringParser
ConnectStringParser用于解析传入的连接串，连接串是以逗号分隔的服务器：端口列表，如：

	ip1:port1,ip2:port2
	
额外的，可以指定相对目录的地址，称为chroot,那么以后所有的目录都将以这个目录为基准。

比如:

	ip:port1/root/,ip2:port2
	
那么后续的get操作，将以/root为相对目录，比如getData("/yangqi/")，实际操作的路径为"/root/yangqi/"。

ConnectStringParser将结果解析为chroot，和使用[InetSocketAddress](http://www.hiyangqi.com/java%20network/java-net-ip-socketaddress.html)表示服务器地址和端口的列表。

####六.服务器连接的提供者：HostProvider
HostProvider接口定义了三个接口方法：

1.	size() hosts的大小，可能为0
2.	next(long delay) 下一个服务器地址，返回InetSocketAddress。参数delay指定，所有服务器都被轮询遍后，等待的时间。
3.	onConnected() 告诉provider，已经建立了一个成功的连接。
 
StaticHostProvider实现了接口HostProvider，它将传入的服务器列表随机，next()按照随机后的顺序返回。

####七.观察者Watcher和观察到的事件WatchedEvent

WatchedEvent包含三类信息：

1.	KeeperState
2.	EventType
3.	path

KeeperState代表和ZK服务器的连接信息，包含Disconnected\SyncConnected\AuthFailed\ConnectedReadOnly\SaslAuthenticated\Expired等6种状态。


EventType代表发生的事件类型，包含五种状态：

1.	None
2.	NodeCreated
3.	NodeDeleted
4.	NodeDataChanged
5.	NodeChildrenChanged


其中后四种用于表示ZNode的状态或者数据变更，而None则用于会话的状态变更。

path则代表事件发生的ZNode路径。


####八.ZKWatchManager和一次性观察

ZooKeeper中的watcher设置是一次性的，

ZKWatchManager实现了接口ClientWatchManager，ClientWatchManager只定义了一个方法

	Set<Watcher> materialize(Watcher.Event.KeeperState state,
        Watcher.Event.EventType type, String path);
        

materialize方法返回一个Watcher（观察者）的集合。

ZKWatchManager 将Watcher分成了四大类，分别用DataWatcher\ExistsWatcher和ChildrenWatcher以及defaultWatcher表示。

	        private final Map<String, Set<Watcher>> dataWatches =
	            new HashMap<String, Set<Watcher>>();
	        private final Map<String, Set<Watcher>> existWatches =
	            new HashMap<String, Set<Watcher>>();
	        private final Map<String, Set<Watcher>> childWatches =
	            new HashMap<String, Set<Watcher>>();         
	            
每当事件发生时，ZKWatchManager则将对应的Watcher对象从集合中删除（ZooKeeper的watch是一次性的），然后返回需要被通知的观察者集合。

#####a.defaultWatcher
defaultWatcher只会相应事件类型为None，代表连接状态发生变化的通知。

#####b.连接重置后watcher恢复
默认情况下，如果连接重连，那么之前的watcher将被自动恢复。

如果KeeperState的状态不为连接建立，并且zookeeper.disableAutoWatchReset设置为fasle，

那么在连接断开并恢复后，将重新恢复Watcher，否则将清空原有的Watcher。

#####c.WatchRegistration
抽象类WatchRegistration 用于将一个Watcher注册到一个ZNode 路径上。

因此WatchRegistration有两个字段，Watcher和path。

他有三个抽象方法：

1.根据状态码获得对应路径的对应Watcher

	abstract protected Map<String, Set<Watcher>> getWatches(int rc);

2.根据状态码注册watcher

	 public void register(int rc) 
	 
3.判断状态吗判断是否需要增加watch

     shouldAddWatch(int rc)

####九.ClientCnxnSocket
ClientCnxnSocket被ClientCnxn用于客户端和服务端的socket通信。

####十.ClientCnxn
ClientCnxn管理客户端和服务端的连接，并且在连接出现问题的时候做到透明的自动切换。

####ZooKeeper初始化示意图
![ZooKeeper的创建过程](https://raw.github.com/llohellohe/zookeeper/master/docs/class-diagram/ZooKeeper.png)