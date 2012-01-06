<?php

class Srdata_Model_Style extends Zend_Db_Table_Row_Abstract
{

	private $_columnMap = array( 
		'fillColor' 				=> 'fillcolor',
		'fillOpacity' 			=> 'fillopacity',
		'strokeColor' 			=> 'strokecolor',
		'strokeOpacity' 		=> 'strokeopacity',
		'strokeWidth'				=> 'strokewidth',
		'pointRadius'				=> 'pointradius',
		'fontColor'					=> 'fontcolor',
		'fontSize'					=> 'fontsize',
		'fontFamily'				=> 'fontfamily',
		'fontWeight'				=> 'fontweight',
		'fontOpacity'				=> 'fontopacity',
		'labelAlign'				=> 'labelalign'

	);	

	protected function _transformColumn($columnName) {
		$retStr = strtolower($columnName);
		if( array_key_exists($columnName, $this->_columnMap) ) {
			$retStr = $this->_columnMap[$columnName];
		}
		return $retStr;
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
