<?php

class Srdata_Model_Layer extends Zend_Db_Table_Row_Abstract
{

	protected function _transformColumn($columnName) {
		$retStr = strtolower($columnName);
		if($columnName == 'sphericalMercator') {
			$retStr = 'sphericalmercator';
		} elseif($columnName == 'isBaseLayer') {
			$retStr = 'isbaselayer';
		} elseif($columnName == 'numZoomLevels') {
			$retStr = 'numzoomlevels';
		} elseif($columnName == 'maxzoomlevel') {
			$retStr = 'maxZoomLevel';
		} elseif($columnName == 'minzoomlevel') {
			$retStr = 'minZoomLevel';
		}	

		return $retStr;
	}


	public function toArray() {

 date_default_timezone_set("America/New_York");
      $logger = new Zend_Log();
      $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
		$retArr = parent::toArray();
		$logger->log("printLayer:".print_r($retArr,true),Zend_Log::DEBUG);
		foreach($retArr as $key => $val) {	
			if( preg_match('/sphericalmercator/', $key) ) {
				unset( $retArr[$key] );
				$retArr['sphericalMercator'] = $val;
			} elseif ( preg_match('/isbaselayer/',$key) ) {
				unset( $retArr[$key] );
				$retArr['isBaseLayer'] = $val;
			} elseif ( preg_match('/numzoomlevels/',$key) ) {
				unset( $retArr[$key] );
				$retArr['numZoomLevels'] = $val;
			} elseif ( preg_match('/maxzoomlevel/',$key) ) {
				unset( $retArr[$key] );
				$retArr['maxZoomLevel'] = $val;
			} elseif ( preg_match('/minzoomlevel/',$key) ) {
				unset( $retArr[$key] );
				$retArr['minZoomLevel'] = $val;
			}	

		}

		$logger->log("afterLayer:".print_r($retArr,true),Zend_Log::DEBUG);
		return $retArr;
	}

}

