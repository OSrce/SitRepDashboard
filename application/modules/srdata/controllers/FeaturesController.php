<?php

class Srdata_FeaturesController extends Srdata_RestController
{
		protected $tableName; 
		protected $db;
		protected $restTable;
//		protected $layerId;

    public function init()
    {
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Features($this->db);
			$this->tableName = "Features";
//			$this->idName = "layer_id";
/*			$this->layerId = $this->_getParam($this->idName);	
			if( $this->layerId ==null) {
				$this->layerId = $this->_getParam('id',false);
			}

			$this->_helper->viewRenderer->setNoRender(true);
			$this->logger->log("REST Class: ".$this->tableName." Inited for layer:".$this->layerId, Zend_Log::DEBUG);	
	*/
			parent::init();		
	
    }


		// GET (Index) Action === READ ALL fetchAll
    public function indexAction()
    {
			$this->logger->log($this->tableName." Get 1(Index) Action Called: ", Zend_Log::DEBUG);	
			$select = $this->restTable->select();
			$select->from( 'sr_layer_dynamic_data',array(
				'id', 'feature_data', 'geometry' => new Zend_Db_Expr("ST_AsText(sr_geom)")  ) );
			foreach($this->colsArr as $theKey => $theVal) {
        if( $this->_getParam($theVal) ) {
          $this->logger->log("The To use Key(s): $theVal === ".$this->_getParam($theVal)."\n", Zend_Log::DEBUG);
          $select->where("$theVal = ?",$this->_getParam($theVal));
        }
      }

			try {
				$rows = $this->restTable->fetchAll($select);	
    		$this->getResponse()->appendBody(Zend_Json::encode($rows->toArray() ));
	      $this->getResponse()->setHttpResponseCode(200);
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$this->logger->log("Read Features Failed : ".$theError, Zend_Log::DEBUG);
			}

		}

		// GET Action === READ SPECIFIC ROW
		public function getAction() 
		{
			$this->logger->log($this->tableName." 1Get Action Called: ", Zend_Log::DEBUG);	
			
			$select = $this->restTable->select();
			$select->from( 'sr_layer_dynamic_data',array('feature_style',
				 'feature_data', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );

			foreach($this->pKeyArr as $theKey => $theVal) {
        if(isset( $theVal)  ) {
          $this->logger->log("The Primary Key(s): $theKey === $theVal\n", Zend_Log::DEBUG);
          $select->where("$theKey = ?",$theVal);
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
			$this->getResponse()->setHttpResponseCode(200);
		}

		// POST Action === CREATE IF NO ID SPECIFIED
		//             === UPDATE IF ID SPECIFIED
		public function postAction() 
		{
			$this->logger->log($this->tableName." Post Action Called: ", Zend_Log::DEBUG);	
			
			$data = Zend_Json::decode($this->getRequest()->getRawBody() );
//			$this->boolToString($data);
			
			$this->logger->log("Post Data: ".print_r($data,true), Zend_Log::DEBUG);
			if(isset( $data['id'])  ) {
				$where = $this->restTable->getAdapter()->quoteInto('id = ?', $data['id']);
				$theRow = $this->restTable->update($data, $where);
			} else {
				$theRow = $this->restTable->insert($data);
			}
			$this->retObj['id'] = $theRow;
			$this->logger->log("Post Data Result: ".print_r($this->retObj,true), Zend_Log::DEBUG);
			$this->getResponse()->appendBody(Zend_Json::encode($this->retObj));
			$this->getResponse()->setHttpResponseCode(201);

		}

		// PUT Action === UPDATE
		public function putAction() 
		{
			$this->logger->log($this->tableName." Put Action Called: ", Zend_Log::DEBUG);	
			$data = Zend_Json::decode($this->getRequest()->getRawBody() );
//			$this->boolToString($data);
			
			$this->logger->log("Put Data: ".print_r($data,true), Zend_Log::DEBUG);
			if(isset( $data['id'])  ) {
				$where = $this->restTable->getAdapter()->quoteInto('id = ?', $data['id']);
				$theRow = $this->restTable->update($data, $where);
			} else {
				$theRow = $this->restTable->insert($data);
			}
			$this->logger->log("Put Data Result: ".print_r($theRow,true), Zend_Log::DEBUG);
			$this->getResponse()->appendBody(Zend_Json::encode($theRow));
			$this->getResponse()->setHttpResponseCode(201);




		}

		// DELETE Action === DELETE
/*		public function deleteAction() 
		{
			$this->logger->log($this->tableName." Delete Action Called: for Features", Zend_Log::DEBUG);	
			return parent::deleteAction();
		}
*/


}

