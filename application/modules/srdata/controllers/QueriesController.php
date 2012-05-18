<?php

class Srdata_QueriesController extends Srdata_RestController
{

    public function init()
    {
			$this->tableName = 'sr_queries';
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Queries($this->db);
			$this->idName = "id";

			parent::init();
    }


}

