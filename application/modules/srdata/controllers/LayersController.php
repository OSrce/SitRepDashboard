<?php

class Srdata_LayersController extends Srdata_RestController
{

    public function init()
    {
			
			$this->tableName = 'sr_layers';
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Layers($this->db);
			$this->idName = "id";
			parent::init();
    }

		// POST Action == CREATE
		public function postAction() 
		{
			parent::postAction();

			// THIS IS THE ID OF THE NEWLY CREATED LAYER.
			// NEED TO ADD PERMISSIONS FOR THIS LAYER :
			// /srdata/layers/####, /srdata/features/####, 
			// /srdata/styles/#####, /srdata/stylepresets/#####
			$layerId = $this->retObj[$this->idName];
			if($layerId != null) {
				$modLayers['name'] = "srdata/layers/$layerId";
				$modFeatures['name'] = "srdata/features/$layerId";
				$modStyles['name'] = "srdata/styles/$layerId";
				$this->modTable = new Srdata_Model_DbTable_Modules($this->db);
				$this->permissionTable = new Srdata_Model_DbTable_Permissions($this->db);
				$retArr = array();
				$retArr[0] = $this->modTable->insert($modLayers);			
				$retArr[1] = $this->modTable->insert($modFeatures);			
				$retArr[2] = $this->modTable->insert($modStyles);			
				
				$auth = Zend_Auth::getInstance();
				$user = $auth->getStorage()->read();
				$this->_uid = $user['uid'];
				$permissionArr = array( 
						'permission_create' => 'allow',			
						'permission_read' => 'allow',			
						'permission_update' => 'allow',			
						'permission_delete' => 'allow',			
						'role_type'	=> 'uid',
						'role_id'	=> $this->_uid
				);
				$permissionArr['resource_id'] = $retArr[0];
				$this->permissionTable->insert($permissionArr);	
				$permissionArr['resource_id'] = $retArr[1];
				$this->permissionTable->insert($permissionArr);	
				$permissionArr['resource_id'] = $retArr[2];
				$this->permissionTable->insert($permissionArr);	
			}		
		}


}

