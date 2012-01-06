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
			if($layerId < 0) {
				exit(-1);
			}
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
					'feature_id', 'feature_data', 'geojson_geom' => new Zend_Db_Expr("ST_AsGeoJSON(sr_geom)")  ) );

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
				} elseif( array_key_exists("type", $postObject) && $postObject["type"] == "Feature" ) { 				
						$featureObject = $postObject;
//						$logger->log( "Create Feature: ".print_r($featureObject, true) , Zend_Log::DEBUG);
						$theFeat = array();
						$theFeat["layer_id"] = $layerId;
//						if($featureObject["id"] > 0 ) {
							$theFeat["feature_id"] = $featureObject["id"];
//						} else {
//							$theFeat["feature_id"] = 1;
//						}
						$theFeat["feature_style"] = 0;
//						$theFeat["feature_data"] = "TEST"; //Zend_Json::encode($featureObject["properties"]);
						$theFeat["feature_data"] = Zend_Json::encode($featureObject["properties"]);
						$theFeat["sr_geom"] = $featureObject["geometry"];

						$logger->log( "Create Feature: ".print_r($theFeat["feature_id"], true) , Zend_Log::DEBUG);
						$logger->log("sr_geom coord size :".count( $theFeat["sr_geom"]["coordinates"] ) , Zend_Log::DEBUG);

						try {
							$theFeat["layer_id"] = 1;

							$queryString = "INSERT INTO sr_layer_static_data ( layer_id, feature_id, feature_style, feature_data, sr_geom) VALUES ( ";
							$queryString = $queryString.$theFeat["layer_id"].",";
							$queryString = $queryString.$theFeat["feature_id"].",";
							$queryString = $queryString.$theFeat["feature_style"].",";
							$queryString = $queryString."'".$theFeat["feature_data"]."',";
							$queryString = $queryString."SetSRID( ST_GeomFromGeoJSON('".Zend_Json::encode($theFeat["sr_geom"]) ." '), 4326) );\n";
					
							$fileHandle = fopen("/tmp/SomeFile.sql", "a+");
							fwrite($fileHandle,$queryString);
							fclose($fileHandle);
							$retVal = true;
							echo "{ \"inserted\" : ".Zend_Json::encode($retVal) ."}";
							exit(0);

			

							$queryString = "INSERT INTO sr_layer_static_data ( layer_id, feature_id, feature_style, feature_data,sr_geom) VALUES (?, ?, ?, ?, SetSRID( ST_GeomFromGeoJSON( ? ), 4326) )";
							$logger->log( "Prepped query string:".strlen($queryString), Zend_Log::DEBUG);
								$statement = $db->prepare($queryString);
								$statement->bindParam(1,$theFeat["layer_id"] );
								$statement->bindParam(2,$theFeat["feature_id"] );
								$statement->bindParam(3,$theFeat["feature_style"] );
								$statement->bindParam(4,$theFeat["feature_data"] );
								$statement->bindParam(5,Zend_Json::encode($theFeat["sr_geom"]));
//								$statement->bindParam(1,Zend_Json::encode($theFeat["sr_geom"]),PDO::PARAM_LOB);
								$retVal = $statement->execute();

//							$retVal = $db->query($queryString);

//							$retVal = $featuresTable->insert($theFeat);
							echo "{ \"inserted\" : ".Zend_Json::encode($retVal) ."}";
//						$logger->log( "Inserted Feature with id:".print_r($retVal,true)." and data: ".print_r($theFeat, true) , Zend_Log::DEBUG);
							$ret_val = $theFeat["feature_id"];
							$logger->log( "Inserted Feature with id:".print_r($retVal,true), Zend_Log::DEBUG);
						} catch(Zend_DB_Statement_Exception $theExcept) {
							$theError = $theExcept->getMessage();
							$logger->log("Create Feature Failed : ".$theError, Zend_Log::DEBUG);
						}
					}
			// END CREATE FEATURES (FEATURE INSERT INTO LAYER)
    		}
		}
}

