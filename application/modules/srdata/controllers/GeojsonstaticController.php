<?php

class Srdata_GeojsonstaticController extends Srdata_RestController
{
		protected $tableName; 
		protected $db;
		protected $restTable;
//		protected $id;

    public function init()
    {
			date_default_timezone_set("America/New_York");
			$this->logger = new Zend_Log();
			$this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_rest.log"));

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Featuresstatic($this->db);
			$this->tableName = "Geojsonstatic";
			$this->idName = "id";
//			$this->id = $this->_getParam($this->idName);	
//			if( $this->layerId ==null) {
//				$this->layerId = $this->_getParam('id',false);
//			}

			$this->_helper->viewRenderer->setNoRender(true);
//			$this->logger->log("REST Class: ".$this->tableName." Inited for layer:".$this->layerId, Zend_Log::DEBUG);	
			parent::init();			
	
    }
		// GET (Index) Action === READ ALL fetchAll
    public function indexAction()
    {
			$this->logger->log($this->tableName." Get (Index) Action Called: ", Zend_Log::DEBUG);	
			$select = $this->restTable->select();
			$select->from( 'sr_layer_static_data',array('id', 'feature_style',
				'feature_data', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );
			foreach($this->colsArr as $theKey => $theVal) {
        if( $this->_getParam($theVal) ) {
          $this->logger->log("The To use Key(s): $theVal === ".$this->_getParam($theVal)."\n", Zend_Log::DEBUG);
          $select->where("$theVal = ?",$this->_getParam($theVal));
        }
      }

			try {
				$rows = $this->restTable->fetchAll($select);	
				echo '{ "type":"FeatureCollection", "features":[';
				$firstRow = 1;
				foreach($rows as $feature) {
						if($firstRow == 0) {
							echo ",";
						} else { $firstRow = 0; }
//						$this->logger->log( print_r($feature,true) , Zend_Log::DEBUG);
						echo '{"type":"Feature",';
						echo '"properties":'.$feature->feature_data.',';
//							echo '"featureStyle":'.$feature->feature_style.',';
						echo '"id":'.$feature->id.',';
						echo '"geometry":'.$feature->geojson_geom;
						echo '}';
				}
				echo '] }';

				$this->getResponse()->setHttpResponseCode(200);
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$this->logger->log("Read Features Failed : ".$theError, Zend_Log::DEBUG);
			}

    }

		// GET Action === READ SPECIFIC ROW
		public function getAction() 
		{
			$this->logger->log($this->tableName." Get Action Called: ", Zend_Log::DEBUG);	
			$select = $this->restTable->select();
			$select->from( 'sr_layer_static_data',array('id', 'feature_style',
				'feature_data', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );
			foreach($this->colsArr as $theKey => $theVal) {
        if( $this->_getParam($theVal) ) {
          $this->logger->log("The To use Key(s): $theVal === ".$this->_getParam($theVal)."\n", Zend_Log::DEBUG);
          $select->where("$theVal = ?",$this->_getParam($theVal));
        }
      }

			try {
				$rows = $this->restTable->fetchAll($select);	
				echo '{ "type":"FeatureCollection", "features":[';
				$firstRow = 1;
				foreach($rows as $feature) {
						if($firstRow == 0) {
							echo ",";
						} else { $firstRow = 0; }
//						$this->logger->log( print_r($feature,true) , Zend_Log::DEBUG);
						echo '{"type":"Feature",';
						echo '"properties":'.$feature->feature_data.',';
//							echo '"featureStyle":'.$feature->feature_style.',';
						echo '"id":'.$feature->id.',';
						echo '"geometry":'.$feature->geojson_geom;
						echo '}';
				}
				echo '] }';
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$this->logger->log("Read Features Failed : ".$theError, Zend_Log::DEBUG);
			}

		}

		// POST Action === CREATE
		public function postAction() 
		{
			$this->logger->log($this->tableName." Post Action Called: ", Zend_Log::DEBUG);	

		}

		// PUT Action === UPDATE
		public function putAction() 
		{
			$this->logger->log($this->tableName." Put Action Called: ", Zend_Log::DEBUG);	

		}

		// DELETE Action === DELETE
		public function deleteAction() 
		{
			$this->logger->log($this->tableName." Delete Action Called: ", Zend_Log::DEBUG);	

		}



}

