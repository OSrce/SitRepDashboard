<?php

class Srdata_UsersController extends Srdata_RestController
{

    public function init()
    {

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Users($this->db);
			$this->idName = "uid";

			parent::init();
    }


}

