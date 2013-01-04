	
####Commons.pool

#####对象池的接口`ObjectPool<T>`
改接口定义了对象池的一些通用行为：

1.	获得对象：T borrowObject()
2.	归还对象：returnObject(T obj) 
3.	增加对象：addObject(T obj)
4.	无效对象：invalidateObject(T obj)
5.	其它行为：清理空闲对象、关闭连接池、获得相关配置参数等。


#####通用对象池GenericObjectPool
改类实现了接口ObjectPool，并且定义了FIFO\LILO两种对象淘汰模式。

它需要配合`PoolableObjectFactory`才能正常工作，这个Factory的makeObject方法用于产生对象。

接口 PoolableObjectFactory 定义了如下行为：

1.	创建对象:T makeObject()
2.	销毁对象：destroyObject(T obj)
3.	检验对象：boolean validateObject(T obj)
4.	激活对象：activateObject(T obj)
5.	钝化对象：passivateObject(T obj)

#####StackObjectPool
使用栈实现的对象池，使用实例可以看下[这段代码](https://github.com/llohellohe/pools/blob/master/src.test/test/pool/ParseThingsWithPool.java)。


我们假设Parser是个创建成本特别高的解析器，为了循环利用解析器，我们构建了一个解析器池。

流程是：

1. 通过传入一个自定义的创建解析器PoolableObjectFactory，来构建一个解析器池。

	ObjectPool<Parser>pool=new StackObjectPool<Parser>(new ParserFactory());

2. 往池里加点解析器

	
		for(int i=0;i<=3;i++){
			 pool.addObject();
		}
		
3.	使用解析器


	
	while(count-->0){
			Parser parser=pool.borrowObject();
			
			parser.parse();
			
			pool.returnObject(parser);
		}
		
通过borrowObject()方法从池中拿Parser。

用完后通过returnObject()放回去。

值得注意的是：

1.	从池中拿对象的时候：会调用PoolableObjectFactory的makeObject()创建对象，然后调用activateObject()方法激活对象，然后调用validateObject()方法验证对象。
2.	从池中返回对象的时候：会调用PoolableObjectFactory的validateObject()方法后，判断是需要销毁对象(destoryObject())，还是将对象钝化（passivateObject()）

#####GenericObjectPool
行为同StackObjectPool类似。

可以定义获得和归还连接时的一些行为。


####DBCP连接池配置
	
	<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
				 <property name="driverClassName" value="com.mysql.jdbc.Driver" />
				 <property name="numTestsPerEvictionRun" value="-1" />
	            <property name="timeBetweenEvictionRunsMillis" value="60000" />
	            <property name="minEvictableIdleTimeMillis" value="180000" />
	            <property name="testWhileIdle" value="false" />

	</bean>
		
		
		
		
####Driver接口

1.	Connection getConnection()
2.	boolean acceptUrl(String url)

####JDBC 驱动加载
	Class.forName("com.mysql.jdbc.Driver");
	Connection connect = DriverManager
			          .getConnection("jdbc:mysql://localhost/test?"
			              + "user=root&password=");
			            

#####注册			            
调用Class.forName注册驱动，初始化驱动的Class。

主要目的是为了向DriverManager中注册自己这个驱动。

通过调用com.mysql.jdbc.Driver中的static块的方式：

	static {
			try {
				java.sql.DriverManager.registerDriver(new Driver());
			} catch (SQLException E) {
				throw new RuntimeException("Can't register driver!");
			}
		}

驱动在DriverManager中以DriverInfo这个内部类表示。所有DriverInfo表示的驱动组成一个队列。

#####获得物理连接
DriverManager.getConnection()方法用于获得一个数据连接，

通过遍历DriverInfo队列的方式，尝试逐个调用Driver的connect方法获得连接。


###使用连接池
BasicDataSource.getConnection()

####创建物理连接工厂
接口ConnectionFactory定义了物理连接的创建工厂，DriverConnectionFactory是其一个实现。

	
通过 
	
	public DriverConnectionFactory(Driver driver, String connectUri, Properties props)

创建。

然后调用接口的：

	createConnection（）
	
方法获得一个连接。

内部是调用Driver的connect()方法。



在这时候调用Class.forName(DriverName).

接着通过DriverManager.getDriver(url)获得一个Driver。（通过遍历DriverInfo队列，逐次通过Driver.acceptUrl(url)）。

只有使用这个物理连接工厂，创建PoolableConnectionFactory,继而创建一个连接池。


