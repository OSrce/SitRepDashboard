<?php

class Srdata_StylepresetsController extends Srdata_RestController
{

    public function init()
    {

			$this->tableName = "sr_style_presets";
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Presets($this->db);
			$this->idName = "id";

			parent::init();
    }


}

