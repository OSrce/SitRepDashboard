<?php

class Home_CfssingleController extends Zend_Controller_Action
{
	public function init()
	{
		$this->_options = $this->getInvokeArg('bootstrap')->getOptions();
		$this->view->srd_login_opts = $this->_options['srd']['login'];

	}

	public function indexAction()
  {
//		$theDate = $this->_getParam('cfs_date');
//		$theJobNum = $this->_getParam('cfs_num');
		$this->render('cfssingle');
	}
		
}

