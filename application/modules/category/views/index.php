<!doctype html>
<html lang="<?php echo $language; ?>">
	<head>
		<title>Category</title>
		<script>var site_id = '<?php echo $siteID; ?>'; var level2Id = <?php echo $level2ID; ?>;</script>
		<script type="text/javascript" src="/assets/jquery.js"></script>
		<script src="/assets/smarttag.js"></script>
		<script type="text/javascript" src="/assets/at-internet.js"></script>
		<link rel="stylesheet" href="/assets/reset.css" />
	</head>
	<body>
		<h1>Category page: <span id="pagename"></span></h1>

		<div>
			<div style="float:left; width: 49%;">
				<?php $this->load->view('urls'); ?>
			</div>
			<div style="float:right; width: 49%">
				<?php $this->load->view('urls_external'); ?>
				
				<h3>Debugging JS Data:</h3>
				<pre id="var_dump"></pre>
			</div>	
		</div>
	</body>
</html>