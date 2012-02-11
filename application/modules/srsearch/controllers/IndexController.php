<?php

class Srsearch_IndexController extends Zend_Controller_Action
{
		private $_db;
		private $_searchTable;

    public function init()
    {
        /* Initialize action controller here */
			
    }

    public function indexAction()
    {
        // action body
				$resTotal = 0;

				
/*
LETS DO SOMETHING LIKE THIS:
FIX ST_Y
select g.rating, ST_X(geomout) AS lon, ST_X(geomout) AS lat, (addy).* from geocode('500 Grand Street Brooklyn, NY') as g;

*/



				//PRINT BACK TO CLIENT :
				print "{";
					print '"total":'.$resTotal.',';
					print '"items": [';

					print ']';
				print "}";
    }


}

