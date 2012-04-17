<?php

class Srdata_CfsController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = 'sr_cfs_withlocation';
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Cfs($this->db);
			$this->idName = "cfs_num";

			parent::init();
    }


}

