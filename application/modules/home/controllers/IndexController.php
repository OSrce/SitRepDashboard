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
				$this->_title = $user['title'];
				$this->_lastname = $user['lastname'];

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
				'user_title' => $this->_title,
				'user_lastname' => $this->_lastname,
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

			$this->getResponse()->appendBody( "<script type=\"text/javascript\">\n") ;
			// BEGIN LOAD STATIC VALS INTO CLIENTS JS.			
			$this->getResponse()->appendBody( "srd.staticVals = ");
			$this->getResponse()->appendBody( Zend_Json::encode($staticVals)."\n");
			// END LOAD STATIC VALS

			// BEGIN LOAD srdLayerArr data :
//			$this->getResponse()->appendBody("srd.srd_styleArr
			foreach($this->_styles as $styleId => $style) {
				$styleArr = $style->toArray();
				$styleArrJSON = Zend_Json::encode($styleArr);
				$logger->log("printstyleJSON:".$styleArrJSON,Zend_Log::DEBUG);
				$this->getResponse()->appendBody( "srd.srd_styleArr['$styleId'] = \n");
				$this->getResponse()->appendBody( $styleArrJSON."\n");
			}
			// END LOAD srdLayerArr data

			// BEGIN LOAD srdLayerArr data :
			$this->getResponse()->appendBody("var theLayers = [\n");
			$firstTime =1;
			foreach($this->_layers as $layerId => $layer) {
				if($firstTime ==1) {
					$firstTime =0;
				} else {
					$this->getResponse()->appendBody(",");
				}
//				$this->getResponse()->appendBody( "srd.srd_layerArr[$layerId] = new srd_layer();\n");
				$layerOptions = $layer->toArray();
				$logger->log("printLayer:".print_r($layerOptions,true),Zend_Log::DEBUG);
				$layerOptionsJSON = Zend_Json::encode($layerOptions);
//				$logger->log("printLayerJSON:".$layerOptionsJSON,Zend_Log::DEBUG);
//				$this->getResponse()->appendBody( "srd.srd_layerArr['$layerId'].options = \n");
				$this->getResponse()->appendBody( $layerOptionsJSON."\n");
//				$this->getResponse()->appendBody( "srd.srd_layerArr['$layerId'].srd_styleArr = srd.srd_styleArr;\n");
			}
			$this->getResponse()->appendBody("]\n");
			// END LOAD srdLayerArr data


			$this->getResponse()->appendBody( "\n</script>\n");
			$this->getResponse()->appendBody( "\n</head>\n");
			$this->render('index');

    }
		
	private function getLayers() {
		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	

//	$presetsTable = new Srdata_Model_DbTable_Presets($db);
		$stylesTable = new Srdata_Model_DbTable_Styles($this->_db);
		$layersTable = new Srdata_Model_DbTable_Layers($this->_db);
		$modulesTable = new Srdata_Model_DbTable_Modules($this->_db);

		$acl = new Login_Acl($this->_db,$this->_uid,$this->_gid);
		$theRole = "uid:".$this->_uid;
		$theResources = $acl->getResources();
		$this->_layers = array();
		$this->_styles = array();
		$logger->log("getLayer 1:::".print_r($theResources,true),Zend_Log::DEBUG);
		foreach($theResources as $theRes) {
//		list ($resType, $resId) = preg_split('/:/',$theRes ); 
//		if($resType == 'layer') {
			$theSelect = $modulesTable->select();
			$theSelect->where('id=?',$theRes);
			$theModule = $modulesTable->fetchRow($theSelect);
			if( $acl->isAllowed($theRole,$theRes,'read') ) {
				if( $theModule['name'] == '*/*/*' || $theModule['name'] == 'srdata/*/*' ) {
				// LOAD EVERY LAYER, STYLE, PRESET...
					$logger->log("Load Everything.",Zend_Log::DEBUG);
					$layerSelect = $layersTable->select();
					$layerSelect->order('id');	
					$layerRowSet = $layersTable->fetchAll($layerSelect);
					foreach($layerRowSet as $layerRow) {
						$this->_layers[$layerRow['id']] = $layerRow;
					}
				} elseif( $theModule['name'] == 'srdata\/layers\/\*' ) {
				// LOAD EVERY LAYER
				

				}
				
			}
		}
	}
}

