---
layout: post
category: WEB前端优化
description: Google Pagespeed 规则，提升WEB的前端性能
keywords: page speed ,前端性能
title: 前端优化之 Google Pagespeed 规则
tags: [pagespeed, web, 前端优化]
summary: Java Reference
---
Google Pagespeed Rules 介绍了Google总结的一些WEB前端优化最佳实践，建议阅读它的原文[PageSpeed Rules](https://developers.google.com/speed/docs/best-practices/rules_intro)。

此文作为原文的读书笔记：）
###一.Http缓存
利用缓存可以减少RTT和带宽。

可以使用浏览器缓存和代理缓存。

参考地址：[Optimize caching](https://developers.google.com/speed/docs/best-practices/caching)

####(一).浏览器缓存
如果没有指定header,一些浏览器会用一些启发式算法来确定资源的过期时间。

建议将所有静态资源缓存，包含图片、flash、css、js等，事实上HTML并不是静态的，不应该被缓存。

HTTP/1.1 提供了下面两种类型的缓存响应头：

1.	Expires和Cache-Control:max-age
2.	Last-Modified和ETag

其中Expires和max-age是强制型的缓存响应头，表示只要指定，如果还在缓存有效期内，浏览器则不应该再发生GET请求。而Last-Modified是弱缓存响应头。


####(二).代理缓存
通过制定Cache-Control:public 可以指明资源可以被公开的代理缓存。要注意避免对那些设置cookie的资源设置缓存。

###二.减少Rount-trip time
RTT:rount trip time表示从客户端发起请求，到服务端返回响应的时间，但是不包含数据传输的时间。因此RTT和带宽没有关系。

参考地址：(Minimize round-trip times)[https://developers.google.com/speed/docs/best-practices/rtt]

一次网页请求至少包含3个RTT:

1. DNS解析
2. 建立TCP连接
3. HTTP请求和响应

可以通过这些方法减少RTT:

1.	减少DNS查询
2.	减少重定向
3.	避免坏请求(404等)
4.	合并外部的js\css
5.	使用CSS Split来减少图片的请求
6.	优化js和css的顺序
7.	避免使用document.write来加载资源。
8.	避免CSS @import，因为浏览器没有办法并发处理原css文件和@import的，会导致RTT变长。
9.	尽量使用异步加载
10.	通过不同的hostsname优化并行加载。

#####减少DNS查询

尽管DNS查询可以被缓存，但是过多的DNS查询还是会很耗费时间。

这和通过不同域名间的并发资源下载需要做个权衡。

经验原则：一般建议一张页面的不同域名在1个~5个之间，如果资源总数少于6个，则不要使用超过一个的域名；在一个域名下，只有2个资源更是浪费。

使用同个域名，可以使客户端更多的重用TCP连接，以减少RTT时间。

#####减少重定向
客户端的重定向会发起一次额外的请求，这就意味着会增加RTT时间。

避免重定向或者多次重定向，尽量使用服务端的重定向。

对于打点的情况，使用response 为 204（no content）的方法，比请求1X1px的透明图片更快。

通过PHP 可以这样设置 ：

	header("HTTP/1.1 204 No Content");
	
#####避免错误请求
减少错误的链接数： 404 或者 410（Gone，表示永久移除的资源）的数量。

错误的链接会带来额外的资源浪费。

#####合并外部JS请求
由于javascript文件通常是串行下载的，因此合并多个js文件可以减少RTT，能够提升性能。

经验原则：最好不要超过两个js文件。

#####合并外部CSS请求
通过合并css，能够减少RTT。

经验原则：最好不要超过两个css文件，一个包含最小内容，但是是初始页面渲染所必须的，另个则是为剩余完整渲染准备的。

#####通过CSS sprite 合并图片
通过css sprite 技术可以减少图片的RTT请求数。合并的图片使用更少的留白、更小的色素可以减少图片大小。

#####优化CSS和JS的顺序
由于下载JS的时候，会阻塞其它资源的下载，因此尽量使css的申明在js之前。这样可以在并发下载css的时候，进行至少一个js的下载。

#####避免使用document.write来加载资源
直接通过`<script>`标签来加载，而非用document.write来加载可以最大程度使用并发下载来减少总的RTT时间。

#####避免css @import 来加载资源
也是用于@import后无法使用并发加载，从而增加RTT时间。

#####使用异步加载资源
在常规的使用script的时候，资源下载的时候会阻塞html的继续解析渲染，但是使用异步加载的话，就可以避免这个问题。

	<script>
	var node = document.createElement('script');
	node.type = 'text/javascript';
	node.async = true;
	node.src = 'example.js';
	// Now insert the node into the DOM, perhaps using insertBefore()
	</script>

比如GA打点的代码，由于要放在`</head>`之前，使用异步的方式，将不会影响页面的渲染

	<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-XXXXX-X']);
	  _gaq.push(['_trackPageview']);
	
	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	
	</script>
	
#####通过不同的主机名来并发下载
一般浏览器会有单个域名下的并发下载限制，因此使用不同域名能够提升并发量。

对于静态内容应该不带cookie访问。

曾经有个技巧就是通过DNS的CNAME记录(DNS别名)，来达到不同主机名的目的。 

###三.减少请求开销
浏览器会尝试每次http请求都会带上对应路径的cookie信息，大部分请求是非对称的，请求的大小和响应的大小比例可以达到1：4~1：20 。

TCP协议为了避免网络堵塞，对于新的连接采用了慢启动([slow start](http://blog.csdn.net/zavens/article/details/5539372))的算法，如果初次请求大小过大，会增加额外的RTT时间。

可以通过下面两种方法减少请求的开销：
####（一）.最小化请求大小
尽量把一次HTTP请求控制在一个packet内，一般一个packet大小为1500byte。

最小化cookie的大小，避免使用无效和重复的cookie；尽量使用server端的存储，cookie中只存id。可以通过cookie的过期时间来响应控制server端的过期。

减少header的大小，比如URL越短,GET和POST的也会越短。

####（二）.对于静态资源使用少cookie的域名
对于js\css\image等静态资源，避免使用带cookie的域名，这样可以减少每次请求的大小。

###四.减少负载大小

一般在以太网传输的包大小为1500bytes(MTU,Max Transmission Unit)，尽可能减少服务端的响应数据的大小，可以显著减少应用的延迟，尤其是对于网络带宽比较差的区域。

####（一）.开启压缩
使用`Content-Encoding`为gzip或者deflate来开启内容压缩，以减少页面内容的传输大小。

但是如果内容本身低于150byte，则可能会越压缩越大，同时也要注意压缩带来的额外的CPU开销。


####（二）.移除不必要的CSS
移除不必要的CSS，以使浏览器尽快开始首屏渲染。

####（三）.最小化CSS、JS和HTML
通过压缩，移除不必要的空格、换行符等以减少css\js\html的大小，减少内容的传输。

####（四）.延迟JS的加载
由于浏览器加载JS的时候，会阻塞其它资源的加载。

对于首屏页面不必要的js，应该尽量的延迟加载或者异步加载。

####（五）.优化图片
采用合适的图片格式，比如对于小于10X10px的图片，GIF格式更加合适。其它情况下尽量采用PNG格式等。

####（六）.对于资源提供一致的URL
避免同个资源使用不同的URL，以最大化的利用缓存。


###五.优化浏览器渲染

####（一）.使用高效的CSS选择器
优化CSS选择器，使用高效的选择，比如避免遍历式的写法，以及没必要的写法。

####（二）.避免CSS表达式
####（三）.把CSS放在head中
由于浏览器在渲染的时候，如果遇到CSS相关代码，浏览器会阻塞渲染；

因此将CSS放到head上，可以有效减少浏览器阻塞的时间。
####（四）.指定图片的大小
指定图片的大小和位置，可以很好的避免浏览器因为图片的布局，而导致的重新渲染。

同时必须要确定合适的图片大小，比如对于100X100的图片，不要设置成10X10。
####（五）.指定字符集
对于不确定的字符集，浏览器会缓存一部分数据后，然后使用某些策略猜测字符编码后，才会开始解析渲染页面。

因此，建议预先指定字符的编码信息，使浏览器可以直接获得明确的字符编码信息。


###六.移动端的优化
####（一）.延迟JS的解析
通过`<script async>`这个HTML5标签，可以延迟JS的加载。

由于移动端的用户经常会等到浏览器加载完成后才才是操作，因此将js放在页面底部不是第一选择的。

####（二）.缓存lading page
缓存移动用户的跳转到移动版的网站，建议使用302跳转，并且将`Cache-Control`设为 private ，避免缓存影响非移动网站用户的访问。








