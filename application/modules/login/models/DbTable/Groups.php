<?php

class Login_Model_DbTable_Groups extends Zend_Db_Table_Abstract
{

    protected $_name = 'sr_groups';
    protected $_primary = 'gid';
		protected $_rowClass = 'Login_Model_Group';

		public function getParentGroup( $theGid) {
			$theGroups = $this->find($theGid);
			if( count($theGroups) ) {
				return $theGroups->current()->parent_gid;
			} else {
				return null;
			}
		}
			


}

