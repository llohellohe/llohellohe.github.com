<?php
$upload_file=$_FILES['upload_file']['tmp_name'];  
$upload_file_name=$_FILES['upload_file']['name'];

move_uploaded_file($upload_file,"/tmp/$upload_file_name");


foreach ($_POST as $key => $value) {
	echo "param $key : $value\n";
}

?>