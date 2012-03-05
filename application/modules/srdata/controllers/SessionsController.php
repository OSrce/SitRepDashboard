<?php

class Srdata_SessionsController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_session";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Sessions($this->db);
			$this->idName = "id";

			parent::init();
    }


}

