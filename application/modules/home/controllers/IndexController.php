<?php

class Home_IndexController extends Zend_Controller_Action
{
		private $_db;
		private $_uid;
		private $_gid;

		private $_layers;
		private $_styles;

    public function init()
    {
        /* Initialize action controller here */
 		    $this->_options = $this->getInvokeArg('bootstrap')->getOptions();

				$this->_db = $this->getInvokeArg('bootstrap')->getResource('db');	

				$auth = Zend_Auth::getInstance();
				$user = $auth->getStorage()->read();
				$this->_uid = $user['uid'];
				$this->_gid = $user['gid'];

				$this->_view_layout_x = $user['view_layout_x'];			
				$this->_view_layout_y = $user['view_layout_y'];			
				$this->_view_data = Zend_Json::decode( $user['view_data'] );	


		 }

    public function indexAction()
    {

			$staticVals = array( 
//				'default_projection' => 'EPSG:4326',
				'view_layout_x' =>	$this->_view_layout_x,
				'view_layout_y' =>	$this->_view_layout_y,
				'view_data' =>	$this->_view_data,
//				'start_lat' => 40.714,
//				'start_lon' => -73.998,
//				'start_zoom' => 10,
//				'runFromServer' => true
			);

//			$auth = Zend_Auth::getInstance();
//			$user = $auth->getStorage()->read();

//			$srd_session = new Zend_Session_Namespace("srd");
			
/*			if($srd_session-> != true) {
				$this->_redirect('/login');
				exit(-1);
			}
*/
			date_default_timezone_set("America/New_York");
			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	
			$this->render('srdincludes');

			$this->getLayers();

			echo "<script>\n";
			// BEGIN LOAD STATIC VALS INTO CLIENTS JS.			
			echo "srd.staticVals = ";
			echo Zend_Json::encode($staticVals)."\n";
			// END LOAD STATIC VALS

			// BEGIN LOAD srdLayerArr data :
			foreach($this->_styles as $styleId => $style) {
				$styleArr = $style->toArray();
				$styleArrJSON = Zend_Json::encode($styleArr);
				$logger->log("printstyleJSON:".$styleArrJSON,Zend_Log::DEBUG);
				echo "srd.srd_styleArr['$styleId'] = \n";
				echo $styleArrJSON."\n";
			}
			// END LOAD srdLayerArr data

			// BEGIN LOAD srdLayerArr data :
			foreach($this->_layers as $layerId => $layer) {
				echo "srd.srd_layerArr[$layerId] = new srd_layer();\n";
				$layerOptions = $layer->toArray();
				$logger->log("printLayer:".print_r($layerOptions,true),Zend_Log::DEBUG);
				$layerOptionsJSON = Zend_Json::encode($layerOptions);
//				$logger->log("printLayerJSON:".$layerOptionsJSON,Zend_Log::DEBUG);
				echo "srd.srd_layerArr['$layerId'].options = \n";
				echo $layerOptionsJSON."\n";
				echo "srd.srd_layerArr['$layerId'].srd_styleArr = srd.srd_styleArr;\n";
			}
			// END LOAD srdLayerArr data





			echo "\n</script>\n";

			$this->render('index');

    }
		
		private function getLayers() {
				date_default_timezone_set("America/New_York");
			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	

//		$presetsTable = new Srdata_Model_DbTable_Presets($db);
			$stylesTable = new Srdata_Model_DbTable_Styles($this->_db);
			$layersTable = new Srdata_Model_DbTable_Layers($this->_db);

			$acl = new Login_Acl($this->_db,$this->_uid,$this->_gid);
			$theRole = "uid:".$this->_uid;
			$theResources = $acl->getResources();
			$this->_layers = array();
			$this->_styles = array();
			$logger->log("getLayer 1:::".print_r($theResources,true),Zend_Log::DEBUG);
			foreach($theResources as $theRes) {
				list ($resType, $resId) = preg_split('/:/',$theRes ); 
				if($resType == 'layer') {
					if( $acl->isAllowed($theRole,$theRes,'read') ) {
						$layerRowSet = $layersTable->find($resId);
						if(count($layerRowSet) ) {
							$this->_layers[ strval($resId) ] = $layerRowSet->current(); 
						}
					}
				}
				if($resType == 'style') {
					if( $acl->isAllowed($theRole,$theRes,'read') ) {
						$styleRowSet = $stylesTable->find($resId);
						if(count($styleRowSet) ) {
							$this->_styles[ strval($resId) ] = $styleRowSet->current(); 
						}
					}
				}
			}
		}
}

