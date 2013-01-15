<?php

foreach ($_GET as $key => $value) {
	echo "param $key : $value\n";
}

echo "=======POST INFO=======\n";

foreach ($_POST as $key => $value) {
	echo "param $key : $value\n";
}
?>
