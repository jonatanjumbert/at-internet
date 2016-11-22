<?php 

class category extends MY_Controller {
	
	public function __construct() {
		parent::__construct();
	}
	
	public function index() {
		$this->load->view('category/index', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID));
	}
	
	public function error() {
		$this->load->view('category/error', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID));
	}
}
