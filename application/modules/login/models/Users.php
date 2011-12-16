<?php

class Login_Model_Users
{
    protected $_uid;
    protected $_gid;
    protected $_username;
    protected $_firstname;
    protected $_lastname;
    protected $_titlename;
    protected $_last_login;

    public function __construct(array $options = null)
    {
        if (is_array($options)) {
            $this->setOptions($options);
        }
    }

    public function __set($name, $value)
    {
        $method = 'set' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Invalid users property');
        }
        $this->$method($value);
    }

    public function __get($name)
    {
        $method = 'get' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Invalid users property');
        }
        return $this->$method();
    }

    public function setOptions(array $options)
    {
        $methods = get_class_methods($this);
        foreach ($options as $key => $value) {
            $method = 'set' . ucfirst($key);
            if (in_array($method, $methods)) {
                $this->$method($value);
            }
        }
        return $this;
    }

    public function setUid($theUid)
    {
        $this->_uid = (int) $theUid;
        return $this;
    }

    public function getUid()
    {
        return $this->_uid;
    }

    public function setGid($theGid)
    {
        $this->_gid = (int) $theGid;
        return $this;
    }

    public function getGid()
    {
        return $this->_gid;
    }

    public function setUsername($theUsername)
    {
        $this->_username = (string) $theUsername;
        return $this;
    }

    public function getUsername()
    {
        return $this->_username;
    }

	  public function setFirstname($theFirstname)
    {
        $this->_firstname = (string) $theFirstname;
        return $this;
    }

    public function getFirstname()
    {
        return $this->_firstname;
    }

	  public function setLastname($theLastname)
    {
        $this->_lastname = (string) $theLastname;
        return $this;
    }

    public function getLastname()
    {
        return $this->_lastname;
    }

	  public function setTitle($theTitle)
    {
        $this->_title = (string) $theTitle;
        return $this;
    }

    public function getTitle()
    {
        return $this->_title;
    }

    public function setEmail($email)
    {
        $this->_email = (string) $email;
        return $this;
    }

    public function getEmail()
    {
        return $this->_email;
    }

    public function setLast_login($theLastLogin)
    {
        $this->_last_login = $theLastLogin;
        return $this;
    }

    public function getLast_login()
    {
        return $this->_last_login;
    }



}

