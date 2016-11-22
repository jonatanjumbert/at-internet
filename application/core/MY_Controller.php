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
	public $level2ID = "1";
	
	public function __construct() {
		parent::__construct();
	}
}