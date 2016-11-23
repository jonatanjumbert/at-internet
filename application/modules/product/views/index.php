<!doctype html>
<html lang="<?php echo $language; ?>">
	<head>
		<title>Product</title>
		<script>var site_id = '<?php echo $siteID; ?>'; var level2Id = <?php echo $level2ID; ?>;</script>
		<script type="text/javascript" src="/assets/jquery.js"></script>
		<script src="/assets/smarttag.js"></script>
		<script type="text/javascript" src="/assets/at-internet.js"></script>
		<link rel="stylesheet" href="/assets/reset.css" />
	</head>
	<body>
		<h1>Product page: <span id="pagename"></span></h1>

		<div>
			<div style="float:left; width: 49%;">
				<?php $this->load->view('urls'); ?>
			</div>
			<div style="float:right; width: 49%">
				<?php $this->load->view('urls_external'); ?>

				<ul class="inline tags-list" id="tags-list" data-tags="tag-1|tag-2">
					<li>Tags relacionados</li>
					<li><a href="/es/tag/tag-1/" />tag-1</li>
					<li><a href="/es/tag/tag-2/" />tag-2</li>
				</ul>
				
				<h3>Video sample</h3>
				<script src="https://kmc.europarltv.europa.eu/p/<?=KALTURA_PARTNER_ID?>/sp/<?=KALTURA_PARTNER_ID?>00/embedIframeJs/uiconf_id/<?=KALTURA_PLAYER_ID?>/partner_id/<?=KALTURA_PARTNER_ID?>"></script>
				<div id="europarlamenttv_player" data-producer="productor-1" style="width:400px;height:330px;"></div> 
				<script>
					var playerOptions = {
						"targetId": 'europarlamenttv_player',
						"wid": "_<?=KALTURA_PARTNER_ID?>",
						"uiconf_id": <?=KALTURA_PLAYER_ID?>,
						"entry_id" : '0_irfbl44j',
						"flashvars" : {
							"streamerType" : "auto",
							"closedCaptions": { 
								"defaultLanguageKey" : "es"
							},
							"IframeCustomPluginCss1" : "https://kmc.europarltv.europa.eu/lib/css/lavinia.css"
						},
						"params" : {
							'wmode': 'transparent'
						}
				 	};

					var fn = window['kalturaCallbackATInternet']; 
					if(typeof fn === 'function') {
					    playerOptions.readyCallback = kalturaCallbackATInternet;
					}
					kWidget.embed(playerOptions);
				</script>
				
				
				<h3>Debugging JS Data:</h3>
				<pre id="var_dump"></pre>
			</div>	
		</div>
	</body>
</html>