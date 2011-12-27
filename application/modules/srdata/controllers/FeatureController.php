<?php

class Srdata_FeatureController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {
			date_default_timezone_set("America/New_York");
			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));

			// TODO: NEED TO DETERMINE IF USER HAS USER HAS PERMISSION (GENERAL READ/CREATE).

			// TODO: NEED TO DETERMINE WHAT LAYER ID WE ARE DEALING WITH.
			// TODO: NEED TO DETERMINE IF THIS IS READ OR CREATE!
			$layerId = $this->getRequest()->getHeader('layer_id');
			$requestType = $this->getRequest()->getHeader('sr_requestType');	

			$logger->log("Feature Class Called: Request Type: ".$requestType,Zend_Log::DEBUG);

			// TODO: NEED TO DETERMINE IF USER HAS USER HAS PERMISSION FOR LAYER_ID.


			if($requestType == "" || $requestType == "read") {
				$layerId = $this->getRequest()->getParam("layer_id");
				$logger->log("layer_id: ".$layerId,Zend_Log::DEBUG);
			
				$db = $this->getInvokeArg('bootstrap')->getResource('db');		
				$featuresTable = new Srdata_Model_DbTable_Features($db);
				
				$selectLayer = $featuresTable->select();
				$selectLayer->from( 'sr_layer_static_data',array('feature_style',
					'feature_id', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );

				$selectLayer->where("layer_id = $layerId");
				try {
					$rows = $featuresTable->fetchAll($selectLayer);	
					echo '{ "type":"FeatureCollection", "features":[';
					$firstRow = 1;
					foreach($rows as $feature) {
							if($firstRow == 0) {
								echo ",";
							} else { $firstRow = 0; }
//						$logger->log( print_r($feature,true) , Zend_Log::DEBUG);
							echo '{"type":"Feature","properties": {';
							echo '"featureStyle":'.$feature->feature_style;
							echo '},"id":'.$feature->feature_id.',';
							echo '"geometry":'.$feature->geojson_geom;
							echo '}';
					}
					echo '] }';
				} catch(Zend_DB_Statement_Exception $theExcept) {
					$theError = $theExcept->getMessage();
					$logger->log("Read Features Failed : ".$theError, Zend_Log::DEBUG);
				}

			} elseif ($requestType == "create") {
			// BEGIN CREATE FEATURES (FEATURE INSERT INTO LAYER)
			$thePostData = $this->getRequest()->getRawBody();
			$postObject = Zend_Json::decode( $thePostData  );

			$db = $this->getInvokeArg('bootstrap')->getResource('db');	
			$layersTable = new Srdata_Model_DbTable_Layers($db);
			$featuresTable = new Srdata_Model_DbTable_Features($db);

			// LAYER OPTIONS DATA FOR sr_layers			
//			$layerOptions = array_change_key_case($theJSON["options"], CASE_LOWER);
//			$featuresGeoJSON = new GeoJSON_GeoJSON();
				if( array_key_exists("type", $postObject) && $postObject["type"] == "FeatureCollection" ) { 				
					$featuresArray = $postObject["features"];
					$logger->log( "Create Features Called: ".print_r($featuresArray, true) , Zend_Log::DEBUG);
					foreach( $featuresArray as $featureObject) {
						$logger->log( "Create Feature: ".print_r($featureObject, true) , Zend_Log::DEBUG);
						$theFeat = array();
						$theFeat["layer_id"] = $layerId;
						$theFeat["feature_id"] = $featureObject["id"];
						$theFeat["feature_style"] = 0;
						$theFeat["sr_geom"] = $featureObject["geometry"];
						try {
							$retVal = $featuresTable->insert($theFeat);
							echo "{ \"inserted\" : ".Zend_Json::encode($retVal) ."}";
							$logger->log( "Inserted Feature with id:".print_r($retVal,true)." and data: ".print_r($theFeat, true) , Zend_Log::DEBUG);
						} catch(Zend_DB_Statement_Exception $theExcept) {
							$theError = $theExcept->getMessage();
							$logger->log("Create Feature Failed : ".$theError, Zend_Log::DEBUG);
						}
					}

				}				
		
	
			// END CREATE FEATURES (FEATURE INSERT INTO LAYER)

    }
	
	}


}

