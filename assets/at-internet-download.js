/**
 * Script que envía los datos de la analítica web al proveedor de AT-Internet. 
 * 
 * @author Jonatan Jumbert
 * @contact hola@jonatanjumbert.com - http://jonatanjumbert.com
 * @version 0.8.4
 */

/*
 * Variables globales de la configuración AT-Internet
 * y de los datos de la propia página para poder utilizar desde el callback del player.
 */ 
var current_url = null;
var debugData = null;
var level2 = null;
var producer = "";

$(function() {
	var url_segments = null;
	var siteID = null;
	var lang = "es";
	var debugEnabled = true;
	
	// Comprobamos si existe console, para debugar
	if(!window.console) console = { log: function(){} };
	
	/**
	 * Funcion para debugar variables por consola.
	 * Siempre que la variable debugEnabled sea true.
	 */
	debugData = function(obj) {
		if(debugEnabled) {
			if(typeof obj.action !== "undefined" && obj.action != "") {
				console.log('[INI]:::[AT-INTERNET]::: ' + obj.action + '::::');
			}
			
			for(var property in obj) {
			    if(obj.hasOwnProperty(property) && property != "action") {
			    	console.log(obj[property]);
			    }
			}
			
			if(typeof obj.action !== "undefined" && obj.action != "") {
				console.log('[FIN]:::[AT-INTERNET]::: ' + obj.action + '::::');
			}
		}
	};
	
	/**
	 * Devuelve el último segmento de la URL pasada por parámetro.
	 */
	var getLastSegmentFromURL = function(url) {
		var segments = url.split("/");
		return segments.pop();
	};
	
	/**
	 * Recupera el nombre del programa que estamos descargando.
	 */
	var getProgramTitle = function() {
		if($('h1.regular-text').length > 0) {
			var data_slug = $('h1.regular-text').attr('data-slug');
			
			if(data_slug !== "undefined" && data_slug != "") {
				return data_slug;
			} else {
				return false;
			}
		} else {
			return "";
		}
	};
	
	/**
	 *  Recupera el idioma de la página actual.
	 *  @FIXME Importante que Balidea incluya en el código fuente de todas las páginas 
	 */
	var getLanguage = (function() {
		lang = $('html').attr('lang');
		if(typeof lang !== "undefined" && lang != "")  {
			lang_split = lang.split("-");
			if(lang_split.length > 1) {
				lang = lang_split[0].toUpperCase();
			}
		} else {
			lang = "EN";
		}
	})();
	
	/**
	 * Guarda en url_segments un array con los segmentos de la URL actual.
	 * Incluye como primer segmento el Idioma aunque se trate del Inglés y por defecto no aparezca en la URL.
	 */
	var getURLSegments = (function() {
		var url_segments_cleaned = [];
		var segments = location.pathname.split("/");
		for(var i = 0; i < segments.length; i++) {
			if(segments[i] != "") {
				url_segments_cleaned.push(segments[i]);
			}
		}
		url_segments = url_segments_cleaned;
		if(lang == "EN" && url_segments[0] != "EN") {
			url_segments.unshift('EN');
		} 
		if(url_segments.length == 0) {
			url_segments.unshift('EN');
		}
		
		return url_segments;
	})();
	
	/**
	 * Recupera los parámetros del Query String. Por ejemplo: ?foo=lorem&bar=&baz
	 *	var foo = getParameterByName('foo'); // "lorem"
	 *	var bar = getParameterByName('bar'); // "" (present with empty value)
	 *	var baz = getParameterByName('baz'); // "" (present with no value)
	 *	var qux = getParameterByName('qux'); // null (absent)
	 *
	 * @see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	 */
	var getParameterByName = function(name, url) {
	    if(!url) {
	      url = window.location.href;
	    }
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
	    if(!results) return null;
	    if(!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	};
	
	/**
	 * Desactiva el modo debug para el entorno de PRODUCCION a excepcion
	 * si se pasa por parámetro en la URL ?debugEnabled=true 
	 */
	var configureDebugMode = (function() {
		if(window.location.hostname != "www.europarltv.europa.eu") {
			debugEnabled = true;
		} else {
			var debugParam = getParameterByName("debugEnabled");
			if(debugParam != null && debugParam == "true") {
				debugEnabled = true;
			} else {
				debugEnabled = false;
			}
		}
	})();
	
	/**
	 * Comprueba si la página actual es la home login.
	 */ 
	var checkLoginPage = function() {
		if(window.location.href.indexOf("login") === -1 ) {
			if(url_segments.length == 1 && url_segments[0].length == 2) {
				return true
			} else {
				return false;
			}
		} else {
			return true;
		}
	};
	
	/**
	 * Comprueba si la página actual es la de descarga de un programa.
	 */
	var checkVideoPage = function() {
		if(window.location.href.indexOf("programmeId") === -1 ) {
			return false;
		} else {
			return true;
		}
	}
	
	/**
	 * Objeto que contiene los datos de los segmentos de la URL actual, idioma y determina que tipo de página estamos visitando.
	 */ 
	var initURLObject = (function() {
		var instance;
		
		function createInstance() {
			var is_login_page = checkLoginPage();
			var is_video_page = checkVideoPage();
			
			return {
				'url_path' : url_segments,
				'previous_page' : (typeof(Storage) !== "undefined" && localStorage.previous_page_download != "") ? localStorage.previous_page_download : "",
				'previous_chapter' : (typeof(Storage) !== "undefined" && localStorage.previous_chapter_download != "") ? localStorage.previous_chapter_download : "",
				'lang' : lang,
				'login' : is_login_page,
				'home' : (!is_login_page && !is_video_page && $('.search-video-form').length > 0) ? true : false,
				'video' : is_video_page,
			};
		}
		
		return {
			// Método Singleton, instanciamos únicamente una vez este objeto.
			getInstance: function() {
				if(!instance) {
					instance = createInstance();
				}
				return instance;
			},
			// Guardamos los datos de la página actual
			setCurrentPageData : function() {
				if(typeof(Storage) !== "undefined") {
					// Guardar datos que corresponda a cada página.
					if(current_url.home) {
						localStorage.previous_chapter_download = "download";
						localStorage.previous_page_download = "hompage";
					} else if(current_url.login) {
						localStorage.previous_chapter_download = "download";
						localStorage.previous_page_download = "login";
					} else if(current_url.video) {
						if($('div.col-download ul.nav.nav-tabs li.active').length > 0) {
							var text = $('a', $('div.col-download ul.nav.nav-tabs li.active')).html();
							var active_tab = (text !== "undefined" && text != "") ? text.toLowerCase() : "download";

							localStorage.previous_chapter_download = "download";
							localStorage.previous_page_download = active_tab;
						}
					}
					localStorage.current_time_download = Math.floor(Date.now() / 1000);
				}
			}
	    };
	})();

	/**
	 * Se inicializa el objeto de AT-Internet con los datos que hacen referencia al site y al level2 en el código fuente de la página.
	 * @FIXME Importante que Balidea, ponga esos datos en el código fuente de todas las páginas dependiendo del Entorno (DEV/PRE/PRO).
	 */
	var initATInternetTag = (function() {
		return {
			getInstance: function() {
				siteID = (typeof site_id !== "undefined") ? site_id : 573738;
				level2 = (typeof level2Id !== "undefined") ? level2Id : 2;
				return new ATInternet.Tracker.Tag({log: "logc407", logSSL: "logs1407", secure: false, site: siteID, domain: "xiti.com"});
			}
	    };
	})();
	
	/**
	 * Recupera las variables del sitio personalizadas.
	 * @FIXME Importante que Balidea implemente una etiqueta #tags-list con data-tags para poder recuperar correctamente los tags de la página si los hubiera.
	 */
	var getVariablesSitioPersonalizadas = function() {
		var variablesSitioPersonalizadas = {
			7 : lang.toUpperCase()
		};
		
		if($('#tags-list').length > 0) {
			var tagsList = $('#tags-list').attr('data-tags');
			if(tagsList !== undefined && tagsList !== "undefined" && tagsList != "") {
				variablesSitioPersonalizadas[2] = "[" + tagsList + "]";
			}
		}
		
		if(typeof(Storage) !== "undefined" && localStorage.previous_chapter_download !== undefined && localStorage.previous_chapter_download != "") {
			variablesSitioPersonalizadas[3] = "[" + localStorage.previous_chapter_download + "]";
		}
		if(typeof(Storage) !== "undefined" && localStorage.previous_page_download !== undefined && localStorage.previous_page_download != "") {
			variablesSitioPersonalizadas[4] = "[" + localStorage.previous_page_download + "]";
		}
		
		return variablesSitioPersonalizadas;
	};
	
	/**
	 * Si estamos en la página de búsqueda, según el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaBusqueda = function() {
		var result = {};
		
		if($('.search-video-form').length > 0) {
			$('div.search-video-form input').each(function () {
				if($(this).attr('id') == "_downloadlist_WAR_europarltv_download_list_:j_idt6:inputTextSearchBy") {
					if(this.value != "") {
						result[1] = "[" + this.value + "]";
					}
				} else if($(this).attr('id') == "_downloadlist_WAR_europarltv_download_list_:j_idt6:calendarFrom_input") {
					var current_value = this.value;
					var current_value_split = current_value.split('/');
					if(current_value_split.length == 3) {
						var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
						result[2] = "[" + send_value + "]";
					}
				} else if($(this).attr('id') == "_downloadlist_WAR_europarltv_download_list_:j_idt6:calendarTo_input") {
					var current_value = this.value;
					var current_value_split = current_value.split('/');
					if(current_value_split.length == 3) {
						var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
						result[3] = "[" + send_value + "]";
					}
				} 
			});
			
			if($('label#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:types_label').length > 0) {
				var types_label = $('label#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:types_label').html();
				if(types_label != "") {
					result[4] = types_label; 
				}
			}
			
			if($('label#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:categories_label').length > 0) {
				var categories_label = $('label#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:categories_label').html();
				if(categories_label != "") {
					result[5] = categories_label; 
				}
			}
			
			if($('#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:meps li span').length > 0) {
				var send_value = "";
				var meps = [];
				
				$('#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:meps li span').each(function(i, val) {
					var valor = $(val).html();
					if(valor != "") {
						meps.push(valor);
					}
				});
				
				if(meps.length > 0) {
					send_value += meps.join('|');
					result[6] = "[" + send_value + "]";
				}
			}
		}
		return result;
	};
	
	/**
	 * Si el usuario selecciona descargar un video o únicamente los subitulos, según el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaDownload = function(downloadType) {
		var result = {};
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			result[1] = programTitle;
		}
		
		if($('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:downloadLangCode').length > 0) {
			var idioma = $('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:downloadLangCode').val();
			if(idioma !== "undefined" && idioma !== undefined && idioma != "") {
				result[2] = idioma;
			}
		}
		
		if(downloadType && downloadType !== "") {
			result[3] = downloadType;
		}
		
		return result;
	};
	
	/**
	 * Variables personalizadas para cuando el usuario hace un request de un video.
	 */
	var getVariablesPaginaRequest = function() {
		var result = {};
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			result[1] = programTitle;
		}
		
		if($('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectVideoFormat_input').length > 0) {
			var format = $('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectVideoFormat_input').val();
			if(format != "") {
				result[2] = format;
			}
		}
		
		if($('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectVideoResolution_input').length > 0) {
			var resolution = $('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectVideoResolution_input').val();
			if(resolution != "") {
				result[3] = resolution;
			}
		}

		if($('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectBitRate_input').length > 0) {
			var bitrate = $('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectBitRate_input').val();
			if(bitrate != "") {
				result[4] = bitrate;
			}
		}

		// Voice over
		if($('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:requestVOLangCode').length > 0) {
			var idioma = $('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:requestSTLangCode').val();
			if(idioma !== "undefined" && idioma !== undefined && idioma != "") {
				result[6] = idioma;
			}
		}
		
		// Burnt subtitles
		if($('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:requestSTLangCode').length > 0) {
			var idioma = $('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:requestSTLangCode').val();
			if(idioma !== "undefined" && idioma !== undefined && idioma != "") {
				result[6] = idioma;
			}
		}
		
		// European parliament logo
		result[7] = ($('div#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:checkLogo div.ui-state-active').length > 0) ? '1' : '2';
		
		return result;
	};
	
	/**
	 * Variables personalizadas para cuando el usuario hace un copy de un embed.
	 */
	var getVariablesPaginaEmbed = function() {
		var result = {};
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			result[1] = programTitle;
		}
		
		if($('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:embeddedLangCode').length > 0) {
			var idioma = $('input#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:embeddedLangCode').val();
			if(idioma !== "undefined" && idioma !== undefined && idioma != "") {
				result[3] = idioma;
			}
		}
		
		return result;
	};
	
	/**
	 * Variables personalizadas para cuando el usuario hace click en Bulk Download
	 */
	var getVariablesPaginaBulkDownload = function() {
		var result = {};
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			result[1] = programTitle;
		}
		
		return result;
	}
	
	/**
	 * Devuelve el ID del usuario en sessión si no estamos en la página de login y si no se ha enviado previamente
	 * ya a AT-Internet (expira en 1hora, entonces se debería volver a enviar).
	 */
	var getUserId = function() {
		if(typeof(Storage) !== "undefined" && localStorage.user_id !== undefined && localStorage.user_id != "") {
			return false;
		} else {
			if(!current_url.login) {
				if((typeof user_id !== "undefined") && (typeof user_id !== undefined)) {
					localStorage.user_id = user_id;
					return user_id;
				}
			}
		}
		
		return false;
	};
	
	/**
	 * Dependiendo de la página que se esté visualizando se envian unos datos u otros 
	 * a la herramienta de Analítica Web de AT-Internet.
	 */
	var tagThisPage = (function() {
		// Iniciamos el objeto y el envío de datos al proveedor de Analítica web.
		current_url = initURLObject.getInstance();
		var tag = initATInternetTag.getInstance();
		
		var pageData = {};
		var customVars = {};
		var tagsData = {};
		var id_usuario = getUserId();
		
		if(current_url.home) {
			pageData = {name: 'homepage', chapter1: 'download', level2: level2}
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			if(id_usuario !== false) {
				tag.identifiedVisitor.set({id: id_usuario});
			}
			tag.dispatch();
			
			debugData({action : 'Tagging Homepage', pageData : pageData, customVars : customVars});
		} else if(current_url.login) {
			pageData = {name: 'login', chapter1: 'download', level2: level2};
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			tag.dispatch();
			
			debugData({action : 'Tagging Login page', pageData : pageData, customVars : customVars});
		} else if(current_url.video) {
			var programTitle = getProgramTitle();
			
			if(programTitle != "") {
				pageData = {name: 'download', chapter1: 'download', chapter2 : 'programme_details', chapter3 : programTitle, level2: level2};
				customVars = {site: getVariablesSitioPersonalizadas()};
				
				tag.page.set(pageData);
				tag.customVars.set(customVars);
				if(id_usuario !== false) {
					tag.identifiedVisitor.set({id: id_usuario});
				}
				
				// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
				if($('#tags-list').length > 0) {
					var lista_de_tags = $('#tags-list').attr('data-tags');
					if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
						var lista_de_tags_split = lista_de_tags.split('|');
						if(lista_de_tags_split.length > 0) {
							tagsData = {keywords: lista_de_tags_split};
							tag.tags.set(tagsData);
						}
					}
				}
				tag.dispatch();
				
				var data = {action : 'Tagging Product page', pageData : pageData, customVars : customVars};
				if(!$.isEmptyObject(tagsData)) {
					data.tags = tagsData;
				}
				debugData(data);
			}
		}
		
		initURLObject.setCurrentPageData();
	})();
	
	/**
	 * Al clicar sobre el botón descargar solo subtitulos o de descarga de un video, 
	 * notificamos a la herramienta de analitica los detalles de la descarga.
	 */
	var sendDownloadOKPageEvent = function(self) {
		pageData = {name: "download_OK", chapter1: 'download', chapter2 : 'programme_details', level2: level2};
		
		var downloadType = 'original';
		if(self) {
			if($(self).hasClass('ati-download-translated') && typeof $(self).hasClass('ati-download-translated') !== "undefined") {
				downloadType = 'translated';
			}
			if($(self).hasClass('ati-download-original') && typeof $(self).hasClass('ati-download-original') !== "undefined") {
				downloadType = 'original';
			}
			if($(self).hasClass('ati-download-subtitles') && typeof $(self).hasClass('ati-download-subtitles') !== "undefined") {
				downloadType = 'subtitles';
			}
		}
		customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaDownload(downloadType)
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		
		var id_usuario = getUserId();
		if(id_usuario !== false) {
			tag.identifiedVisitor.set({id: id_usuario});
		}
		
		// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
		if($('#tags-list').length > 0) {
			var lista_de_tags = $('#tags-list').attr('data-tags');
			if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
				var lista_de_tags_split = lista_de_tags.split('|');
				if(lista_de_tags_split.length > 0) {
					tagsData = {keywords: lista_de_tags_split};
					tag.tags.set(tagsData);
					
					debugData({action : 'Tagging Download OK page', pageData : pageData, customVars : customVars, tagsData : tagsData});
				}
			} else {
				debugData({action : 'Tagging Download OK page', pageData : pageData, customVars : customVars});	
			}
		} else {
			debugData({action : 'Tagging Download OK page', pageData : pageData, customVars : customVars});
		}
		
		tag.dispatch();
	};
	
	/**
	 * Al clickar en el botón de Request, notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	var sendRequestOKPageEvent = function() {
		pageData = {name: "request_OK", chapter1: 'download', chapter2 : 'programme_details', level2: level2};
		customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaRequest()
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		
		var id_usuario = getUserId();
		if(id_usuario !== false) {
			tag.identifiedVisitor.set({id: id_usuario});
		}
		
		// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
		if($('#tags-list').length > 0) {
			var lista_de_tags = $('#tags-list').attr('data-tags');
			if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
				var lista_de_tags_split = lista_de_tags.split('|');
				if(lista_de_tags_split.length > 0) {
					tagsData = {keywords: lista_de_tags_split};
					tag.tags.set(tagsData);
					
					debugData({action : 'Tagging Request OK page', pageData : pageData, customVars : customVars, tagsData : tagsData});
				}
			} else {
				debugData({action : 'Tagging Request OK page', pageData : pageData, customVars : customVars});
			}
		} else {
			debugData({action : 'Tagging Request OK page', pageData : pageData, customVars : customVars});
		}
		
		tag.dispatch();
	};
	
	/**
	 * Al clickar en el botón de Request del Tab Bulk Download, notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	var sendRequestOKBulkDownloadPageEvent = function() {
		pageData = {name: "bulk_download_OK", chapter1: 'download', chapter2 : 'programme_details', level2: level2};
		customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaBulkDownload()
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		
		var id_usuario = getUserId();
		if(id_usuario !== false) {
			tag.identifiedVisitor.set({id: id_usuario});
		}
		
		// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
		if($('#tags-list').length > 0) {
			var lista_de_tags = $('#tags-list').attr('data-tags');
			if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
				var lista_de_tags_split = lista_de_tags.split('|');
				if(lista_de_tags_split.length > 0) {
					tagsData = {keywords: lista_de_tags_split};
					tag.tags.set(tagsData);
					
					debugData({action : 'Tagging Request Bulk Donwload OK page', pageData : pageData, customVars : customVars, tagsData : tagsData});
				}
			} else {
				debugData({action : 'Tagging Request Bulk Donwload OK page', pageData : pageData, customVars : customVars});
			}
		} else {
			debugData({action : 'Tagging Request Bulk Donwload OK page', pageData : pageData, customVars : customVars});
		}
		
		tag.dispatch();
	};
	
	/**
	 * Al clickar en el botón de Copy Embed, notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	var sendEmbedOKPageEvent = function() {
		pageData = {name: "embed_OK", chapter1: 'download', chapter2 : 'programme_details', level2: level2};
		customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaEmbed()
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		
		var id_usuario = getUserId();
		if(id_usuario !== false) {
			tag.identifiedVisitor.set({id: id_usuario});
		}
		
		// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
		if($('#tags-list').length > 0) {
			var lista_de_tags = $('#tags-list').attr('data-tags');
			if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
				var lista_de_tags_split = lista_de_tags.split('|');
				if(lista_de_tags_split.length > 0) {
					tagsData = {keywords: lista_de_tags_split};
					tag.tags.set(tagsData);
					
					debugData({action : 'Tagging Embed OK page', pageData : pageData, customVars : customVars, tagsData : tagsData});
				}
			} else {
				debugData({action : 'Tagging Embed OK page', pageData : pageData, customVars : customVars});
			}
		} else {
			debugData({action : 'Tagging Embed OK page', pageData : pageData, customVars : customVars});
		}

		tag.dispatch();
	};
	
	/**
	 * Envía un evento de click a la herramienta de AT-Internet segun los datos recibidos por parámetro
	 */
	var sendClickEvent = function(data) {
		var clickData = {
	        elem: data.elem,
	        name: data.name,
	        level2: level2,
	        type: data.type
	    };
		
		if(typeof data.chapter1 !== "undefined" && data.chapter1 != "") {
			clickData.chapter1 = data.chapter1;
		}
		if(typeof data.chapter2 !== "undefined" && data.chapter2 != "") {
			clickData.chapter2 = data.chapter2;
		}
		if(typeof data.chapter3 !== "undefined" && data.chapter3 != "") {
			clickData.chapter3 = data.chapter3;
		}
		
		var tag = initATInternetTag.getInstance();
		tag.clickListener.send(clickData);
		
		debugData({action : data.action, clickData : clickData});
	};
	
	/**
	 * Al cerrar la ventana/navegador, vaciamos el local storage si hace más de una hora que se guardó..
	 * En local storage guardamos datos referentes al chapter1 y pagename de la página anterior que visitó el usuario.
	 * @FIXME Importante hacer uso de navegadores modernos que soporten el uso de Local Storage.
	 */ 
	$(window).unload(function() {
		if(typeof(Storage) !== "undefined") {
			if(typeof localStorage.current_time !== "undefined") {
				var timestamp = parseInt(localStorage.current_time, 10);
				if((Math.floor(Date.now() / 1000)) >= timestamp + 3600) {
					localStorage.removeItem("previous_chapter_download");
					localStorage.removeItem("previous_page_download");
					localStorage.removeItem("current_time_download");
					localStorage.removeItem("user_id");
				}
			}
		}
	});
	
	/**
	 * BUSCADOR
	 * 
	 * Evento personalizado que envía de nuevo los datos de la home de deownload
	 * cuando el usuario realiza una búsqueda.
	 */ 
	$(document).on("click", "button#_downloadlist_WAR_europarltv_download_list_\\:j_idt6\\:j_idt34", function() {
		var pageData = {name: 'homepage', chapter1: 'download', level2: level2}
		var customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaBusqueda()
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		tag.dispatch();
		
		debugData({action : 'Tagging Homepage - Search Request', pageData : pageData, customVars : customVars});
	});
	
	/**
	 * Al cambiar de Tab en la página de producto enviamos eventos de página vista segun el 
	 * plan de marcado. 
	 */
	$(document).on("click", 'div.col-download ul.nav.nav-tabs li', function() {
		if($(this).hasClass('active')) {
			var programTitle = getProgramTitle();
			var tag = initATInternetTag.getInstance();

			if(programTitle != "") {
				var tab_link = $('a', this);
				if(tab_link !== "undefined") {
					if(tab_link.html() !== "undefined" && tab_link.html() != "") {
						var current_tab = tab_link.html().toLowerCase().replace(' ', '_');
						
						pageData = {name: current_tab, chapter1: 'download', chapter2 : 'programme_details', chapter3 : programTitle, level2: level2};
						customVars = {site: getVariablesSitioPersonalizadas()};
						
						tag.page.set(pageData);
						tag.customVars.set(customVars);
						
						var id_usuario = getUserId();
						if(id_usuario !== false) {
							tag.identifiedVisitor.set({id: id_usuario});
						}
						
						// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
						if($('#tags-list').length > 0) {
							var lista_de_tags = $('#tags-list').attr('data-tags');
							if(lista_de_tags !== undefined && lista_de_tags !== "undefined") {
								var lista_de_tags_split = lista_de_tags.split('|');
								if(lista_de_tags_split.length > 0) {
									tagsData = {keywords: lista_de_tags_split};
									tag.tags.set(tagsData);
									
									debugData({action : 'Tagging Product page', pageData : pageData, customVars : customVars, tagsData : tagsData});
								}
							} else {
								debugData({action : 'Tagging Product page', pageData : pageData, customVars : customVars});
							}
						} else {
							debugData({action : 'Tagging Product page', pageData : pageData, customVars : customVars});
						}
						
						tag.dispatch();
					}
				}
			}
		}
	});
	
	/**
	 * Al clicar sobre el botón descargar solo subtitulos de un video notificamos a la herramienta de analitica 
	 * los detalles de página vista y evento de click.
	 */
	$(document).on("click", 'button.ati-download-subtitle', function() {
		sendDownloadOKPageEvent(this);
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			if($('#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:downloadLangCode').length > 0) {
				var language = $('#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:downloadLangCode').val();
				sendClickEvent({elem: $(this).get(0), name: language, chapter1: 'download', chapter2 : programTitle, chapter3 : 'download_only_subtitles', type: 'download', action : '[Click] on Download Subtitles'});
			}
		}
	});
	
	/**
	 * Al clicar sobre el enlace de descarga de un video notificamos a la herramienta de analitica 
	 * los detalles de página vista y evento de click.
	 */
	$(document).on("click", 'div#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:detailTabDownload a', function() {
		sendDownloadOKPageEvent(this);
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			if($('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectLanguage_input').length > 0) {
				var fileName = $(this).parent().text().replace('Download', '').replace(/\s*$/,"");
				sendClickEvent({elem: $(this).get(0), name: fileName, chapter1: 'download', chapter2 : programTitle, chapter3 : 'download_file', type: 'download', action : '[Click] on Download File'});
			}
		}
	});
	
	/**
	 * Al clicar en el botón de Request, notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	$(document).on("click", "button.ati-request-video[disabled!='disabled']", function() {
		sendRequestOKPageEvent();
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			sendClickEvent({elem: $(this).get(0), name: 'request', chapter1: 'download', chapter2 : programTitle, type: 'download', action : '[Click] on Request'});
		}
	});
	
	/**
	 * Al clicar en el botón de Request, de Bulk download notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	$(document).on("click", "button.ati-request-bulk[disabled!='disabled']", function() {
		sendRequestOKBulkDownloadPageEvent();
	});
	
	/**
	 * Al clicar en el botón de copy embed, notificamos a la herramienta de analitica los detalles seleccionados por el usuario.
	 */
	$(document).on("click", "span#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:embedLabelDetail input", function() {
		sendEmbedOKPageEvent();
		
		var programTitle = getProgramTitle();
		if(programTitle != "") {
			// Recuperamos el idoma seleccionado por el usuario...
			if($('select#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:selectLang_input').length > 0) {
				if($('#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:embeddedLangCode').length > 0) {
					var language = $('#_downloaddetail_WAR_europarltv_download_detail_\\:j_idt4\\:embeddedLangCode').val();
					var id = $(this).attr('id');
					
					if(id == "_downloaddetail_WAR_europarltv_download_detail_:j_idt4:j_idt174") {
						// Copy embed with subtitles
						sendClickEvent({elem: $(this).get(0), name: language, chapter1: 'download', chapter2 : programTitle, chapter3 : 'embed_subtitles', type: 'download', action : '[Click] on Copy Embed with subtitles'});
					} else if(id == "_downloaddetail_WAR_europarltv_download_detail_:j_idt4:j_idt180") {
						// Copy embed with voice over
						sendClickEvent({elem: $(this).get(0), name: language, chapter1: 'download', chapter2 : programTitle, chapter3 : 'embed_voice_over', type: 'download', action : '[Click] on Copy Embed with voice over'});
					}
				}
			}
		}
	});

	/**
	 * CLICKS
	 * Cuando se clica el link de Download Thumbnail, hay que enviar un evento de click a AT-INTERNET.
	 */
	$(document).on("click", 'button.ati-download-thumb', function(e) {
		var programTitle = getProgramTitle();

		if(programTitle != "") {
			sendClickEvent({elem: $(this).get(0), name: 'download_thumbnail', chapter1: 'download', chapter2 : programTitle, type: 'download', action : '[Click] on Download Thumbnail'});
		}
	});
	
	/** 
	 * JUST FOR DEBBUGING
	 * Muestra los datos de la página actual y a las variables de página y chapter anterior
	 * guardados en localStorage que se enviarán a la herramienta de analítica web. 
	 */
	var var_dump = (function() {
		if(debugEnabled) {
			var current_url = initURLObject.getInstance();
			
			if($('pre#var_dump').length > 0) {
				var html = "<ol>";
				$.each(current_url, function(prop, val) {
					if(val == true) {
						html += "<li style=\"color:green; font-weight: bolder; font-size: 18px;\"><strong>" + prop + "</strong> : " + val + "</li>";
					} else {
						html += "<li><strong>" + prop + "</strong> : " + val + "</li>";
					}
				});
				html += "</ol>";
				$('pre#var_dump').html(html);
			}
			if($('span#pagename').length > 0) {
				$('span#pagename').html(current_url.url_path.slice(current_url.url_path.length - 1, current_url.url_path.length));
			}
		}
	})();
});