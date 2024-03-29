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

		date_default_timezone_set("America/New_York");
 	  $logger = new Zend_Log();
 	  $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_request.log"));
		$request = new Zend_Controller_Request_Http();
		$logger->log("Cookie:".print_r($request->getHeader('Cookie') , true),Zend_Log::DEBUG);	


		$redirect = true;

		if($this->_module != self::MODULE_NO_AUTH) {
			if($this->_isAuth($auth) ) {
					$user = $auth->getStorage()->read();

//				$this->_role = $user['id_role'];
				$bootstrap = Zend_Controller_Front::getInstance()->getParam('bootstrap');
				$db = $bootstrap->getResource('db');
		
//TEMP TESTING		
	
//		 		$logger->log("TEMP TEST:".print_r($user,true),Zend_Log::DEBUG);

//TEMP TESTING END
	
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
					$this->getResponse()->setHttpResponseCode(403);
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
		date_default_timezone_set("America/New_York");
    $logger = new Zend_Log();
    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_auth.log"));

		if(empty($auth) || empty($acl) ||
			!($auth instanceof Zend_Auth) ||
			!($acl instanceof Zend_Acl) ) {
				return false;
		}

		$resources = null;
		if( $this->_module == 'srdata') {
			$resources = array(	
				'*/*/*',
				$this->_module.'/*/*',
				$this->_module.'/'.$this->_controller.'/*'
			);
			if($this->_controller == 'features') {
				array_push($resources, $this->_module.'/'.$this->_controller.'/'.$this->getRequest()->getParam('layer_id',false) );
			} else {
				array_push($resources, $this->_module.'/'.$this->_controller.'/'.$this->getRequest()->getParam('id',false) );
			}
		} else {
			$resources = array(
				'*/*/*',
				$this->_module.'/*/*',
				$this->_module.'/'.$this->_controller.'/*',
				$this->_module.'/'.$this->_controller.'/'.$this->_action
			);
		}
		$bootstrap = Zend_Controller_Front::getInstance()->getParam('bootstrap');
		$db = $bootstrap->getResource('db');
	
		$modulesTable = new Login_Model_DbTable_Modules($db);
		$result = false;

	
		foreach($resources as $res) {
		 	$logger->log("Performing ACL Check:".$res,Zend_Log::DEBUG);
			$select = $modulesTable->select()->where('name = ?',$res);
			$theModule = $modulesTable->fetchRow($select);
			if( count( $theModule) ) {
				$theResource = $theModule->id;

//		    $logger->log("Performing ACL Check:".$theResource,Zend_Log::DEBUG);
				if( $acl->has($theResource) ) {
					if($this->getRequest()->isGet() ) {
						$result = $acl->isAllowed("uid:".$this->_uid, $theResource, 'read');
					} elseif( $this->getRequest()->isPost() ) {
						$result = $acl->isAllowed("uid:".$this->_uid, $theResource, 'create');
					} elseif( $this->getRequest()->isPut() ) {
						$result = $acl->isAllowed("uid:".$this->_uid, $theResource, 'update');
					} elseif( $this->getRequest()->isDelete() ) {
						$result = $acl->isAllowed("uid:".$this->_uid, $theResource, 'delete');
					}
				}
				if($result) {
					$logger->log("ACL Check Performed for : $res, RESULT :$result",Zend_Log::DEBUG);
					return $result;
				}
			}
		}

		$logger->log("ACL Check Performed for : $res, RESULT :$result",Zend_Log::DEBUG);
		return $result;
	}

}	



