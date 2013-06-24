$("#o").click(function(){

	var img=$("#o").attr('src');

	if(img=="loveones.jpg"){
		$("#o").attr('src','w.jpg');
	}

	if(img=="w.jpg"){
		$("#o").attr('src','m.jpg');
	}

	if(img=="m.jpg"){
		$("#o").attr('src','loveones.jpg');
		$("#address").text("杨期和钱科佳诚挚邀请您参加在背景时间2013年10月6日晚上5点，在宁波市北仑区小港街道新政村杨家137号举行的婚礼晚宴!");
	}
	
	$("#address").show('SLOW');
});


