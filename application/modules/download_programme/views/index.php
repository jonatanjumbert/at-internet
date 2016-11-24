<!doctype html>
<html lang="<?php echo $language; ?>">
	<head>
		<title>Download Programme</title>
		<script>var site_id = '<?php echo $siteID; ?>'; var level2Id = <?php echo $level2ID; ?>;</script>
		<script type="text/javascript" src="/assets/jquery.js"></script>
		<script src="/assets/smarttag.js"></script>
		<script type="text/javascript" src="/assets/at-internet-download.js"></script>
		<link rel="stylesheet" href="/assets/reset.css" />
	</head>
	<body>
		<h1 class="regular-text" data-slug="video-2">Download Programme page: <span id="pagename"></span></h1>

		<div>
			<div style="float:left; width: 49%;">
				<?php $this->load->view('urls_download'); ?>
			</div>
			<div style="float:right; width: 49%">
				<ul class="inline tags-list" id="tags-list" data-tags="tag-1|tag-2">
					<li>Tags relacionados</li>
					<li><a href="/es/tag/tag-1/" />tag-1</li>
					<li><a href="/es/tag/tag-2/" />tag-2</li>
				</ul>
				
				<h3>Debugging JS Data:</h3>
				<pre id="var_dump"></pre>
			</div>	
		</div>
	</body>
</html>