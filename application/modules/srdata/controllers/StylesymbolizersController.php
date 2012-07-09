<?php

class Srdata_StylesymbolizersController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_style_symbolizers";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Stylesymbolizers($this->db);
			$this->idName = "id";

			parent::init();
    }


}

