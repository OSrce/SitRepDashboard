<?php

class Login_Acl extends Zend_Acl {

	private $the_db;

	public function __construct($db,$uid,$gid) {
	
//		$this->loadRoles($db);
		$groupsTable = new Login_Model_DbTable_Groups($db);
		$roleType = "UID";
		$roleId = $uid;
		$parentType = 'GID';
		$parentId = $gid;		
		$this->_the_db = $db;

		$this->loadRole($groupsTable,$roleType,$roleId,$parentType,$parentId);
/*
		while( !empty($roleId) ) {
//			$this->loadResources($db,$inheritRole);	
			if($roleType != "UID") {
				$parentId = $groupsTable->getParentGroup($roleId);
			}
			$this->loadPermissions($db,$roleType,$roleId,$parentId);	
			$roleType = "GID";
			$roleId = $parentId;

		}
*/
	}
	
	public function loadRole($groupsTable,$roleType,$roleId,$parentType,$parentId) {
		$theRole = $roleType.':'.$roleId;
		$theParentRole = $parentType.':'.$parentId;

		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
		$logger->log("TEST5:".$theRole."===".$theParentRole,Zend_Log::DEBUG);	

		if( is_null($parentId) ) {
			if(!$this->hasRole($theRole) ) {
				$this->addRole(new Zend_Acl_Role($theRole) );
				$logger->log("TEST6:".$theRole,Zend_Log::DEBUG);	
//				$this->loadPermissions($theRole);
			}
		} else {
			$ppRole = $groupsTable->getParentGroup($parentId);
			$ppType = 'GID';
			if( is_null($ppRole) ) {
				if(!$this->hasRole($theParentRole) ) {
					$this->addRole(new Zend_Acl_Role($theParentRole) );
				$logger->log("TEST7:".$theParentRole,Zend_Log::DEBUG);	
				}
				$this->addRole(new Zend_Acl_Role($theRole),$theParentRole);
				$logger->log("TEST8:".$theRole."===".$theParentRole,Zend_Log::DEBUG);	
//				$this->loadPermissions($theRole,$theParentRole);
			} else {
				$this->loadRole($groupsTable,$ppType,$parentId,$ppType,$ppRole);
			}
		}
	}



/*	
	public function loadRoles($db) {
		if(empty($db) ) {
			return false;
		}
		$groupsTable = new Login_Model_Groups($db);
		$allGroups = $roles->getRoles();
		
		foreach($allRoles as $role) {
			if( !empty($role->id_parent) ) {
				$this->addRole(new Zend_Acl_Role($role->id),$role->id_parent);
			}	else {
				$this->addRole(new Zend_Acl_Role($role->id) );
			}
		}
		return true;
	}

	public function loadResources($db,$role) {
		if(empty($db) ) {
			return false;
		}
		//THIS FUNCTION IS TO LOAD THE LIST OF MODULES AND LAYERS
		// THAT THIS 'ROLE' (either 'UID:UID' or 'GID:GID') has.

		// FIRST LETS GET ALL MODULES FOR ROLE :
		$modulesTable = new Login_Model_Modules($db);
		$allModules = $modulesTable->getModules($role);
		foreach($allModules as $mod) {
			if(!this->has('MOD:'.$mod->id) ) {
				$this->addResource(new Zend_Acl_Resource("MOD:".$mod->id) );
			}
		}		
		// NEXT LETS GET ALL LAYERS FOR ROLE :
		$layersTable = new Login_Model_Modules($db);
		$allModules = $modulesTable->getModules($role);
		foreach($allModules as $mod) {
			if(!this->has('MOD:'.$mod->id) ) {
				$this->addResource(new Zend_Acl_Resource("MOD:".$mod->id) );
			}
		}		

		return true;
	}	
*/

	public function loadPermissions($roleType, $roleId,$parentId=null) {
		if(empty($this->_the_db) ) {
			return false;
		}
		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
	
		$permissions = new Login_Model_DbTable_Permissions($this->_the_db);
		$allPermissions = $permissions->getPermissions($roleType,$role);
		foreach($allPermissions as $perm) {
			$resType = $perm['resource_type'];
			$resId = $perm['resource_id'];
			$theResource = $resType.':'.$resId;
			$logger->log("TEST:".$theResource,Zend_Log::DEBUG);

			if( ! $this->has($theResource) ) { 
				$this->addResource(new Zend_Acl_Resource( $resType.":".$resId)  ); 
			}
			if ($perm['read'] == 1) {
				$this->allow($roleType.":".$roleId, $resType.":".$resId , 'read' );
			} else {
				$this->deny($roleType.":".$roleId, $resType.":".$resId , 'read' );
			}
			if ($perm['create'] == 1) {
				$this->allow($roleType.":".$roleId, $resType.":".$resId , 'create' );
			} else {
				$this->deny($roleType.":".$roleId, $resType.":".$resId , 'create' );
			}
		}
		return true;
	}	




}

?>

