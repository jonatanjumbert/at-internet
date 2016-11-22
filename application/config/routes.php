<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'home';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

$_ROUTES = array(
	'(es|en|de)' => 'home/index',
	'\w{2}/home' => 'home/index',
	
	'tag/tag-error-404' => 'tag/error',
	'\w{2}/tag/tag-error-404' => 'tag/error',
	'tag/(:any)' => 'tag/index',
	'\w{2}/tag/(:any)' => 'tag/index',
	
	'category/categoria-error-404' => 'category/error',
	'\w{2}/category/categoria-error-404' => 'category/error',
	'category/(:any)' => 'category/index',
	'\w{2}/category/(:any)' => 'category/index',
	
	'\w{2}/search' => 'search/index',
		
	'about-us' => 'about_us/about_us',
	'\w{2}/about-us' => 'about_us/about_us',
	'contact-us' => 'about_us/contact_us',
	'\w{2}/contact-us' => 'about_us/contact_us',
	'partners' => 'about_us/partners',
	'\w{2}/partners' => 'about_us/partners',
	'editorial-chart' => 'about_us/editorial_chart',
	'\w{2}/editorial-chart' => 'about_us/editorial_chart',

	'programme/(:any)/producto-error-404' => 'product/error',
	'\w{2}/programme/(:any)/producto-error-404' => 'product/error',
	'programme/(:any)/(:any)' => 'product/index',
	'\w{2}/programme/(:any)/(:any)' => 'product/index',
);

foreach($_ROUTES as $r => $data) {
	if(is_string($data)) {
		$route[$r] = $data;
	}
}