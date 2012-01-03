<?php

class Login_Model_DbTable_Permissions extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_acl_permissions';
		protected $_rowClass = 'Login_Model_Permission';

}

