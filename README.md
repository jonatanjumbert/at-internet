# AT Internet
Codeigniter website to test the correct way to implement a JS file to tag all pages with AT Internet - Digital Intelligence

### JS Script
 * [Script for tagging Website](assets/at-internet.js)
 * [Script for tagging Download Site](assets/at-internet-download.js)
 * Script for tagging Embeds

### Documentation & Links

 * http://www.atinternet.com/es/
 * https://apps.atinternet-solutions.com/
 * https://www.atinternet-solutions.com/
 * [http://developers.atinternet-solutions.com/](http://developers.atinternet-solutions.com/javascript-en/getting-started-javascript-en/tracker-initialisation-javascript-en/)
 * http://help.atinternet-solutions.com/ES/launch_page.htm
 
### Kaltura docs
 
  * [Player events](http://player.kaltura.com/docs/api#sendNotification)
  * [Player bind events example](http://player.kaltura.com/docs/index.php?path=kbind)
  * [Dynamic player embed](http://player.kaltura.com/docs/kwidget)
  * [Reading Player Properties and Expressions](https://vpaas.kaltura.com/documentation/Web-Video-Player/Kaltura-Media-Player-API.html#reading-player-properties-and-expressions)
  
  
### Youtube API Queries for AT-Internet DashBoard

All requests have same entry point: GET https://www.googleapis.com/youtube/v3/

| Documentation     	| Method  | Params 						| Description |
| ------------- |:----------:| -------------------------------------|:------------|
| [Link](https://developers.google.com/youtube/v3/docs/subscriptions/list?hl=es-419) | subscriptions | ?part=contentDetails<br>&mine=true<br>&key=API_KEY | Devuelve los suscriptores de mi canal |