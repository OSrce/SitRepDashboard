<?php

class Login_Plugin_SecurityCheck extends Zend_Controller_Plugin_Abstract

	const MODULE_NO_AUTH='login';
	private $_controller;
	private $_module;
	private $_action;
	private $_role;
	
	public function preDispatch (Zend_Controller_Request_Abstract $request) {
		$this->_controller = $this->getRequest()->getControllerName();
		$this->_module = $this->getRequest()->getModuleName();
		$this->_action = $this->getRequest()->getActionName();

		$auth = Zend_Auth::getInstance();

		$redirect = true;
		if($this->_module != self::MODULE_NO_AUTH) {
			$if($this->isAuth($auth) ) {
				$user = $auth->getStorage()->read();
				$this->_role = $user['id_role'];
				$bootstrap = Zend_Controller_Front::getInstance()->getParam('bootstrap');
				$db = $bootstrap->getResource('db');
				
	
				$maanger = $bootstrap->getResource('cachemanager');
				$cache = $manager->getCache('acl');

				if( ($acl = $cache->load('ACL_'.$this->_role)) == false) {
					$acl = new Login_Acl($db,$this->_role);
					$cache->save($acl,'ACL_'.$this->_role);
				}

				if( $this->_isAllowed($auth,$acl) ) {
					$redirect=false;
				}
			} //SHOULD HAVE ELSE HERE????
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

		if( !empty($auth) && ($auth instanceof Zend_Auth) {
				return $auth->hasIdentity();
		} 
		return false;
	}


	private function _isAllowed (Zend_Auth $auth, Zend_Acl $acl) {
		if(empty($auth) || empty($acl) || !(auth instanceof Zend_Auth) || !($acl instanceof Zend_Acl) {
			return false;
		}
		$resources = array(
			'*/*/*',
			$this->_module.'*/*',
			$this->_module.'/'.$this->_controller.'/*',
			$this->_module.'/'.$this->_controller.'/'.$this->_action
		);
		$result = false;
		foreach($resources as $res) {
			if($acl->has($res)) {
				$result = $acl->isAllowed($this->_role,$res);
			}
		}
		return $result;
	
	}

	

}	



