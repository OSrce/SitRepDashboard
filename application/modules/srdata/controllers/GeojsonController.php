<?php

class Srdata_GeojsonController extends Zend_Rest_Controller
{
		protected $tableName; 
		protected $db;
		protected $restTable;
		protected $layerId;

    public function init()
    {
			date_default_timezone_set("America/New_York");
			$this->logger = new Zend_Log();
			$this->logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_rest.log"));

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Features($this->db);
			$this->tableName = "Features";
			$this->idName = "layer_id";
			$this->layerId = $this->_getParam($this->idName);	

			$this->_helper->viewRenderer->setNoRender(true);
			$this->logger->log("REST Class: ".$this->tableName." Inited for layer:".$this->layerId, Zend_Log::DEBUG);	
			
	
    }
		// GET (Index) Action === READ ALL fetchAll
    public function indexAction()
    {
			$this->logger->log($this->tableName." Get (Index) Action Called: ", Zend_Log::DEBUG);	
			
			$rows = $this->restTable->fetchAll();
			print Zend_Json::encode($rows->toArray());

    }

		// GET Action === READ SPECIFIC ROW
		public function getAction() 
		{
			$this->logger->log($this->tableName." Get Action Called: ", Zend_Log::DEBUG);	
			
			$selectLayer = $this->restTable->select();
			$selectLayer->from( 'sr_layer_static_data',array('feature_style',
				'feature_id', 'feature_data', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );

			$selectLayer->where("layer_id = ?",$this->layerId);
			try {
				$rows = $this->restTable->fetchAll($selectLayer);	
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
						echo '"id":'.$feature->feature_id.',';
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

