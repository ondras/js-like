<?php
	include("config.php");
	$action = (isset($_GET["action"]) ? $_GET["action"] : "");
	
	switch ($action) {
		case "test":
			echo ":)";
		break;
		
		case "save":
			$name = $_GET["name"];
			$hash = sha1($name . SECRET);
			
			$n = mysql_real_escape_string($name);
			$d = mysql_real_escape_string($HTTP_RAW_POST_DATA);
			
			mysql_query("DELETE FROM `js-like` WHERE name='$n'");
			mysql_query("INSERT INTO `js-like` (name, hash, data) VALUES ('$n', '$hash', '$d')");
			setcookie($name, $hash, time() + 60*60*24*365, "/");
		break;
		
		case "load":
			$hash = $_GET["hash"];
			$h = mysql_real_escape_string($hash);
			
			$result = mysql_query("SELECT data FROM `js-like` WHERE hash='$h'");
			if (!mysql_num_rows($result)) {
				header("HTTP/1.0 404 Not found");
				echo "Not found";
			} else {
				$row = mysql_fetch_assoc($result);
				echo $row["data"];
			}
		break;
		
		default:
			header("HTTP/1.0 501 Not Implemented");
			echo "Not Implemented";
		break;
	}
?>