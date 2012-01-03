<?php

class Home_IndexController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
 		    $this->_options = $this->getInvokeArg('bootstrap')->getOptions();

		 }

    public function indexAction()
    {

/*			$srd_session = new Zend_Session_Namespace("srd");
			if($srd_session->auth != true) {
				$this->_redirect('/login');
				exit(-1);
			}
*/
			$this->render('index');
    }


}

