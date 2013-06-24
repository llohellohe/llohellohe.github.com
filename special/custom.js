$("#o").click(function(){

	var img=$("#o").attr('src');

	if(img=="loveones.jpg"){
		$("#o").attr('src','w.jpeg');
	}

	if(img=="w.jpeg"){
		$("#o").attr('src','m.jpeg');
	}

	if(img=="m.jpeg"){
		$("#o").attr('src','loveones.jpg');
	}
});


