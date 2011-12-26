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

			$thePostData = $this->getRequest()->getRawBody();
			$featuresObject = Zend_Json::decode( $thePostData  );

			$db = $this->getInvokeArg('bootstrap')->getResource('db');	
			$layersTable = new Srdata_Model_DbTable_Layers($db);

			// LAYER OPTIONS DATA FOR sr_layers			
//			$layerOptions = array_change_key_case($theJSON["options"], CASE_LOWER);
			$featuresGeoJSON = new Srdata_GeoJSON();
	
			$logger->log( "Create Features Called: ".print_r($featuresObject, true) , Zend_Log::DEBUG);

    }



}

