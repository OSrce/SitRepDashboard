<?php

class Srdata_StylerulesController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_style_rules";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Stylerules($this->db);
			$this->idName = "id";

			parent::init();
    }


}

