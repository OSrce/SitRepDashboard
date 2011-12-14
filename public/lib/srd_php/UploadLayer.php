<?php

if(isset( $_GET["fileName"])  ){
		$fileName = $_GET["fileName"].".gml";
		header('Content-type: application/gml');
		header('Content-Disposition: attachment; filename="'.$fileName.'"');

		$fileName = "../../../srd_uploads/".$_GET["fileName"].".gml";
		readfile($fileName);
}


if( isset( $_POST["fileName"] ) ) {
/*	if( isset( $_POST["localSave"]) ) {
		$fileName = $_POST["fileName"].".gml";
		header('Content-type: application/gml');
		header('Content-Disposition: attachment; filename="'.$fileName.'"');
		print($_POST["layerData"]);

	} else {
*/
		$fileName = "../../../srd_uploads/".$_POST["fileName"].".gml";
		$fileHandle = fopen($fileName,"w");
		fwrite($fileHandle, $_POST["layerData"] );
		fclose($fileHandle);
//	}
}

return;

?>



