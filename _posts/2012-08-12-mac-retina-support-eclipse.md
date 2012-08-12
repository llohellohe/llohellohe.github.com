---
layout: post
description: RMBP ,Mac book Retina 支持Eclipse
keywords: retina support eclipse
summary: mac book pro 上的eclipse 支持视网膜屏幕
---
有没有发现，兴冲冲的在新买的Retina Mac Book Pro 上装上了Eclipse，

然后打开窗口，开始写代码后丑的一塌糊涂，这恶心的字体！

别急，其实很简单。只需如下操作即可。
进入到eclipse的安装目录然后进入Eclipse.app

	vi Info.plist
	在</dict>前面加入下面代码支持Retina的Key
	
	<key>NSHighResolutionCapable</key>
    <true/>
    </dict>  
    
保存后，

	cp -r Eclipse.app Eclipse.app.bak
	rm Eclipse.app
	mv Eclipse.app.bak Eclipse.app
	
这样做的目的是为了让系统能感知到这个变更。

但具体为什么这样做，具体的原理是什么，有没有什么替代方法，我到现在还不知道。