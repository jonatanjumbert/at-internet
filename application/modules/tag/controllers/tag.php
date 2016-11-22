<?php 

class tag extends MY_Controller {
	
	public function __construct() {
		parent::__construct();
	}
	
	public function index() {
		$this->load->view('tag/index', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID));
	}
	
	public function error() {
		$this->load->view('tag/error', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID));
	}
}
