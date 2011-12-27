<?php

class Srdata_Model_DbTable_Features extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_layer_static_data';
		protected $_rowClass = 'Srdata_Model_Feature';

		public function insert(array $data) {
			if( !empty( $data['sr_geom'] ) ) {
				$geomTmp = "'".Zend_Json::encode( $data['sr_geom'] )."'";
				$data['sr_geom'] = new Zend_Db_Expr(" SetSRID( ST_GeomFromGeoJSON($geomTmp), 4326) ");
			}
			return parent::insert($data);
		}

		public function update(array $data, $where) {
			if( !empty( $data['sr_geom'] ) ) {
				$geomTmp = "'".Zend_Json::encode( $data['sr_geom'] )."'";
				$data['sr_geom'] = new Zend_Db_Expr(" SetSRID( ST_GeomFromGeoJSON($geomTmp), 4326) ");
			}
			return parent::update($data,$where);
		}



}

