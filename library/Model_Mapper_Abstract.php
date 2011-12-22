<?php

abstract class Model_Mapper_Abstract
{
protected static $_dbTableName;
protected $_dbTable;


public function setDbTable($dbTable) {
if (is_string ( $dbTable )) {
$dbTable = new $dbTable ( );
}
if (! $dbTable instanceof Zend_Db_Table_Abstract) {
throw new Exception ( 'Invalid table data gateway provided' );
}
$this->_dbTable = $dbTable;
return $this;
}

/**
* @return Zend_Db_Table_Abstract
*/
public function getDbTable() {
if (null === $this->_dbTable) {
$this->setDbTable ( 'Model_DbTable_' . ucfirst(static::$_dbTableName) );
}
return $this->_dbTable;
}

public function find($id) {
$result = $this->getDbTable ()->find ( $id );
if (0 == count ( $result )) {
return null;
}
$row = $result->current ();
$model_className = "Model_" . ucfirst(static::$_dbTableName);
$customer = new $model_className ( $row->toArray () );
return $customer;
}

public function getAll() {
return ($this->fetchResults($this->getDbTable ()->fetchAll ()));
}

protected function fetchResults($resultSet) {
$entries = array ();
$model_className = "Model_" . ucfirst(static::$_dbTableName);
foreach ( $resultSet as $row ) {
$entries [] = new $model_className ( $row );
}
return $entries;
}

public static function getAllResults() {
$dbTable_className = 'Model_DbTable_' . ucfirst(static::$_dbTableName);
$model_className = "Model_" . ucfirst(static::$_dbTableName);
$dbTable = new $dbTable_className ( );
$resultSet = $dbTable->fetchAll ();
$entries = array ();
foreach ( $resultSet as $row ) {
$entries [] = new $model_className ( $row->toArray() );
}
return $entries;
}

public static function findById($id) {

$dbTable_className = 'Model_DbTable_' . ucfirst(static::$_dbTableName);
$dbTable = new $dbTable_className ( );
$result = $dbTable->find ( $id );
if (0 == count ( $result )) {
return null;
}
$row = $result->current ();
$model_className = "Model_" . ucfirst(static::$_dbTableName);
$object = new $model_className ( $row->toArray () );
return $object;
}


}






?>
