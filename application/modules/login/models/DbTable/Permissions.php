<?php

class Login_Model_DbTable_Permissions extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_acl_permissions';
		protected $_rowClass = 'Login_Model_Permission';

		public function getPermissions($roleType, $roleId) {

		date_default_timezone_set("America/New_York");
    $logger = new Zend_Log();
    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
		$metadata = $this->info('metadata');
//    $logger->log("Permissions Meta:".print_r($metadata,true),Zend_Log::DEBUG);	


			$select = $this->select()->where('role_type = ? AND role_id = ?', strtolower($roleType), $roleId );	
			$select = $this->select()->where('role_id = ?', $roleId );	
			return $this->fetchAll($select);
	

//			$perms =  $this->fetchAll();

//    $logger->log("Permissions :".print_r($perms,true),Zend_Log::DEBUG);	
//			return $perms;

		}


}

