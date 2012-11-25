###代理的几种方式

####JDK Proxy
Proxy.newInstance(ClassLoader,interfaces[],InvocationHandler(Object target))

通过实现InvocationHandler 可以代理target。

缺点是：只能代理接口。

[演示代码](https://github.com/llohellohe/cp/blob/master/src/yangqi/hotspot/proxy/ProxyRunner.java)
