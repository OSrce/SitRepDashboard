<?php

class Login_IndexController extends Zend_Controller_Action {
	
	private $options;


	public function init() {
		$this->_options = $this->getInvokeArg('bootstrap')->getOptions();

	}

	public function indexAction() {

//		$db = $this->getInvokeArg('bootstrap')->getResource('db');
//		$user = new Login_Model_DbTable_Users($db);
//		$userMap 


		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
	
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
		$opt=array( 'custom' => array( 'timeout' => $this->_options['auth']['timeout'] ) );


		$form = new Login_Form_Login($opt);

		if( !$form->isValid($this->getRequest()->getPost() ) ) {
			$this->view->form = $form;
			return $this->render('login');
		}

		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
	
		$options = array();
		$options['username'] = $this->getRequest()->getParam('username');
		$options['password'] = $this->getRequest()->getParam('password');

		$auth = Zend_Auth::getInstance();
		$db = $this->getInvokeArg('bootstrap')->getResource('db');
		$options['ldap'] = $this->_options['ldap'];
		$authAdapter = Login_Auth::_getAdapter('ldap', $options);

		$result = $auth->authenticate($authAdapter);
		
		if($result->isValid() ) {
//			if(1==1) {
			$logger->log("LDAP Results: ".print_r($result,true),Zend_Log::DEBUG);
			// USER AUTH WAS SUCCESSFUL, NOW NEED TO SEE IF USER IN DB
			$userTable = new Login_Model_DbTable_Users($db);
			$user = $userTable->fetchRow(
								$userTable->select()
													-> where('username = ? ',$options['username'] )
							);
			if(is_null($user) ) {
			// USER NOT IN DB
				$logger->log("LDAP : User=".$options['username']." not in db, pulling from LDAP",Zend_Log::DEBUG);
				$ldap = new Zend_Ldap();
				$ldap->setOptions($options['ldap']['server1']);
				try {
					$ldap->bind($options['username'],$options['password'] );
					$canonicalName = $ldap->getCanonicalAccountName($options['username'],Zend_Ldap::ACCTNAME_FORM_DN);
					$logger->log("LDAP: cname :".print_r($canonicalName, true),Zend_Log::DEBUG);
					$ldapUserInfo = $ldap->getEntry($canonicalName);
					$logger->log("LDAP: getEntry Success :".print_r($ldapUserInfo, true),Zend_Log::DEBUG);

					$user = $userTable->createRow();
					$user->username = $options['username'];
					$user->dn = $ldapUserInfo["dn"];
					if( array_key_exists("nypdtaxid" , $ldapUserInfo) ) {
						$user->uid = $ldapUserInfo["nypdtaxid"][0];
					} else {
						$nextUid = $userTable->fetchRow($userTable->select()->from('sr_users','MIN(uid)'));
//						$logger->log("LDAP: nextUid:".print_r($nextUid,true),Zend_Log::DEBUG);
						if($nextUid->min > 0) {
							$uid = -100;
						} else {
							$uid = $nextUid->min - 1;
						}
						$user->uid = $uid;
					}
					if( array_key_exists("nypdcmdcode" , $ldapUserInfo) ) {
						$user->gid = $ldapUserInfo["nypdcmdcode"][0];
					} else {
						$user->gid = -1;
					}
					if( array_key_exists("title" , $ldapUserInfo) ) {
						$user->title = $ldapUserInfo["title"][0];
					}
					if( array_key_exists("nypdtitlecode" , $ldapUserInfo) ) {
						$user->titlecode = $ldapUserInfo["nypdtitlecode"][0];
					}
					if( array_key_exists("sn" , $ldapUserInfo) ) {
						$user->lastname = $ldapUserInfo["sn"][0];
					}
					if( array_key_exists("givenname" , $ldapUserInfo) ) {
						$user->firstname = $ldapUserInfo["givenname"][0];
					}
					if( array_key_exists("mail" , $ldapUserInfo) ) {
						$user->email = $ldapUserInfo["mail"][0];
					}
					$user->save();

				} catch( Zend_Ldap_Exception $zle) {
					$logger->log("LDAP: ERROR:".$zle->getMessage(),Zend_Log::DEBUG);
					$this->_helper->flashMessenger->addMessage("Authentication error:".$zle->getMessage());
					$this->_redirect('/login');		
				}
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
				'gid' => $user->gid

			);
			$auth->getStorage()->write($data);

			$this->_redirect('/home');
		} else {
			$messages = $result->getMessages();
			foreach ($messages as $i => $message) {
				$logger->log("AUTH LDAP : $message",Zend_Log::DEBUG);
			}
			$this->_helper->flashMessenger->addMessage("Authentication error:");
			$this->_redirect('/login');
		}


	}


	public function logoutAction() {

	}
	
	public function passAction() {


	}

	public function notauthorizedAction() {

		$this->render('notauthorized');

	}




}

?>


