<?php

class Srdata_Model_Layer extends Zend_Db_Table_Row_Abstract
{

	private $_columnMap = array( 
		'sphericalMercator' 	=> 'sphericalmercator',
		'isBaseLayer' 			=> 'isbaselayer',
		'numZoomLevels'			=> 'numzoomlevels',	
		'maxZoomLevel'			=> 'maxzoomlevel',	
		'minZoomLevel'			=> 'minzoomlevel'
	);	

	protected function _transformColumn($columnName) {
		$retStr = strtolower($columnName);
		if( array_key_exists($columnName, $this->_columnMap) ) {
			$retStr = $this->_columnMap[$columnName];
		}
		return $retStr;
	}

	public function setFromArray($data) {
		foreach($data as $key => $val) {
			unset( $data[$key] );
			$key = $this->_transformColumn($key);
			$data[$key] = $val;
		}
		return parent::setFromArray($data);	
	}


	public function toArray() {
		$retArr = parent::toArray();
		foreach($retArr as $key => $val) {	
			if( $newColName = array_search( $key, $this->_columnMap) ) {
				unset( $retArr[$key] );
				$retArr[$newColName] = $val;
			}
		}
		return $retArr;
	}
	//END toArray
}

