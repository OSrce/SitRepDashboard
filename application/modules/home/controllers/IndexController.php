<?php

class Home_IndexController extends Zend_Controller_Action
{
		private $_db;
		private $_uid;
		private $_gid;

		private $_queries;
		private $_wlayouts;
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
				$this->_wlayout = $user['wlayout'];

//				$this->_view_layout_x = $user['view_layout_x'];			
//				$this->_view_layout_y = $user['view_layout_y'];			
//				$this->_view_data = Zend_Json::decode( $user['view_data'] );	
				
				$this->view->srd_login_opts = $this->_options['srd']['login'];

		 }

    public function indexAction()
    {

			$staticVals = array( 
//				'default_projection' => 'EPSG:4326',
//				'view_layout_x' =>	$this->_view_layout_x,
//				'view_layout_y' =>	$this->_view_layout_y,
//				'view_data' =>	$this->_view_data,
				'default_wlayout' => $this->_wlayout,
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
			
			if($this->_uid == NULL) {
				$this->_redirect('/login');
				exit(-1);
			}

			date_default_timezone_set("America/New_York");
			$logger = new Zend_Log();
			$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	
			$this->render('srdincludes');

			$this->getLayers();

			$this->getResponse()->appendBody( "<script type=\"text/javascript\">\n") ;
			// BEGIN LOAD STATIC VALS INTO CLIENTS JS.			
			$this->getResponse()->appendBody( "loadsrd.staticVals = ");
			$this->getResponse()->appendBody( Zend_Json::encode($staticVals)."\n");
			// END LOAD STATIC VALS

			$serverToClientArr = array();
			$serverToClientArr['queries'] = 'loadsrd.srd_queryArr';
			$serverToClientArr['layers'] = 'var theLayers';
			$serverToClientArr['styles'] = 'var theStyles';
			$serverToClientArr['stylesymbolizers'] = 'var theStyleSymbolizers';
			$serverToClientArr['stylerules'] = 'var theStyleRules';
			$serverToClientArr['wlayout'] = 'loadsrd.srd_wlayoutArr';
			$serverToClientArr['presets'] = 'loadsrd.srd_presetArr';

			foreach($this->_data as $resType => $resArr) {
				// BEGIN LOAD srdQueryArr data :

					$this->getResponse()->appendBody($serverToClientArr[$resType]." = ");
					$this->getResponse()->appendBody( 
							Zend_Json::encode($resArr) 
					);
					$this->getResponse()->appendBody("\n");
					
/*
				if($resType != 'layers' ) {
					foreach($resArr as $theId => $theArr) {
						$theArrJSON = Zend_Json::encode($theArr);
//						$logger->log("print".$theId."JSON:".$theArrJSON,Zend_Log::DEBUG);
						$this->getResponse()->appendBody( $serverToClientArr[$resType]."['$theId'] = \n");
						$this->getResponse()->appendBody( $theArrJSON."\n");
					}

				} else {
					$this->getResponse()->appendBody("var theLayers = [\n");
					$firstTime =1;
					foreach($resArr as $theId => $theArr) {
						if($firstTime ==1) {
							$firstTime =0;
						} else {
							$this->getResponse()->appendBody(",");
						}
						$layerOptionsJSON = Zend_Json::encode($theArr);
						$this->getResponse()->appendBody( $layerOptionsJSON."\n");
					}
					$this->getResponse()->appendBody("]\n");
				}
*/		
				// END LOAD srdQueryArr data
			}

/*
			// BEGIN LOAD srdWlayoutArr data :
			foreach($this->_wlayouts as $wlayoutId => $wlayoutArr) {
				$wlayoutArrJSON = Zend_Json::encode($wlayoutArr);
				$logger->log("printwlayoutJSON:".$wlayoutArrJSON,Zend_Log::DEBUG);
				$this->getResponse()->appendBody( "srd.srd_wlayoutArr['$wlayoutId'] = \n");
				$this->getResponse()->appendBody( $wlayoutArrJSON."\n");
			}
			// END LOAD srdWlayoutArr data

			// BEGIN LOAD srdStyleArr data :
//			$this->getResponse()->appendBody("srd.srd_styleArr
			foreach($this->_styles as $styleId => $styleArr) {
//				$styleArr = $style->toArray();
				$styleArrJSON = Zend_Json::encode($styleArr);
				$logger->log("printstyleJSON:".$styleArrJSON,Zend_Log::DEBUG);
				$this->getResponse()->appendBody( "srd.srd_styleArr['$styleId'] = \n");
				$this->getResponse()->appendBody( $styleArrJSON."\n");
			}
			// END LOAD srdStyleArr data

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
				$layerOptions = $layer;
				$logger->log("printLayer:".print_r($layerOptions,true),Zend_Log::DEBUG);
				$layerOptionsJSON = Zend_Json::encode($layerOptions);
//				$logger->log("printLayerJSON:".$layerOptionsJSON,Zend_Log::DEBUG);
//				$this->getResponse()->appendBody( "srd.srd_layerArr['$layerId'].options = \n");
				$this->getResponse()->appendBody( $layerOptionsJSON."\n");
//				$this->getResponse()->appendBody( "srd.srd_layerArr['$layerId'].srd_styleArr = srd.srd_styleArr;\n");
			}
			$this->getResponse()->appendBody("]\n");
			// END LOAD srdLayerArr data
*/
			//PUT THE LINKS TO THE SITE SPECIFIC IMAGES IN JS.
			$this->getResponse()->appendBody("loadsrd.siteLeftImage='".$this->view->srd_login_opts['leftimage']."';\n" );
			$this->getResponse()->appendBody("loadsrd.siteRightImage='".$this->view->srd_login_opts['rightimage']."';\n" );
			$this->getResponse()->appendBody("loadsrd.siteTitle='".$this->view->srd_login_opts['title']."';\n" );

			$this->getResponse()->appendBody( "\n</script>\n");
			$this->getResponse()->appendBody( "\n</head>\n");
			$this->render('index');

    }
		
	private function getLayers() {
		date_default_timezone_set("America/New_York");
		$logger = new Zend_Log();
		$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	
		$modulesTable = new Srdata_Model_DbTable_Modules($this->_db);
		$modulesRowSet = $modulesTable->fetchAll();
		$moduleArr = array();
		foreach($modulesRowSet as $moduleRow) {
			$moduleArr[$moduleRow['id'] ] = $moduleRow['name'];
		}

		$tableArr = array();
		$tableArr['queries'] = new Srdata_Model_DbTable_Queries($this->_db);
		$tableArr['wlayout'] = new Srdata_Model_DbTable_Wlayout($this->_db);
		$tableArr['presets'] = new Srdata_Model_DbTable_Presets($this->_db);
		$tableArr['styles'] = new Srdata_Model_DbTable_Styles($this->_db);
		$tableArr['stylesymbolizers'] = new Srdata_Model_DbTable_Stylesymbolizers($this->_db);
		$tableArr['stylerules'] = new Srdata_Model_DbTable_Stylerules($this->_db);
		$tableArr['layers'] = new Srdata_Model_DbTable_Layers($this->_db);

		$acl = new Login_Acl($this->_db,$this->_uid,$this->_gid);
		$theRole = "uid:".$this->_uid;
		$logger->log("The Roles:::$theRole",Zend_Log::DEBUG);
		$theResources = $acl->getResources();

//		$this->_queries = array();
//		$this->_wlayouts = array();
//		$this->_layers = array();
//		$this->_styles = array();
		$this->_data = array();
		foreach($tableArr as $key => $value) {
			$this->_data[$key] = array();
		}

		##### FIGURE OUT WHAT WE NEED BY ITERATING THROUGH ALL MODULES WITH
		##### ACL = ALLOW READ 
		### LOAD ALLs.
		$loadEverything = null;
		$loadAllArr = array();
		### LOAD IND ARRs
		$loadArr = array();

		$logger->log("The Modules:::".print_r($moduleArr,true),Zend_Log::DEBUG);
		$logger->log("The Resources:::".print_r($theResources,true),Zend_Log::DEBUG);
		foreach($theResources as $theRes) {
//		list ($resType, $resId) = preg_split('/:/',$theRes ); 
//			$theSelect = $modulesTable->select();
//			$theSelect->where('id=?',$theRes);
//			$theModule = $modulesTable->fetchRow($theSelect);
		
			if( $acl->isAllowed($theRole,$theRes,'read') ) {
				if( $moduleArr[$theRes] == '*/*/*' || $moduleArr[$theRes] == 'srdata/*/*' ) {
				// LOAD EVERY LAYER, STYLE, PRESET...
					$loadEverything = $theRes;
					$logger->log("Load Everything.",Zend_Log::DEBUG);
				} elseif( preg_match( '/srdata\/(\w+)\/\*/', $moduleArr[$theRes], $matchArr ) ) {
				// LOAD EVERY ######
					$loadAllArr[$matchArr[1]] = $theRes;
				} elseif( preg_match( '/srdata\/(\w+)\/(\d+)/', $moduleArr[$theRes], $matchArr ) ) {
				//LOAD SPECFIC ITEM
					if( !array_key_exists($matchArr[1], $loadArr) ) {
						$loadArr[$matchArr[1]] = array();
					}
					$loadArr[$matchArr[1]][$matchArr[2]] = $theRes;
				} 
			}
		}
		### END FOREACH RESOURCE THIS USER CAN READ LOOP.
		### BEGIN LOAD
		foreach($tableArr as $resType => $resTable) {
			$theRowSet = null;
			if($loadEverything != null || array_key_exists($resType, $loadAllArr) ) {
				$logger->log("Load Every $resType.",Zend_Log::DEBUG);
				$theSelect = $resTable->select();
				$theSelect->order('id');	
				$theRowSet = $resTable->fetchAll($theSelect);
			} elseif ( array_key_exists($resType, $loadArr) && count( $loadArr[$resType]) > 0 ) {
				$findResArr = array();
				foreach($loadArr[$resType] as $theResId) {
					$logger->log("Load $resType :".$theResId,Zend_Log::DEBUG);
					array_push($findResArr, $theResId);
				}
				$theRowSet = $resTable->find($findRessArr);
			}
			if($theRowSet != null) {
				foreach($theRowSet as $theRow) {
					if( !array_key_exists( $theRow['id'], $this->_data[$resType] ) ) { 
						$this->_data[$resType][$theRow['id']] = $theRow->toArray();
						$this->_data[$resType][$theRow['id']]['can_update'] = 'false';
						$this->_data[$resType][$theRow['id']]['can_delete'] = 'false';
						$tmpRes = null;
						if( array_key_exists($resType, $loadArr) && array_key_exists($theRow['id'], $loadArr[$resType]) ) {
							$tmpRes = $loadArr[$resType][$theRow['id']];
//							$logger->log("Test: $resType :".$theRow['id']." :$tmpRes",Zend_Log::DEBUG);
						} elseif ( array_key_exists($resType, $loadAllArr) ) {
							$tmpRes = $loadAllArr[$resType];
//							$logger->log("Test2: $resType :".$theRow['id']." :$tmpRes",Zend_Log::DEBUG);
						} elseif ( $loadEverything != null) {
							$tmpRes = $loadEverything;
//							$logger->log("Test3: $resType :".$theRow['id']." :$tmpRes",Zend_Log::DEBUG);
						}
						if($tmpRes != null) {
//							$logger->log("Check Update and Delete for $resType :".$theRow['id']." :$tmpRes",Zend_Log::DEBUG);
							if( $acl->isAllowed($theRole,$tmpRes,'update') ) {
								$this->_data[$resType][$theRow['id']]['can_update'] = 'true';
							}
							if( $acl->isAllowed($theRole,$tmpRes,'delete') ) {
								$this->_data[$resType][$theRow['id']]['can_delete'] = 'true';
							}	
						}	
						
						// UNFORTUNATE EXCEPTIONS THAT HAVE TO BE HANDLED
						// TODO : FIX THESE!
						if($resType == 'layers') {
							$this->_data[$resType][$theRow['id']]['feature_create'] = 'false';
							$this->_data[$resType][$theRow['id']]['feature_update'] = 'false';
							$this->_data[$resType][$theRow['id']]['feature_delete'] = 'false';
							$tmpRes = null;
							if( array_key_exists('features', $loadArr) && array_key_exists($theRow['id'], $loadArr['features']) ) {
								$tmpRes = $loadArr[$resType][$theRow['id']];
							} elseif ( array_key_exists('features', $loadAllArr) ) {
								$tmpRes = $loadAllArr[$resType];
							} elseif ( $loadEverything != null) {
								$tmpRes = $loadEverything;
							}
							if($tmpRes != null) {
//								$logger->log("Check Feature Update and Delete for $resType :".$theRow['id']." : $tmpRes",Zend_Log::DEBUG);
								if( $acl->isAllowed($theRole,$tmpRes,'create') ) {
									$this->_data[$resType][$theRow['id']]['feature_create'] = 'true';
								}	
								if( $acl->isAllowed($theRole,$tmpRes,'update') ) {
									$this->_data[$resType][$theRow['id']]['feature_update'] = 'true';
								}
								if( $acl->isAllowed($theRole,$tmpRes,'delete') ) {
									$this->_data[$resType][$theRow['id']]['feature_delete'] = 'true';
								}	
							}	
						} elseif($resType == 'wlayout') {
							$this->_data[$resType][$theRow['id']]['view_data'] = Zend_Json::decode(	$this->_data[$resType][$theRow['id']]['view_data'] ); 
						} elseif($resType == 'queries') {
							$this->_data[$resType][$theRow['id']]['data'] = Zend_Json::decode(	$this->_data[$resType][$theRow['id']]['data'] ); 
						} elseif($resType == 'stylerules') {
							$this->_data[$resType][$theRow['id']]['filter_data'] = Zend_Json::decode(	$this->_data[$resType][$theRow['id']]['filter_data'] ); 
						}
						// END UNFORTUNATE EXCEPTIONS.	
					}
				}
			}
		}
	
/*
						if($tmpResLayer != null) {
							if( $acl->isAllowed($theRole,$tmpResLayer,'update') ) {
								$this->_layers[$layerRow['id']]['layer_update'] = 'true';
							}
							if( $acl->isAllowed($theRole,$tmpResLayer,'delete') ) {
								$this->_layers[$layerRow['id']]['layer_delete'] = 'true';
							}
						}
						if($tmpResFeature != null) {
							if( $acl->isAllowed($theRole,$tmpResFeature,'create') ) {
								$this->_layers[$layerRow['id']]['feature_create'] = 'true';
							}
							if( $acl->isAllowed($theRole,$tmpResFeature,'update') ) {
								$this->_layers[$layerRow['id']]['feature_update'] = 'true';
							}
							if( $acl->isAllowed($theRole,$tmpResFeature,'delete') ) {
								$this->_layers[$layerRow['id']]['feature_delete'] = 'true';
							}
						}
*/


		### END LOAD LAYERS
	}
	### END getLayers FUNCTION
}



