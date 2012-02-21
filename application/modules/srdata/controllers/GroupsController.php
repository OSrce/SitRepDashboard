<?php

class Srdata_GroupsController extends Srdata_RestController
{

    public function init()
    {

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Groups($this->db);
			$this->idName = "gid";

			parent::init();
    }


}

