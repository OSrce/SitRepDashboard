<?php

class Srdata_WlayoutController extends Srdata_RestController
{

    public function init()
    {
			$this->tableName = 'sr_window_layout';
			$this->db = $this->getInvokeArg('bootstrap')->getResource('db');
			$this->restTable = new Srdata_Model_DbTable_Wlayout($this->db);
			$this->idName = "id";

			parent::init();
    }


}

