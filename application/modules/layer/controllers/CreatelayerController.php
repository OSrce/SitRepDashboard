<?php

class Layer_CreatelayerController extends Zend_Controller_Action
{

    public function init()
    {
        /* Initialize action controller here */
    }

    public function indexAction()
    {

			echo "create layer!";
			$postVals = print_r($_POST,true);
			echo $postVals;


			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
//			$messages = $result->getMessages();
//			foreach ($messages as $i => $message) {
				$logger->log("CreateLayer : $postVals", Zend_Log::DEBUG);
//			}


        // action body
    }


}

