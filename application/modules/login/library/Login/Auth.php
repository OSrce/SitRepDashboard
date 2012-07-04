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
			$auth = new Zend_Auth_Adapter_Ldap($options['ldap'],$username,$password );
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


?>
