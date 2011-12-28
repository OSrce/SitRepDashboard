<?php

class Srdata_LayerController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {
	
		}

    public function createAction()
    {
			date_default_timezone_set("America/New_York");
			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	
			$thePostData = $this->getRequest()->getRawBody();
			$theJSON = Zend_Json::decode( $thePostData  );

			$db = $this->getInvokeArg('bootstrap')->getResource('db');	
			$layersTable = new Srdata_Model_DbTable_Layers($db);
			
			$stylesTable = new Srdata_Model_DbTable_Styles($db);
			$presetsTable = new Srdata_Model_DbTable_Presets($db);

				


			// LAYER OPTIONS DATA FOR sr_layers			
			$layerOptions = array_change_key_case($theJSON["options"], CASE_LOWER);
			$orig_id = $layerOptions['id'];
			unset($layerOptions['id']);
			unset($layerOptions['editable']);
			$layerOptions["defaultstyle"] = 0;
			$layerOptions["datatable"] = "sr_layer_static_data";			
			$layerOptions["url"] = "/srdata/feature";
			$layerOptions["format"] = "GeoJSON";
			foreach($layerOptions as $layerOption => $layerOptionValue) {
//				$logger->log("Layer TEST: $layerOption", Zend_Log::DEBUG);
				if( is_null( $layerOptions[$layerOption] ) ) {
					unset($layerOptions[$layerOption] );
				} else {
					if( is_bool( $layerOptions[$layerOption] ) ) {
						if( $layerOptions[$layerOption] == false ) {
							$layerOptions[$layerOption] = 0;
						} elseif ($layerOptions[$layerOption] == true) {
							$layerOptions[$layerOption] = 1;
						}	
					}
				}		
			}

			$logger->log("Layer Options: ".print_r($layerOptions,true), Zend_Log::DEBUG);
			// LAYER STYLE DATA FOR sr_styles
			$layerStyles = array_change_key_case($theJSON["styles"], CASE_LOWER);
			unset($layerStyles['tagname']);
			unset($layerStyles['childnodes']);
			unset($layerStyles['text()']);
			$logger->log("Layer Styles: ".print_r($layerStyles,true), Zend_Log::DEBUG);



			// LAYER FEATURE DATA FOR sr_layer_static_data
//			$layerFeatures = array_change_key_case($theJSON["features"], CASE_LOWER);
//			$logger->log("Layer Features: ".print_r($layerFeatures,true), Zend_Log::DEBUG);


			// BEGIN INSERT THE STYLES	
			try {
				$style_id = $stylesTable->insert($layerStyles);
				$layerOptions["defaultstyle"] = $style_id;
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$logger->log("Create Style Failed : ".$theError, Zend_Log::DEBUG);
				return;
			}
			// END INSERT THE STYLES


			// BEGIN INSERT THE LAYER OPTIONS
			try {
				$layer_id = $layersTable->insert($layerOptions);
				$layerOptions["id"] = $layer_id;
				$logger->log( "Layer Created with ID:".$layer_id." with Options: ".print_r($layerOptions, true) , Zend_Log::DEBUG);
				echo Zend_Json::encode($layerOptions);
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$logger->log("CreateLayer Failed : ".$theError, Zend_Log::DEBUG);
				return;
			}
			// END INSERT THE LAYER OPTIONS

			// BEGIN INSERT THE STYLE PRESETS
			try {
				$stylePreset["name"] = "DEFAULT";
				$stylePreset["style_id"] = $style_id;
				$stylePreset["layer_id"] = $layer_id;
				$preset_id = $presetsTable->insert($stylePreset);
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$logger->log("CreateLayer Failed : ".$theError, Zend_Log::DEBUG);
				return;
			}
			// END INSERT THE STYLE PRESETS





    }


}

