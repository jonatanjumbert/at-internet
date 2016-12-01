<?php

class MY_Controller extends MX_Controller {
	
	/*
	 * DEV: 573738
	 * PRE: 577959
	 * PRO: 577958
	 */
	public $siteID = "573738";
	
	/*
	 * Web : 1
	 * Download : 2
	 * External : 3
	 */
	public $level2ID = "2";
	
	public $language = 'en-US';
	
	public function __construct() {
		parent::__construct();
		$first_param = $this->uri->segment(1, 'en');
		$first_param = (strlen($first_param) > 2) ? 'en' : $first_param;
		
		if($first_param == 'en') {
			$this->language = 'en-US';
		} else if($first_param == 'es') {
			$this->language = 'es-ES';
		} else if($first_param == 'de') {
			$this->language = 'de-DE';
		} else {
			$this->language = 'en-US';
		}
	}
}