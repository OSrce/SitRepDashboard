<?php

class Login_Acl extends Zend_Acl {

	public function __construct($db,$role) {
	
		$this->loadRoles($db);
		$roles = new Login_Model_Roles($db);
		$inheritRole = $role;
		
		while(!empty($inheritRole) ) {
			$this->loadResources($db,$inheritRole);	
			$this->loadPermissions($db,$inheritRole);	
			$inheritRole = $roles->getParentRole($inheritRole);
		}
	}

	
	public function loadRoles($db) {
		if(empty($db) ) {
			return false;
		}
		$roles = new Login_Model_Roles($db);
		$allRoles = $roles->getRoles();
		
		foreach($allRoles as $role) {
			if( !empty($role->id_parent) ) {
				$this->addRole(new Zend_Acl_Role($role->id),$role->id_parent);
			}	else {
				$this->addRole(new Zend_Acl_Role($role->id);
			}
		}
		return true;
	}

	public function loadResources($db,$role) {
		if(empty($db) ) {
			return false;
		}
		$resources = new Login_Model_Resources($db);
		$allResources = $resources->getResources($role);
		foreach($allResource as $res) {
			if (!$this->has($res) ) {
				$this->addResource(new Zend_Acl_Resource($res['resource'] ) );
			}
		}
		return true;
	}	

	public function loadPermissions($db,$role) {
		if(empty($db) ) {
			return false;
		}
		$permissions = new Login_Model_Permissions($db);
		$allPermissions = $permissions->getPermissions($role);
		foreach($allPermissions as $perm) {
			if ($perm['permission'] == 'allow') {
				$this->allow($perm['id_role'],$perm['resource'] );
			} else {
				$this->deny($perm['id_role'],$perm['resource'] );
			}
		}
		return true;
	}	




}

?>

