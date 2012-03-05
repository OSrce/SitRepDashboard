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


}

