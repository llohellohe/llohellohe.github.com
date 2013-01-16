<?php
	setcookie("age",201);
	
	echo "COOKIE IS \n";
	foreach ($_COOKIE as $key => $value) {
		echo "$key => $value\n";
	}

?>
