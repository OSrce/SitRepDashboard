<?php

abstract class Srdata_RestController extends Zend_Rest_Controller
{
		protected $tableName; 
		protected $db;
		protected $restTable;
		protected $idName;
		protected $theRequest;

    public function init()
    {
			date_default_timezone_set("America/New_York");
			$this->logger = new Zend_Log();
			$this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_rest.log"));

//			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
//			$this->restTable = new Srdata_Model_DbTable_Users($this->db);

			$this->theRequest = $this->getRequest();
			$this->_helper->viewRenderer->setNoRender(true);
			$this->logger->log("REST Class: ".$this->tableName." Inited. ", Zend_Log::DEBUG);	

    }

		// GET (Index) Action === READ ALL fetchAll
    public function indexAction()
    {

//			$countRows = "SELECT COUNT(*) AS count FROM ".$this->tableName;
//			$tableSize = $this->db->fetchOne($countRows);
		
			$select = $this->restTable->select();

			// TO SUPPORT SORTING Look for sort param
			$tableSort = "";
			$paramArr = $this->_getAllParams();	
			$this->logger->log("The Params: ".print_r($paramArr,true)."\n", Zend_Log::DEBUG);	
			foreach($paramArr as $key=> $val) {
				$this->logger->log("The key:$key:::\n", Zend_Log::DEBUG);	
				if( $key == "module" || $key == "controller" || $key == "action") {
					continue;
				} elseif( preg_match( "/^sort\((.*)\)/", $key, $keyArr) ) {
					$tableSort = $keyArr[1];
				} else {
					$select->where("$key=?",$val); 	
				}
			}

//			$this->logger->log("TEST0: ".(string)$select."\n", Zend_Log::DEBUG);	

			$select->from($this->tableName, array('TotalRecords' => new Zend_Db_Expr('Count(*)') ) );
			$tableSize = $this->db->fetchOne($select);
			$this->logger->log("TEST9: $tableSize\n", Zend_Log::DEBUG);	
			$select->reset();

			foreach($paramArr as $key=> $val) {
				$this->logger->log("The key:$key:::\n", Zend_Log::DEBUG);	
				if( $key == "module" || $key == "controller" || $key == "action") {
					continue;
				} elseif( preg_match( "/^sort\((.*)\)/", $key, $keyArr) ) {
					$tableSort = $keyArr[1];
				} else {
					$select->where("$key=?",$val); 	
				}
			}


			$sortArr = explode(',',$tableSort);
//			$this->logger->log("TEST2: $tableSort\n".print_r($sortArr,true), Zend_Log::DEBUG);	
			if( is_array( $sortArr ) ) {
				foreach($sortArr as $key=> $val) {
					if( preg_match( "/^\_(.*)/", $val, $valArr) ) {
						$sortArr[$key] = $valArr[1]." ASC";
					}elseif( preg_match( "/^-(.*)/", $val, $valArr) ) {
						$sortArr[$key] = $valArr[1]." DESC";
					}
				}
			}
			$select->order($sortArr);


//			$this->logger->log("TEST: ".print_r($sortArr,true), Zend_Log::DEBUG);	
			

			// TO SUPPORT PAGINATION WE NEED TO LOOK FOR RANGE = VAR and TRANSLATE IT TO
			// OFFSET AND LIMIT parameters in query.
			$range = $this->_request->getHeader('Range');	
			$rangeArr = array();
			if( preg_match( "/items=(\d+)-(\d+)/", $range,$rangeArr) ) {
				$itemsRange = $rangeArr[0];
				$offset = $rangeArr[1];
				$limit  = $rangeArr[2];
				$select->limit($limit,$offset);
				$this->_response->setHeader('Content-Range', $itemsRange.'/'.$tableSize);
			}
			$this->logger->log($this->tableName." Index (READ ALL)  Action Called", Zend_Log::DEBUG);	
			$rows = $this->restTable->fetchAll($select);
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
			
			$data = Zend_Json::decode($this->getRequest()->getRawBody() );
			$this->boolToString($data);
			
			$this->logger->log("Put Data: ".print_r($data,true), Zend_Log::DEBUG);
			$theRow = $this->restTable->insert($data);
			$idName = $this->idName;
			$retObj[$idName] = $theRow; 
			$this->getResponse()->appendBody(Zend_Json::encode($retObj));

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

