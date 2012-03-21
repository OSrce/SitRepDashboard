<?php

class Srdata_ModulesController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_modules";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Modules($this->db);
			$this->idName = "id";

			parent::init();
    }


}

