<?php

class Srdata_CfsController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = 'sr_cfs_withlocation';
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Cfs($this->db);
			$this->idName = "cfs_num";

			$this->updateTable = new Srdata_Model_DbTable_Cfsupdatequeue($this->db);

			parent::init();
    }

		public function indexAction() 
		{
			// THIS CODE IS TO ADD CFS QUERIES FOR SINGLE ROWS TO BE
			// ADDED TO THE sr_cfs_updatequeue SO THAT A PROCESS LISTENING FOR NOTIFIES
			// ON THAT TABLE CAN REPULL THE DATA FROM THE UNDERLYING DATA SOURCE.
			$paramArr = $this->_getAllParams();
			$selectArr = array();
			foreach($paramArr as $key => $val) {
				switch($key) {
				case "module":
				case "controller":
				case "action":
				case "SREXPR":
				case '"SREXPR"':
						break;
				case 'cfs_date' :
				case 'cfs_num' :
					$selectArr[$key] = $val;
				}
			}

/*	    date_default_timezone_set("America/New_York");
      $this->logger = new Zend_Log();
      $this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_debug.log"));
			$this->logger->log("selectArr=".print_r($selectArr,true),Zend_Log::DEBUG);
*/			
			if(count( $selectArr) >0 ) {
				try {
					$this->updateTable->insert($selectArr);
					$sql = "NOTIFY sr_cfs_updatequeue";
					$this->db->query($sql);
				} catch(Zend_Db_Statement_Exception $e) {

				}
			}
			parent::indexAction();
		}


}

