#!/bin/bash

ALL="白羊座 金牛座 双子座 巨蟹座 狮子座 处女座 天秤座 天蝎座 射手座 摩羯座 水瓶座 双鱼座"


RET=""

function gen {

	HIT="巨蟹座"

	total=12
        
	while  [ $total -gt 0 ]
	do	
		hitIndex=$((RANDOM%$total+1))
		hit=$(echo $ALL| awk '{print $'$hitIndex'}')		
		ALL=${ALL/$hit/}
		RET="$RET $hit"
		((total--))
	done

	echo "======================="
	echo "$1"
	echo $RET | awk '{for(i=1;i<=NF;i++){print "第"i"名:"$i}}' 
	echo "======================="

}

cat <<-END
输入你想要的星座排名描述,比如2013年十大运势星座
END

read input

gen "$input"
