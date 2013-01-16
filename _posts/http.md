####Accept-Encoding
可以接受的页面编码（压缩的方式）
一般分为Gzip和defalte，在Apache中，这是有mod_gzip和mod_defalte的压缩模块压缩的。
mod_gizp的压缩比更高点，mod_defalte的压缩速度更快。

####Content-Encoding
响应头的编码信息


sdch:Shared Dictionary Compression over HTTP
Google推出的压缩算法，针对不同目录下的相同内容进行压缩，减少传输量。
比如不同网页有公用的侧边栏、导航栏等，通过压缩相同的内容，可以减少传输量。


####Accept-Charset
接受的字符编码；浏览器中的查看编码，并不会改变header中的accetpt-charst

####HOST


####Content-type
Content-Type: text/html; charset=ISO-8859-4