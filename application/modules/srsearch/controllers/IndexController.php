<?php

class Srsearch_IndexController extends Zend_Controller_Action
{
		private $_db;
		private $_searchTable;

    public function init()
    {
        /* Initialize action controller here */
//				$this->_db = $this->getInvokeArg('bootstrap')->getResource('db');			
					$this->_db = new Zend_Db_Adapter_Pdo_Pgsql( array(
						'host' => '127.0.0.1',
						'username' => 'sitrepadmin',
						'password' => '',
						'dbname' => 'sr_geocoder'
					) );


//				$this->_searchTable = new Srsearch_Model_DbTable_Search($this->_db);

    }

    public function indexAction()
    {
					$logger = new Zend_Log();
					$logger->addWriter(new Zend_Log_Writer_Stream("/tmp/sr_search.log"));
	
        // action body
				$resTotal = 0;
	
//				$geocodeRequest = $this->_searchTable->select();
//				$geocodeRequest->from( 
/*					$geocodeRequest = $this->_db->select()
					->from( 
					array('g' => 'geocode('.$this->_db->quoteIdentifier(' 500 Grand St, NY, NY').')' ),
					array('rating' => 'g.rating' ,
					'lon' => 'ST_X(geomout)' ,
					'lat' => 'ST_X(geomout)' ,
					'addy' => '(addy).*')
					);
*/
					$requestStr = $this->getRequest()->getParam('addy');
					$logger->log("requestStr = $requestStr",Zend_Log::DEBUG);
	
					$geocodeRequest = "";
					if( stristr($requestStr, " and ") ) {
						$roadway1 = substr($requestStr, 0, stripos($requestStr, " and ") );
						$roadway2 = substr($requestStr, stripos($requestStr, " and ")+5 );
						if(stristr($roadway2, ',') ) {
							$roadway2 = substr($roadway2, 0, stripos($roadway2, ',') );
						}
						$state = 'NY';
						$geocodeRequest = "select g.rating, ST_X(geomout) AS lon, ST_Y(geomout) AS lat, pprint_addy(addy) as addy from geocode_intersection('$roadway1', '$roadway2', '$state' ) as g;";
					} else {
						$geocodeRequest = "select g.rating, ST_X(geomout) AS lon, ST_Y(geomout) AS lat, pprint_addy(addy) as addy from geocode('".$requestStr."') as g;";
					}
					$logger->log("geocode str:".$geocodeRequest, Zend_Log::DEBUG);
				 	$stmt = $this->_db->query($geocodeRequest);

//					$stmt = $this->_db->query($geocodeRequest);

					$result = $stmt->fetchAll();

				$logger->log("TEST:".print_r($result,true), Zend_Log::DEBUG);
				
/*
LETS DO SOMETHING LIKE THIS:
select g.rating, ST_X(geomout) AS lon, ST_Y(geomout) AS lat, (addy).* from geocode('500 Grand Street Brooklyn, NY') as g;

*/

				$resTotal = sizeof($result);
			


				//PRINT BACK TO CLIENT :
				print "{";
					print '"label": "addy",';
					print '"total":'.$resTotal.',';
					print '"items": ';
//					print '"dataItems": ';
					print Zend_Json::encode($result);
					print '';
				print "}";
    }


}

