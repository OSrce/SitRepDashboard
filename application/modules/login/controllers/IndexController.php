<?php

class Login_IndexController extends Zend_Controller_Action {
	
	private $options;


	public function init() {
		$this->_options = $this->getInvokeArg('bootstrap')->getOptions();
	}

	public function indexAction() {
		$flash = $this->_helper->getHelper('flashMessenger');
		if( $flash->hasMessages() ) {
			$this->view->message = $flash->getMessages();
		}
		$opt = array( 
			'custom' =>array(
				'timeout' => $this->_options['auth']['timeout']
			)
		);
		$this->view->form = new Login_Form_Login($opt);
		$this->render('login');
	}

	public function loginAction() {
		$opt=array( 'custom' => array( $this->_options['auth']['timeout'] ) );
		$form = new Login_Form_login($opt);
		if( !$form->isValid($this->getRequest()->getPost() ) ) {
			$this->view->form = $form;
			return $this->render('login');
		}
		$options = array();
		$options['username'] = $this->getRequest()->getParam('username');
		$options['password'] = $this->getRequest()->getParam('password');
		$auth = Zend_Auth::getInstance();
		$db = $this->getInvokeArg('bootstrap')->getResource('db');
		$user = new Login_Model_Users($db);
		if ($user->isLdapUser($options['username'] ) ) {
			$options['ldap'] = $this->_options['ldap'];
			$authAdapter = Login_Auth::_getAdapter('ldap', $options);
		}
		// ELES DONT WORRY ABOUT RIGHT NOW - ONLY LDAP.
		
		if($result->isValid() ) {
			$role_id = $user->getRoleId($options['username'] );
			$data = array( 
				'username' => $options['username'],
				'id_role' => $role_id
			);
			$auth->getStorage()->write($data);
			$this->_redirect('/home');
		} else {
			$this->_helper->flashMessenger->addMessage("Authentication error.");
			$this->_redirect('/login');
		}


	}


	public function logoutAction() {

	}
	
	public function passAction() {


	}




}

?>


