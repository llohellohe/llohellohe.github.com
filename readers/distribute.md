[NoSQL数据库的分布式算法](http://my.oschina.net/juliashine/blog/88173):[很多没有看懂]







###Zookeeper:
#####Paxos协议介绍

通过决议的方式，如果超过半数的人同意，则决议通过。

[博客](http://www.spnguru.com/2010/08/zookeeper%E5%85%A8%E8%A7%A3%E6%9E%90%E2%80%94%E2%80%94paxos%E7%9A%84%E7%81%B5%E9%AD%82/)

[wiki](http://zh.wikipedia.org/zh-cn/Paxos%E7%AE%97%E6%B3%95)

[Paxos made simple](http://blog.csdn.net/sparkliang/article/details/5740882)


[Zookeeper中Leader election分析和实现](http://maoyidao.iteye.com/blog/1119412)[需要再看看]

[Paxos实现](http://rdc.taobao.com/blog/cs/?p=162)

[Zookeeper全解析——Paxos作为灵魂](http://www.spnguru.com/2010/08/zookeeper%E5%85%A8%E8%A7%A3%E6%9E%90%E2%80%94%E2%80%94paxos%E7%9A%84%E7%81%B5%E9%AD%82/)

[海量存储之一致性和可用性问题(Paxos)](http://rdc.taobao.com/team/jm/archives/2545)


Gossip协议：通过任意两个结点的数据同步，将结点不一致部分同步过来。这样逐渐的，整个集群的数据会趋同。数据同步的方式可以是pull\push\push & pull

####海量存储
[海量存储之一致性和可用性问题](http://rdc.taobao.com/team/jm/archives/2541)






