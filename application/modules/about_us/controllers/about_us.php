<?php 

class about_us extends MY_Controller {
	
	public function __construct() {
		parent::__construct();
	}
	
	public function index() {
		$this->load->view('about_us/about_us', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
	
	public function contact_us() {
		$this->load->view('about_us/contact_us', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
	
	public function partners() {
		$this->load->view('about_us/partners', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
	
	public function editorial_chart() {
		$this->load->view('about_us/editorial_chart', array('siteID' => $this->siteID, 'level2ID' => $this->level2ID, 'language' => $this->language));
	}
}
