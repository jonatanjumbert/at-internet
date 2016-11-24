<?php 

class download_login extends MY_Controller {

	public function __construct() {
		die('a');
		parent::__construct();
	}
	
	public function index() {
		$this->load->view('download_login/index', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
}?>