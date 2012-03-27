<?php

class Srdata_Model_DbTable_Layers extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_layers';
		protected $_rowClass = 'Srdata_Model_Layer';

		protected $_sequence = 'sr_layers_id_seq';

		public function insert(array $data) {
			if( empty( $data['created_on'] ) ) {
				// Postgresql TIMESTAMP == PHP date('Y-m-d H:i:s')
				$data['created_on'] = new Zend_Db_Expr('CURRENT_TIMESTAMP');
			}
			return parent::insert($data);
		}

		public function update(array $data, $where) {
			if(empty($data['updated_on'] ) ) {
				$data['updated_on'] = new Zend_Db_Expr('CURRENT_TIMESTAMP');
			}
			return parent::update($data, $where);
		}
	}

