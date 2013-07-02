###HTTP 协议和Cache相关的
####Date
首先介绍`Date`响应头，它表示消息的产生时间，且时间的格式必须是：

	Sat, 15 Jun 2013 06:37:49 GMT
	
协议要求源服务器应该尽可能的在响应中包含Date。

####Age
Age表示消息产生者对响应发生后时间的估计值（以秒为单位）。

Age头出现，说明响应并不是第一手的，而是来自缓存。

缓存的年龄可以通过Age头显示指定，或者通过now-date_value来确定。

结合起来可以：corrected_received_age = max(now – date_value,age_value)

缓存当前时间current_age的具体计算，可以参看13.2.3 。


####Expires	
`Expires`头表示实体的过期时间，同样可以通过max-age来标记过期时间。

协议中说明：“过期时间不能被用于强制客户代理去刷新显示或重载资源;过期的语义只能应用于缓存机制, 并且当对资源的发起新请求时,此机制只需检测此资源的过期状态。”

在指定时间后，如果指定的时间为消息产生后的时间，则表明改资源是可缓存的。

经过expire.php 测试，浏览器依旧会重新发送请求。

而且就算将时间设置在消息产生之前，依旧会缓存页面。

Expires和max-age是强缓存头。

####Cache-Control
Cache-Control格式组成为：

	Cache-Control = "Cache-Control" ":" 1#cache-directive 
	cache-directive = cache-request-directive | cache-response-directive

#####标记哪些可被缓存	
其中cache-response-directive 中通过以下几个标记一个内容是否可被缓存。

1.	public:可被缓存。默认通过https的是不被缓存的，但是可以通过public指定。
2.	private：标记内容仅可对特定用户缓存
3.	no-cache：不能被缓存

#####标记哪些可被保存
`no-store`可在请求和响应中使用，表明内容不能被缓存，以防止一些敏感信息被不经意间扩散。

max-age可以覆盖Expires头。

s-maxage只能用于public的情况下。

#####过期计算
reshness_lifetime表示响应的保鲜时间。

如果指定了max-age，那么 reshness_lifetime = max_age_value

如果没有指定max-age,指定了Expires time:reshness_lifetime=expires_value-date_value

判断响应是否过期：response_is_fresh = (freshness_lifetime > current_age)


######强制从源服务器验证
Cache-Control:max-age=0
######强制从源服务器获得新的副本
Cache-Control:no-cache

###验证模型
1.	Last-Modified:实体的最后更新时间
2.	Entity Tag:通过时间来验证可能会产生误差，通过ETag能更加精确的验证缓存。


