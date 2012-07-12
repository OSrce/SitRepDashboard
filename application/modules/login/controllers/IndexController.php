<?php

class Login_IndexController extends Zend_Controller_Action {
	
	private $options;
	private $username;
	private $password;

	public function init() {
		$this->_options = $this->getInvokeArg('bootstrap')->getOptions();

		$this->view->srd_login_opts = $this->_options['srd']['login']; 

		// Tell browser to store cookie to remember_me_seconds duration
		Zend_Session::rememberMe();

	}

	public function indexAction() {

//		$db = $this->getInvokeArg('bootstrap')->getResource('db');
//		$user = new Login_Model_DbTable_Users($db);
//		$userMap 


		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
	
		$auth = Zend_Auth::getInstance();
		if( $auth->getIdentity() ) {
			return $this->_redirect('/home');
		}

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
		$this->username = strtolower($this->getRequest()->getParam('username'));
		$this->password = $this->getRequest()->getParam('password');
		if($this->checkAuth() == 0) {
			return $this->_redirect('/home');
		} else {
			return $this->_redirect('/login');		
		}
	}

	public function embeddedloginAction() {
		$data = Zend_Json::decode($this->getRequest()->getRawBody() );
		$this->username = $data['username'];
		$this->password = $data['password'];
		$this->_helper->viewRenderer->setNoRender(true);
		$theResponse = array();
		if($this->checkAuth() == 0) {
			$theResponse['authorized'] = true;
			$theResponse['authenticated'] = true;
		} else {
			$theResponse['authorized'] = false;
			$theResponse['authenticated'] = false;
		}
		$this->getResponse()->appendBody(Zend_Json::encode($theResponse));
		$this->getResponse()->setHttpResponseCode(200);
		return;
	}

	private function checkAuth() {
		$auth = Zend_Auth::getInstance();
		if( $auth->getIdentity() ) {
//			return $this->_redirect('/home');
			return 0;
		}

		$opt=array( 'custom' => array( 'timeout' => $this->_options['auth']['timeout'] ) );

/*		$form = new Login_Form_Login($opt);

		if( !$form->isValid($this->getRequest()->getPost() ) ) {
			$this->view->form = $form;
			$this->render('login');
		}
*/

		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
	
//		$logger->log("username: ".$this->username." pass:".$this->password,Zend_Log::DEBUG);
		$options = array();
		$options['username'] = $this->username;
		$options['password'] = $this->password;
		$options['keeploggedin'] = $this->getRequest()->getParam('keeploggedin');

		$db = $this->getInvokeArg('bootstrap')->getResource('db');

		$options['auth_type'] = '';
		if( array_key_exists( 'auth_type', $this->_options ) ) {
			$logger->log("auth_type: ".print_r($this->_options['auth_type'],true),Zend_Log::DEBUG);

			if( $this->_options['auth_type'] == "config_file") {
				$options['file_auth'] = $this->_options['file_auth'];
				$authAdapter = Login_Auth::_getAdapter('config_file', $options);
//				$authAdapter->setRequest($this->getRequest() );
//				$authAdapter->setResponse(new Zend_Controller_Response_Http()  );
				$logger->log("Using http_auth: ".print_r($options['http_auth'],true),Zend_Log::DEBUG);
			} else {
				$options['ldap'] = $this->_options['ldap'];
				$authAdapter = Login_Auth::_getAdapter('ldap', $options);
			}	
		} else {
			$options['ldap'] = $this->_options['ldap'];
			$authAdapter = Login_Auth::_getAdapter('ldap', $options);
		}

		$result = $auth->authenticate($authAdapter);
//		$logger->log("Result: ".print_r($result,true),Zend_Log::DEBUG);
		
		if($result->isValid() ) {
			$logger->log("AUTH Results: ".print_r($result,true),Zend_Log::DEBUG);
			// USER AUTH WAS SUCCESSFUL, NOW NEED TO SEE IF USER IN DB
			$userTable = new Login_Model_DbTable_Users($db);
			$user = $userTable->fetchRow(
								$userTable->select()
													-> where('username = ? ',$this->username )
							);
			if(is_null($user) ) {
			// USER NOT IN DB
				$logger->log("LDAP : User=".$this->username." not in db, pulling from LDAP",Zend_Log::DEBUG);

				if( $this->_options['auth_type'] && $this->_options['auth_type'] == 'http') {
					$nextUid = $userTable->fetchRow($userTable->select()->from('sr_users','MIN(uid)'));
					if($nextUid->min > 0) {
						$uid = -100;
					} else {
						$uid = $nextUid->min - 1;
					}
					$user->uid = $uid;
					$user->gid = -1;
				} else {	
				$ldap = new Zend_Ldap();
				$ldap->setOptions($options['ldap']['server1']);
				try {
					$ldap->bind($this->username,$this->password );
					$canonicalName = $ldap->getCanonicalAccountName($this->username,Zend_Ldap::ACCTNAME_FORM_DN);
					$logger->log("LDAP: cname :".print_r($canonicalName, true),Zend_Log::DEBUG);
					$ldapUserInfo = $ldap->getEntry($canonicalName);
					$logger->log("LDAP: getEntry Success :".print_r($ldapUserInfo, true),Zend_Log::DEBUG);

					$user = $userTable->createRow();
					$user->username = $this->username;

					$ldapInfoArr = $this->_options['srd']['userfromldap'];
					foreach ($ldapInfoArr as $userVar => $ldapVar) {
						if( $ldapVar != '' && array_key_exists($ldapVar , $ldapUserInfo) ) {
							$logger->log("LDAP: $userVar, $ldapVar",Zend_Log::DEBUG);
							$user[$userVar] = $ldapUserInfo[$ldapVar][0];
						} elseif ( $userVar == 'uid' ) {
							$nextUid = $userTable->fetchRow($userTable->select()->from('sr_users','MIN(uid)'));
							if($nextUid->min > 0) {
								$uid = -100;
							} else {
								$uid = $nextUid->min - 1;
							}
							$user->uid = $uid;
						} elseif ( $userVar == 'gid' ) {
							$user->gid = -1;
						}	

					}

					$user->wlayout = 1;
					$user->save();

				} catch( Zend_Ldap_Exception $zle) {
					$logger->log("LDAP: ERROR:".$zle->getMessage(),Zend_Log::DEBUG);
					$this->_helper->flashMessenger->addMessage("Authentication error:".$zle->getMessage());
//					$this->_redirect('/login');		
						return 1;
				}
				}
				// END ELSE FOR auth_type == ldap

			}

//		$this->_helper->flashMessenger->addMessage("User Authenticated!.");

			// WE HAVE SUCCESSFULLY AUTHENICATED AND GOTTEN USER INFO FROM DB.
			// NOW WE NEED TO STORE IT SOMEWHERE WHERE WE CAN PULL IT WHENEVER A USER REQUEST A PAGE.

//			$srd_session = new Zend_Session_Namespace("srd");
//			$srd_session->auth = true;
//			$srd_session->uid = $user->uid;	
//			$srd_session->gid = $user->gid;
	
			$data = array( 
				'username' => $user->username,
				'uid' => $user->uid,
				'gid' => $user->gid,
				'lastname' => $user->lastname,
				'title' => $user->title,
				'wlayout' => $user->wlayout,
				'hostname' => gethostbyaddr($_SERVER['REMOTE_ADDR'])
			);
			$auth->getStorage()->write($data);

			//IF "Keep me logged in" == checked
			if( $options['keeploggedin']) {
				$logger->log("Remembermeseconds:".$this->view->srd_login_opts['remembermeseconds'],Zend_Log::DEBUG);
				Zend_Session::getSaveHandler()->setLifetime( $this->view->srd_login_opts['remembermeseconds'] );
			}

			return 0;
//			$this->_redirect('/home');
		} else {
			$messages = $result->getMessages();
			foreach ($messages as $i => $message) {
				$logger->log("AUTH LDAP : $message",Zend_Log::DEBUG);
			}
			$this->_helper->flashMessenger->addMessage("Authentication error: Incorrect Login.");
//			$this->_redirect('/login');
			return 1;
		}


	}


	public function logoutAction() {
		
		$auth = Zend_Auth::getInstance();
		$identity = $auth->getIdentity();
		if($identity != null) {
			$auth->clearIdentity();
		}
		$this->_redirect('/login');

	}
	
	public function passAction() {


	}

	public function notauthorizedAction() {

		$auth = Zend_Auth::getInstance();
		$auth->clearIdentity();
		$this->_helper->flashMessenger->addMessage("You have entered a valid username / password, but are not authorized to access this system.");
		$this->_redirect('/login');
//		$this->render('notauthorized');

	}




}

?>


