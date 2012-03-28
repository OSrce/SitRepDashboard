<?php

class Srdata_Model_Feature extends Zend_Db_Table_Row_Abstract
{
	protected $layer_id;

	//CUSTOM FUNCTION FOR converting Feature ROW Object to regular array.
	// We use this to do the transform on the geometry column.
	public function toArray() {
		
		return parent::toArray();
	}

	//CUSTOM FUNCTION FOR converting regular array to Feature ROW Object.
	// We use this to do the transform on the geometry column.
	public function setFromArray($data) {

		return parent::setFromArray($data);
	}

}

