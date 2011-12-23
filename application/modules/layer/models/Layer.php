<?php

class Layer_Model_Layer extends Zend_Db_Table_Row_Abstract
{

	protected function _transformColumn($columnName) {
		return strtolower($columnName );
	}


}

