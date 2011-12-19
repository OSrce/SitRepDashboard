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
			$this->render('index');



    }


}

