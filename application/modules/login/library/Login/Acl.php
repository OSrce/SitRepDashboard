<?php

class Login_Acl extends Zend_Acl {

	private $the_db;

	public function __construct($db,$uid,$gid) {
	
//		$this->loadRoles($db);
		$this->the_db = $db;
		$groupsTable = new Login_Model_DbTable_Groups($db);
		$permissionsTable = new Login_Model_DbTable_Permissions($db);
		$roleType = "uid";
		$roleId = $uid;
		$parentType = 'gid';
		$parentId = $gid;		

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

/*		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
		$logger->log("loadRole Called::::".$theRole."===".$theParentRole,Zend_Log::DEBUG);	
*/

		if( is_null($parentId) ) {
			if(!$this->hasRole($theRole) ) {
//				$logger->log("loadRole: addRole ".$theRole,Zend_Log::DEBUG);	
				$this->addRole(new Zend_Acl_Role($theRole) );
				$this->loadPermissions($roleType,$roleId);
			}
		} else {
			$ppRole = $groupsTable->getParentGroup($parentId);
			$ppType = $parentType;
			if( is_null($ppRole) ) {
				if(!$this->hasRole($theParentRole) ) {
//					$logger->log("loadRole: addRole ".$theParentRole,Zend_Log::DEBUG);	
					$this->addRole(new Zend_Acl_Role($theParentRole) );
					$this->loadPermissions($parentType,$parentId);
				}

//				$logger->log("loadRole: addRole ".$theRole."===".$theParentRole,Zend_Log::DEBUG);	
				$this->addRole(new Zend_Acl_Role($theRole),$theParentRole);
				$this->loadPermissions($roleType,$roleId);
			} else {
				$this->loadRole($groupsTable,$ppType,$parentId,$ppType,$ppRole);
//				$logger->log("loadRole: addRole ".$theRole."===".$theParentRole,Zend_Log::DEBUG);	
				$this->addRole(new Zend_Acl_Role($theRole),$theParentRole);
				$this->loadPermissions($roleType,$roleId);
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
		if(empty($this->the_db) ) {
			return false;
		}

		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
		$logger->log("GetPermissions For:".$roleType.":::".$roleId,Zend_Log::DEBUG);

	
		$permissionsTable = new Login_Model_DbTable_Permissions($this->the_db);
		$allPermissions = $permissionsTable->getPermissions($roleType,$roleId);
		foreach($allPermissions as $perm) {
//			$logger->log("thePerm type= ".get_class($perm),Zend_Log::DEBUG);
//			$logger->log("thePerm role_id= ".$perm->role_id,Zend_Log::DEBUG);
			$resType = $perm->resource_type;
			$resId = $perm->resource_id;
			$theResource = $resType.':'.$resId;
			$logger->log("TheResource:".$theResource,Zend_Log::DEBUG);

			if( ! $this->has($theResource) ) { 
				$this->addResource(new Zend_Acl_Resource( $resType.":".$resId)  ); 
			}
			if ($perm->permission_read == 'allow') {
				$logger->log("ACL Allow:".$theResource." FOR ".$resId,Zend_Log::DEBUG);
				$this->allow($roleType.":".$roleId, $resType.":".$resId , 'read' );
			} else {
				$this->deny($roleType.":".$roleId, $resType.":".$resId , 'read' );
			}
			if ($perm->permission_create == 'allow') {
				$this->allow($roleType.":".$roleId, $resType.":".$resId , 'create' );
			} else {
				$this->deny($roleType.":".$roleId, $resType.":".$resId , 'create' );
			}
		}
		return true;
	}	




}

?>

