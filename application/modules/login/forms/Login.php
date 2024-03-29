<?php

class Login_Form_Login extends Zend_Form
{

	private $_timeout;
	
	public function __construct($options=null) {
		if(is_array($options) ) {
			if( !empty($options['custom'] ) ) {
				if(!empty($options['custom']['timeout'] ) ) {
					$this->_timeout= $options['custom']['timeout'];
				}
				unset($options['custom'] );
			}
		}
		parent::__construct($options);
	}


	public function init()
	{
			
		$this->addElement(
			'hash','token', array(
				'timeout' => $this->_timeout,
				)
		);	
	
		$this->addElement(
			'text','username', array(
				'label' => 'Username',
				'required' => true,
				'filters' => array('StringTrim')
			) 
		);
		$this->addElement(
			'password','password',array(
				'label' => 'Password:',
				'required' => true
			)
		);

		$this->addElement(
			'submit', 'submit', array(
//				'ignore' => true,
				'label' => 'Login'
			)
		);

		$this->addElement(
			'checkbox','keeploggedin',array(
				'label' => 'Keep me logged in',
				'checked' => true,
				'required' => true		
			)
		);



	}
}


?>

