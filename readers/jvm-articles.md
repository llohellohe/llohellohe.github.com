JVM相关资料
###一.大页内存
原理介绍地址：http://kenwublog.com/tune-large-page-for-jvm-optimization

开启方法介绍地址：http://dino.ciuffetti.info/2011/07/howto-java-huge-pages-linux/
#####概要：
#####页和帧
为了更好的利用和扩展物理内存，操作系统都有MMU（内存管理单元），将虚拟内存地址映射到物理内存地址。

其中分页式的虚拟内存，将虚拟内存分为页（Page），将物理内存分为页帧（Frame），并且保证两者的大小一致，以便让页映射到桢。

两者的映射关系被存放在内存中的页表(Page Table)中。

######TLB（页表寄存器缓冲）
为了进一步优化，将部分页和桢的隐射关系保存在TLB中，只有miss时才访问页表。

因为CPU访问寄存器会通过总线访问内存。

如果要提高TLB的命中率，则必须提高页的大小，这样就可以尽可能多的存储映射关系。


######调整参数
操作系统中查看大页情况：

	cat /proc/meminfo | grep Huge
	
	HugePages_Total:   469
	HugePages_Free:    469
	HugePages_Rsvd:      0
	Hugepagesize:     2048 kB
	
Jvm中参数`-XX:LargePageSizeInBytes=10m`


如果操作系统不支持大页内存，那么调了JVM参数也是白搭.

