<!doctype html>
<html lang="<?php echo $language; ?>">
	<head>
		<title>Search</title>
		<script>var site_id = '<?php echo $siteID; ?>'; var level2Id = <?php echo $level2ID; ?>;</script>
		<script type="text/javascript" src="/assets/jquery.js"></script>
		<script src="/assets/smarttag.js"></script>
		<script type="text/javascript" src="/assets/at-internet.js"></script>
		<link rel="stylesheet" href="/assets/reset.css" />
	</head>
	<body>
		<h1>Search page: <span id="pagename"></span></h1>
		
		<div>
			<div style="float:left; width: 49%;">
				<?php $this->load->view('urls'); ?>
			</div>
			<div style="float:right; width: 49%">
				<?php $this->load->view('urls_external'); ?>
				
				<h3>Search Form</h3>
				<form id="_search_WAR_europarltv_search_:formSearch">
					<input type="text" value="parlamento europeo" id="_search_WAR_europarltv_search_:formSearch:inputTextSearchBy" placeholder="Text to Search"><br />
					<input type="text" value="2187,28398" id="_search_WAR_europarltv_search_:formSearch:meps_hinput" placeholder="MEPs (Automatic Copy)"><br />
					<input type="text" value="<?php echo date('d/m/Y', time()); ?>" id="_search_WAR_europarltv_search_:formSearch:calendarFrom_input" placeholder="Search Date"><br />
					<input type="text" value="<?php echo date('d/m/Y', time() + 86400 * 5); ?>"id="_search_WAR_europarltv_search_:formSearch:calendarTo_input" placeholder="End Date"><br />
					<input type="text" value="1" id="_search_WAR_europarltv_search_:formSearch:category_focus" placeholder="Category (Automatic copy)"><br />
					<input type="text" value="1" id="_search_WAR_europarltv_search_:formSearch:types_focus" placeholder="Programme Type (Automatic copy)"><br />
					<input type="button" id="" class="" value="Buscar" />
				</form>
				
				<h3>Debugging JS Data:</h3>
				<pre id="var_dump"></pre>
			</div>	
		</div>
	</body>
</html>