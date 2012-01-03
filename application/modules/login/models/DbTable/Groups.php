<?php

class Login_Model_DbTable_Groups extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_groups';
    protected $_primary = 'gid';
		protected $_rowClass = 'Login_Model_Group';

		public function getParentGroup( $theGid) {
			$theGroups = $this->find($theGid);
//			if( is_array( $theGroups ) ) {
				return $theGroups[0]->parent_gid;
//			} else {
//				return null;
//			}
		}
			


}

