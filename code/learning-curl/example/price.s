#get_price.sh
curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8) AppleWebKit/536.25 (KHTML, like Gecko) Version/6.0 Safari/536.25" $* | grep "actualPriceValue" | sed -e 's/<[^>]*>//g' | sed -e 's/[ ,$]//g'

用法：./get_price.sh http://www.amazon.com/Motorola-MOTOACTV-Sports-Watch-Player/dp/B007C1KKW8/ref=pd_bxgy_e_img_b
