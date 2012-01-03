<?php

class Login_Model_DbTable_Modules extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_modules';
    protected $_primary = 'id';
		protected $_rowClass = 'Login_Model_Module';

}

