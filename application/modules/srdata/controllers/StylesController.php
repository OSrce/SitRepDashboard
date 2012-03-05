<?php

class Srdata_StylesController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_styles";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Styles($this->db);
			$this->idName = "id";

			parent::init();
    }


}

