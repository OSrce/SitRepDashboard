<?php

class Srdata_Bootstrap extends Zend_Application_Module_Bootstrap {
	protected function _initRequest() {
//		$config= new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini');
//		$router = new Zend_Controller_Router_Rewrite();
//		$router->addConfig($config,'routes');
			$this->bootstrap('frontController');
			$frontController = Zend_Controller_Front::getInstance();
			$restRoute = new Zend_Rest_Route($frontController);
			$frontController->getRouter()->addRoute('default',$restRoute);
			$frontController->setParam('noViewRenderer', true);

	}


}


?>
