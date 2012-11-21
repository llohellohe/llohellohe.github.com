#!/bin/bash

BASE=$PWD

PAGE=a.html


##下载测试页面
curl -o a.html  "http://llohellohe.github.com/temp/a.html"


##获得页面的页面的CSS,并且压缩成一个文件，名为 页面名.css

CSSS=$(grep -E -o '(http://.*.css)' $PAGE)

CSS_NAME=${PAGE%%.html}.css

for css in $CSSS
do
	curl "$css" | sed '/\/\*/d' | sed -e 's/\( \)\{1,\}/\1/g' | sed '/^$/d' >> $CSS_NAME
done


##获得页面的页面的JS,并且压缩成一个文件，名为 页面名.js
JSS=$(grep -E -o '(http://.*.js)' $PAGE)

JS_NAME=${PAGE%%.html}.js

for js in $JSS
do
	curl "$js" | sed '/\/\*/d' | sed -e 's/\( \)\{1,\}/\1/g' |  sed '/^$/d'  >> $JS_NAME
done


##将css放在页面顶部，将js放在页面底部，并压缩这个页面（去除多余空格，删除多行）
cat $PAGE | sed '/.js/d' | sed '/.css/d' | sed -e 's:</body>:<script src="'$JS_NAME'"></script></body>:g' | sed -e 's:<body>:<link rel="stylesheet" type="text/css" href="'$CSS_NAME'" /><body>:g' | sed -e 's/\( \)\{1,\}/\1/g' | sed '/^$/d' > b.html
