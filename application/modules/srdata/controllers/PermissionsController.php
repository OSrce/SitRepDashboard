<?php

class Srdata_PermissionsController extends Srdata_RestController
{

    public function init()
    {

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Permissions($this->db);
			$this->idName = "permission_id";

			parent::init();
    }


}

