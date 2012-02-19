<?php

class Srdata_UsersController extends Zend_Rest_Controller
{

    public function init()
    {
			date_default_timezone_set("America/New_York");
			$this->logger = new Zend_Log();
			$this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_user.log"));

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->usersTable = new Srdata_Model_DbTable_Users($this->db);

			$this->logger->log("User Class Inited. ", Zend_Log::DEBUG);	

    }

    public function indexAction()
    {
			$this->logger->log("User Get (Index) Action Called: ", Zend_Log::DEBUG);	
			$rows = $this->usersTable->fetchAll();
			print Zend_Json::encode($rows->toArray());

    }

		public function getAction() 
		{


		}

		public function postAction() 
		{

		}

		public function putAction() 
		{
		}

		public function deleteAction() 
		{
			$this->logger->log("User Delete Action Called: ", Zend_Log::DEBUG);	

		}



}

