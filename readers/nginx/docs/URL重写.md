###if指令

	~  表示不区分大小写的匹配
	~* 表示区分大小写的匹配
	-d !-d 判断目录存在与否
	-f !-f 判断文件存在与否
	-e !-e 判断文件或者目录存在与否
	
	
	
###rewrite 指令

302永久重定向
	
	location /baidu/ {
        rewrite ^/baidu/ /index.html redirect;
    }
    

301临时重定向

	rewrite ^/baidu/ /index.html permanent;


###return 指令
直接返回状态码


###反向代理

	location ^~ /blog/ 
	{ 
	
	    proxy_set_header Host www.baidu.com; 
	    proxy_pass http://www.baidu.com/; 
	}
	
必须加上proxy_set_header。

在proxy_pass中，

1.	如果不以`/`结尾，则匹配所有url。
2.	如果以`/`结尾，则忽略匹配的部分

