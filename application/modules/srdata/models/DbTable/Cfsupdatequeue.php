<?php

class Srdata_Model_DbTable_Cfsupdatequeue extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_cfs_updatequeue';
		protected $_rowClass = 'Srdata_Model_Cfsupdatequeue';
		protected $_primary = array('cfs_date', 'cfs_num');
		protected $_sequence = false;
}

