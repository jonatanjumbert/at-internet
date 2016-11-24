<?php 

class download_programme extends MY_Controller {

	public function __construct() {
		parent::__construct();
	}
	
	public function index() {
		$this->load->view('download_programme/index', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
}?>