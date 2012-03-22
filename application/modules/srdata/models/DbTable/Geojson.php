<?php

class Srdata_Model_DbTable_Features extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_layer_static_data';
		protected $_rowClass = 'Srdata_Model_Feature';

		public function insert(array $data) {
			if( !empty( $data['sr_geom'] ) ) {
					date_default_timezone_set("America/New_York");
					$logger = new Zend_Log();
					$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_layer.log"));
	
				try {
					$geomTmp = "'".Zend_Json::encode( $data['sr_geom'] )."'";
					$data['sr_geom'] = new Zend_Db_Expr(" SetSRID( ST_GeomFromGeoJSON($geomTmp), 4326) ");
						$logger->log("TEST = ".strlen( $data['sr_geom'] ) , Zend_Log::DEBUG);
				} catch(Zend_Json_Exception $theExcept) {
				$theError = $theExcept->getMessage();
					$logger->log("Error with feature insert:".$theError,Zend_Log::DEBUG);
				}

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

