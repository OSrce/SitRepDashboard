<?php

class Layer_CreateLayerController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {
			echo "create layer!";
				
			echo $_POST;	

			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
//			$messages = $result->getMessages();
//			foreach ($messages as $i => $message) {
				$logger->log("CreateLayer : $_POST",Zend_Log::DEBUG);
//			}

        // action body
    }


}

