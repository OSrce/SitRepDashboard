<?php

class Home_CfssingleController extends Zend_Controller_Action
{
	public function init()
	{

	}

	public function indexAction()
  {
//		$theDate = $this->_getParam('cfs_date');
//		$theJobNum = $this->_getParam('cfs_num');
		$this->render('cfssingle');
	}
		
}

