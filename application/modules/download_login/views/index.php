<!doctype html>
<html lang="<?php echo $language; ?>">
	<head>
		<title>Download Login</title>
		<script>var site_id = '<?php echo $siteID; ?>'; var level2Id = <?php echo $level2ID; ?>;</script>
		<script type="text/javascript" src="/assets/jquery.js"></script>
		<script src="/assets/smarttag.js"></script>
		<script type="text/javascript" src="/assets/at-internet-download.js"></script>
		<link rel="stylesheet" href="/assets/reset.css" />
	</head>
	<body>
		<h1>Download Login page: <span id="pagename"></span></h1>

		<div>
			<div style="float:left; width: 49%;">
				<?php $this->load->view('urls_download'); ?>
			</div>
			<div style="float:right; width: 49%">
				<h3>Debugging JS Data:</h3>
				<pre id="var_dump"></pre>
			</div>	
		</div>
	</body>
</html>