<?php

class Login_Plugin_Securitycheck extends Zend_Controller_Plugin_Abstract {

	const MODULE_NO_AUTH='login';
	private $_controller;
	private $_module;
	private $_action;

	public function preDispatch (Zend_Controller_Request_Abstract $request) {
		$this->_controller = $this->getRequest()->getControllerName();
		$this->_module = $this->getRequest()->getModuleName();
		$this->_action = $this->getRequest()->getActionName();

		$auth = Zend_Auth::getInstance();

		$redirect = true;
		if($this->_module != self::MODULE_NO_AUTH) {
			if($this->_isAuth($auth) ) {
					$user = $auth->getStorage()->read();

//				$this->_role = $user['id_role'];
				$bootstrap = Zend_Controller_Front::getInstance()->getParam('bootstrap');
				$db = $bootstrap->getResource('db');
				
	
//				$maanger = $bootstrap->getResource('cachemanager');
//				$cache = $manager->getCache('acl');
					$this->_uid = $user['uid'];
					$this->_gid = $user['gid'];

//				if( ($acl = $cache->load('ACL_'.$this->_role)) == false) {
					$acl = new Login_Acl($db,$this->_uid,$this->_gid);

//					$cache->save($acl,'ACL_'.$this->_role);
//				}

				if( $this->_isAllowed($auth,$acl) ) {
					$redirect=false;
				} else {
					// AUTHENTICATED BUT ACL DENIED :
					$request->setModuleName('login');
					$request->setControllerName('index');
					$request->setActionName('notauthorized');
					return;
				}
			} 
		} else {
			$redirect = false;
		}
	
		if($redirect) {
			$request->setModuleName('login');
			$request->setControllerName('index');
			$request->setActionName('index');
		}

	}

	private function _isAuth (Zend_Auth $auth) {

		if( !empty($auth) && ($auth instanceof Zend_Auth) ) {
				return $auth->hasIdentity();
		} 
		return false;
	}



	private function _isAllowed($auth,$acl) {
		if(empty($auth) || empty($acl) ||
			!($auth instanceof Zend_Auth) ||
			!($acl instanceof Zend_Acl) ) {
				return false;
		}
		$resources = array(
			'*/*/*',
			$this->_module.'/*/*',
			$this->_module.'/'.$this->_controller.'/*',
			$this->_module.'/'.$this->_controller.'/'.$this->_action
		);

		$bootstrap = Zend_Controller_Front::getInstance()->getParam('bootstrap');
		$db = $bootstrap->getResource('db');
	
		$modulesTable = new Login_Model_DbTable_Modules($db);
		$result = false;

//		date_default_timezone_set("America/New_York");
//    $logger = new Zend_Log();
//    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));
		
		foreach($resources as $res) {
			$select = $modulesTable->select()->where('name = ?',$res);
			$theModule = $modulesTable->fetchRow($select);
			if( count( $theModule) ) {
				$theResource = "module:".$theModule->id;

//		    $logger->log("Performing ACL Check:".$theResource,Zend_Log::DEBUG);
				if( $acl->has($theResource) ) {
					$result = $acl->isAllowed("uid:".$this->_uid, $theResource, 'read');
//		    	$logger->log("ACL Result:".$result,Zend_Log::DEBUG);
				}
			}
		}
		return $result;
	}

}	



