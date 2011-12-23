<?php

class Layer_CreatelayerController extends Zend_Controller_Action
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
	
			$thePostData = $this->getRequest()->getRawBody();
			$theJSON = Zend_Json::decode( $thePostData  );

			$db = $this->getInvokeArg('bootstrap')->getResource('db');	
			$layersTable = new Layer_Model_DbTable_Layers($db);


			// LAYER OPTIONS DATA FOR sr_layers			
			$layerOptions = array_change_key_case($theJSON["options"], CASE_LOWER);
			unset($layerOptions['id']);
			unset($layerOptions['editable']);
			$layerOptions["defaultstyle"] = 0;
			$layerOptions["datatable"] = "sr_layer_static_data";			
			foreach($layerOptions as $layerOption => $layerOptionValue) {
//				$logger->log("Layer TEST: $layerOption", Zend_Log::DEBUG);
				if( is_null( $layerOptions[$layerOption] ) ) {
					unset($layerOptions[$layerOption] );
				}
			}

			// LAYER STYLE DATA FOR sr_styles
			$layerStyles = array_change_key_case($theJSON["styles"], CASE_LOWER);
			unset($layerStyles['tagname']);
			unset($layerStyles['childnodes']);
			unset($layerStyles['text()']);
			$logger->log("Layer Styles: ".print_r($layerStyles,true), Zend_Log::DEBUG);

			// LAYER FEATURE DATA FOR sr_layer_static_data
			$layerFeatures = array_change_key_case($theJSON["features"], CASE_LOWER);
			$logger->log("Layer Features: ".print_r($layerFeatures,true), Zend_Log::DEBUG);


			try {
				$layersTable->insert($layerOptions);
				$logger->log( "Layer Options: ".print_r($layerOptions, true) , Zend_Log::DEBUG);
			} catch(Zend_DB_Statement_Exception $theExcept) {
				$theError = $theExcept->getMessage();
				$logger->log("CreateLayer Failed : ".$theError, Zend_Log::DEBUG);
			}


    }


}

