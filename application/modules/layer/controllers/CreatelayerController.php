<?php

class Layer_CreatelayerController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {

//			echo "create layer!";
			$thePostData = $this->getRequest()->getRawBody();
			$theJSON = Zend_Json::decode($thePostData );
	
//			$postVals = print_r($theJSON,true);
//			echo "TEST1::::::".$postVals."::::::<br>\n";
//			echo "TEST2::::::".$theJSON."::::::<br>\n";

			

			$db = $this->getInvokeArg('bootstrap')->getResource('db');	
			$layersTable = new Layer_Model_DbTable_Layers($db);

			$theJSON["options"]["datatable"] = "sr_layer_static_data";			
			$layersTable->insert($theJSON["options"]);



			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
//			$messages = $result->getMessages();
//			foreach ($messages as $i => $message) {
//				$logger->log("CreateLayer : $postVals", Zend_Log::DEBUG);
				$logger->log("CreateLayer : ".$theJSON['options'], Zend_Log::DEBUG);
//			}


        // action body
    }


}

