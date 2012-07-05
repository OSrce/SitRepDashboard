<?php

class Login_Auth {
	private function __constuct() {

	}
	
	public static function _getAdapter($adapter, $options) {
		if(empty($adapter) || empty($options) || !is_array($options) ) {
			return false;
		}
		$username = $options['username'];
		$password = $options['password'];

		switch ($adapter) {
		case 'ldap' :
			$auth = new Zend_Auth_Adapter_Ldap($options['ldap'],$username,$password);
		break;
		case 'config_file' :

		date_default_timezone_set("America/New_York");
    $logger = new Zend_Log();
    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
		$logger->log("authenticate options1: ".print_r($options,true),Zend_Log::DEBUG);


			$auth = new fileAuthAdapter($options,$username,$password );
		break;
		case 'http_auth' :
			$auth = new Zend_Auth_Adapter_Http($options['http_auth'],$username,$password );
			$basicResolver = new Zend_Auth_Adapter_Http_Resolver_File();
   		$basicResolver->setFile($options['http_auth']['passFile']);
   		$auth->setBasicResolver($basicResolver);
		break;
		}

		return $auth;
	}
}

class fileAuthAdapter implements Zend_Auth_Adapter_Interface {
	private $userArr;
	private $passArr;
	private $theUser;
	private $thePass;
	public function __construct($options, $username, $password) {
			$this->userArr = $options['file_auth']['users'] ;
			$this->passArr = $options['file_auth']['passwords'];
			$this->theUser = $username;
			$this->thePass = $password;

			date_default_timezone_set("America/New_York");
	    $logger = new Zend_Log();
	    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
			$logger->log("authenticate options2: ".print_r($options,true),Zend_Log::DEBUG);



	}

	public function authenticate() {

		date_default_timezone_set("America/New_York");
    $logger = new Zend_Log();
    $logger->addWriter(new Zend_Log_Writer_Stream("/tmp/ldap.log"));
		$logger->log("authenticate userArr: ".print_r($this->userArr,true),Zend_Log::DEBUG);

		$code = Zend_Auth_Result::FAILURE;
		foreach( $this->userArr as $tmpUserPos => $tmpUser ) {
			$logger->log("compare: ".$this->theUser.":::".$tmpUser,Zend_Log::DEBUG);
			if( $this->theUser == $tmpUser ) {
				$logger->log("authenticate passArr: ".print_r($this->passArr,true),Zend_Log::DEBUG);
				if( $this->passArr[$tmpUserPos] == $this->thePass) {
					$code = Zend_Auth_Result::SUCCESS;
				}
			}
		}
		$identity = null;
		return new Zend_Auth_Result($code, $identity);
	}
}	



?>
