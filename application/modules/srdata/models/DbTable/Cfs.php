<?php

class Srdata_Model_DbTable_Cfs extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_cfs_withlocation';
		protected $_rowClass = 'Srdata_Model_Cfs';
		protected $_primary = array('cfs_date', 'cfs_num');
		protected $_sequence = false;
}

