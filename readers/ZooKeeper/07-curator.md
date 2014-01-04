####curator
Curator是构建在ZooKeeper上的API，它屏蔽一些复杂的ZooKeeper操作，并提供了一些扩展。

使ZooKeeper的使用更加方便和快捷。


####流式API
一般的ZooKeeper创建节点的代码如下：

	zk.create("/mypath", new byte[0],	              ZooDefs.Ids.OPEN_ACL_UNSAFE,	              CreateMode.PERSISTENT);
	              
使用Curator后，
	zkc.create().withMode(CreateMode.PERSISTENT).forPath("/mypath", new byte[0]);####leader latch 和leader selection
通过Curator可以方便的进行leader的选举和控制。
####Leader Elections
在ZK集群中，Leader的作用是保证变更操作（create\setData\delete）的顺序性。
它将接收到的请求转换成事务，然后提议followers按照顺序应用这些事务。
在初始阶段，所有的ZK服务端都处于LOOKING状态，要么找到已经存在Leader结点，要么自己选举出Leader。
成为Leader的节点将进入LEADING状态，其它则将进入FOLLOWING状态。
#####选举过程
进入LOOKING状态的server将广播消息，称为vote。	 
vote包含serverId和ZXID，比如(1,5)表示server id为1的服务端，它的ZXID为5。
每个server将比较自己的vote和收到的vote，如果：
1.	收到vote的zxid大于自己的，则使用这个vote
2.	如果zxid相等，则sid大的获胜
####Zab:ZooKeeper Atomic BroadCasting
Zab协议用于判断一个事务是否已经被提交。
Zab类似两阶段提交。
####Observer
observer 是除了leader\follower的另种角色，它不参与投票过程。       