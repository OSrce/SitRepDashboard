<?php

abstract class Srdata_RestController extends Zend_Rest_Controller
{
		protected $tableName; 
		protected $db;
		protected $restTable;

    public function init()
    {
			date_default_timezone_set("America/New_York");
			$this->logger = new Zend_Log();
			$this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_rest.log"));

//			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
//			$this->restTable = new Srdata_Model_DbTable_Users($this->db);

			$this->_helper->viewRenderer->setNoRender(true);
			$this->logger->log("REST Class: ".$this->tableName." Inited. ", Zend_Log::DEBUG);	

    }

    public function indexAction()
    {
			$this->logger->log($this->tableName." Get (Index) Action Called: ", Zend_Log::DEBUG);	
			$rows = $this->restTable->fetchAll();
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
			$this->logger->log($this->tableName." Delete Action Called: ", Zend_Log::DEBUG);	

		}



}

