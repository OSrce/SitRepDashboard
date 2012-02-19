<?php

class Srdata_Bootstrap extends Zend_Application_Module_Bootstrap {
	protected function _initRequest() {

			$this->bootstrap('frontController');
			$frontController = Zend_Controller_Front::getInstance();
			$restRoute = new Zend_Rest_Route($frontController,array(), array('srdata') );
			$frontController->getRouter()->addRoute('srdata',$restRoute);
//			$frontController->setParam('noErrorHandler', true);

	}


}


?>
