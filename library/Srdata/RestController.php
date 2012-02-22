<?php

abstract class Srdata_RestController extends Zend_Rest_Controller
{
		protected $tableName; 
		protected $db;
		protected $restTable;
		protected $idName;

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

		// GET (Index) Action === READ ALL fetchAll
    public function indexAction()
    {
			$this->logger->log($this->tableName." Index (READ ALL)  Action Called: ", Zend_Log::DEBUG);	
			$rows = $this->restTable->fetchAll();
			print Zend_Json::encode($rows->toArray());

    }

		// GET Action === READ SPECIFIC ROW
		public function getAction() 
		{
			$this->logger->log($this->tableName." Get (READ) Action Called: ", Zend_Log::DEBUG);	
			$id = $this->_getParam('id');
			$select = $this->restTable->select();
			$idName = $this->idName;
			$select->where("$idName=?",$id);
			$rows = $this->restTable->fetchAll($select);
			print Zend_Json::encode($rows->toArray());
		}

		// POST Action === CREATE
		public function postAction() 
		{
			$this->logger->log($this->tableName." Post (CREATE) Action Called: ", Zend_Log::DEBUG);	
			


		}

		// PUT Action === UPDATE
		public function putAction() 
		{
			$this->logger->log($this->tableName." Put (UPDATE) Action Called: ", Zend_Log::DEBUG);
			$id = $this->_getParam('id');
			$idName = $this->idName;
			$where = $this->restTable->getAdapter()->quoteInto("$idName=?",$id);
			$data = Zend_Json::decode($this->getRequest()->getRawBody() );
			$this->boolToString($data);
			$this->logger->log("Put Data: ".print_r($data,true), Zend_Log::DEBUG);
			$this->restTable->update($data, $where);

			$this->getResponse()->setHttpResponseCode(204);
		}

		// DELETE Action === DELETE
		public function deleteAction() 
		{
			$this->logger->log($this->tableName." Delete (DELETE) Action Called: ", Zend_Log::DEBUG);	

			$id = $this->_getParam('id');
			$idName = $this->idName;
			$where = $this->restTable->getAdapter()->quoteInto("$idName=?",$id);
			$this->restTable->delete($where);

			// SHOULD CHECK TO SEE IF DELETE WAS SUCCESSFUL BEFORE RETURNING No Content (204).			
			$this->getResponse()->setHttpResponseCode(204);

		}

		public function boolToString( &$var )
		{
			if( is_array( $var ) ) {
				foreach($var as $key=> $val) {
					if( is_bool($val) ) {
						if($val) {
							$var[$key] = "true";
						} else {
							$var[$key] = "false";
						}	
					}
				}
			} else {
				if( is_bool($var) ) {
					if($var) {
						$var = "true";
					} else {
						$var = "false";
					}	
				}
			}
		}


}

