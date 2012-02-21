<?php

class Srdata_LayersController extends Srdata_RestController
{

    public function init()
    {

			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Layers($this->db);

			parent::init();
    }


}

