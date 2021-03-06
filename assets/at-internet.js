/**
 * Script que envía los datos de la analítica web al proveedor de AT-Internet. 
 * 
 * @author Jonatan Jumbert
 * @contact hola@jonatanjumbert.com - http://jonatanjumbert.com
 * @lastchange Se intercambia el orden de los parametros del mediaLabel enviados a AT-Internet por petición de Andread
 * @dayLastChange 06/07/2017 
 * @version 1.1.3
 */

/*
 * Variables globales de la configuración AT-Internet
 * y de los datos de la propia página para poder utilizar desde el callback del player.
 */ 
var current_url = null;
var debugData = null;
var level2 = null;
var jobCode = "";
var publicationDate = "";

/**
 * Se define la funcion de Callback del reproductor de Kaltura para poder enviar a
 * AT-Internet los datos de consumo de cada uno de los videos.
 */
window.kalturaCallbackATInternet = function(playerId) {
	var tag = new ATInternet.Tracker.Tag({log: "logc407", logSSL: "logs1407", secure: false, site: ((typeof site_id !== "undefined") ? site_id : 573738), domain: "xiti.com"});
	var kdp = document.getElementById(playerId);
	var mediaLabel = ((typeof current_url.url_path[2] !== "undefined") ? current_url.url_path[2] + "::" : "") + ((typeof publicationDate !== "undefined" && publicationDate != "") ? publicationDate + "::" : "") + ((typeof current_url.url_path[3] !== "undefined") ? current_url.url_path[3] + "(" + jobCode + ")" : "");

	// Evento que se lanza cuando el video se reproduce por primera vez
	kdp.kBind("firstPlay", function(data, id) {
		var datosMedia = {
			mediaType: 'video', 
			playerId: playerId,
			mediaLevel2: level2, 
			refreshDuration: '5', 
			mediaLabel: mediaLabel, 
			isEmbedded: false, 
			duration : parseInt(kdp.evaluate('{mediaProxy.entry.duration}'), 10),
			broadcastMode: 'clip'
		};
		
		tag.richMedia.add(datosMedia);
		debugData({action : '[MEDIA] data', datosMedia : datosMedia});
	});
	
	// Evento que se lanza cuando el video hace play.
	kdp.kBind("doPlay", function(data, id) {
		var mediaData = { 
			action: 'play', 
			playerId: playerId, 
			mediaLabel: mediaLabel
		};
		tag.richMedia.send(mediaData);
		debugData({action : '[MEDIA] doPlay', datosMedia : mediaData});
	});
	
	// Evento que se lanza cuando el video hace pause.
	kdp.kBind("doPause", function(data, id) {
		var mediaData = { 
			action: 'pause', 
			playerId: playerId, 
			mediaLabel: mediaLabel
		};
		tag.richMedia.send(mediaData);
		debugData({action : '[MEDIA] doPause', datosMedia : mediaData});
	});
	
	// Evento que se lanza cuando el video hace stop.
	kdp.kBind("doStop", function(data, id) {
		var mediaData = { 
			action: 'stop', 
			playerId: playerId, 
			mediaLabel: mediaLabel
		};
		tag.richMedia.send(mediaData);
		debugData({action : '[MEDIA] doStop', datosMedia : mediaData});
	});
	
	// Evento que se lanza cuando el video hace stop.
	kdp.kBind("doSeek", function(data, id) {
		var mediaData = { 
			action: 'move', 
			playerId: playerId, 
			mediaLabel: mediaLabel
		};
		tag.richMedia.send(mediaData);
		debugData({action : '[MEDIA] doSeek', datosMedia : mediaData});
	});
};

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
	 *  Recupera el idioma de la página actual.
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
		if(lang == "EN" && url_segments[0] !== "undefined" && url_segments[0] !== undefined && url_segments[0].toUpperCase() != "EN") {
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
	 * Comprueba si la página actual es la home page.
	 * Dado que puede serlo si incluye como segmento de la URL "Home" o si unicamente tiene un segmento con el Idioma actual.
	 */ 
	var checkHomePage = function() {
		if(url_segments.indexOf("home") === -1 ) {
			if(url_segments.length == 1) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	};
	
	/**
	 * Comprueba si la URL actual contiene alguno de los slugs que etiquetaremos en la herramienta de Analítica de AT-Internet
	 * como páginas "about_us" (chapter1).
	 */
	var checkAboutUsPage = function() {
		var about_us_slugs = ['about-us', 'partners', 'editorial-chart', 'contact-us'];
		for(var i = 0; i < about_us_slugs.length; i++) {
			if(url_segments.indexOf(about_us_slugs[i]) > -1) {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Comprueba si la página actual ha dado un código 404, para ello buscamos $('div#website.page-not-found')
	 * Aunque también puede tratarse de 
	 * 	- Tag / Category / Video que no existe: $('.ui-messages-error-summary')
	 */
	var checkErrorPage = function() {
		if($('div#website.page-not-found').length > 0) {
			return true;
		} else if($('.ui-messages-error-summary').length > 0) {
			return true;
		} else {
			return false;
		}
	};
	
	var checkGeneralCategoryURL = function(is_error_page) {
		if(!is_error_page && url_segments.indexOf("category") > -1 ) {
			if(url_segments.length == 2) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	};
	
	var checkGeneralTagURL = function(is_error_page) {
		if(!is_error_page && url_segments.indexOf("tag") > -1 ) {
			if(url_segments.length == 2) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	};
	
	var checkGeneralProgrammeURL = function(is_error_page) {
		if(!is_error_page && url_segments.indexOf("programme") > -1 ) {
			if(url_segments.length == 2) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	};
	
	/**
	 * Objeto que contiene los datos de los segmentos de la URL actual, idioma y determina que tipo de página estamos visitando.
	 */ 
	var initURLObject = (function() {
		var instance;
		
		function createInstance() {
			var is_error_page = checkErrorPage();
			var is_general_category = checkGeneralCategoryURL(is_error_page);
			var is_general_tag = checkGeneralTagURL(is_error_page);
			var is_general_programme = checkGeneralProgrammeURL(is_error_page);
			
			return {
				'url_path' : url_segments,
				'previous_page' : (typeof(Storage) !== "undefined" && localStorage.previous_page != "") ? localStorage.previous_page : "",
				'previous_chapter' : (typeof(Storage) !== "undefined" && localStorage.previous_chapter != "") ? localStorage.previous_chapter : "",
				'lang' : lang,
				'home' : checkHomePage(),
				'category' : (!is_error_page && !is_general_category && url_segments.indexOf("category") > -1 ) ? true : false,
				'tag' : (!is_error_page && !is_general_tag && url_segments.indexOf("tag") > -1 ) ? true : false,
				'search' : (url_segments.indexOf("search") === -1 ) ? false : true,
				'error' : is_error_page,
				'video' : (!is_error_page && !is_general_programme && url_segments.indexOf("programme") > -1 ) ? true : false,
				'about_us' : checkAboutUsPage(),
				'rss' : (!is_error_page && url_segments.indexOf("rss-feeds") > -1 ) ? true : false,
				'general_category' : is_general_category,
				'general_tag' : is_general_tag,
				'general_programme' : is_general_programme
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
						localStorage.previous_chapter = "hompage";
						localStorage.previous_page = "hompage";
					} else if(current_url.category) {
						localStorage.previous_chapter = "categories";
						localStorage.previous_page = (typeof current_url.url_path[2] !== "undefined") ? current_url.url_path[2] : "";
					} else if(current_url.tag) {
						localStorage.previous_chapter = "tags";
						localStorage.previous_page = (typeof current_url.url_path[2] !== "undefined") ? current_url.url_path[2] : "";
					} else if(current_url.search) {
						localStorage.previous_chapter = "";
						localStorage.previous_page = "search_results";
					} else if(current_url.error) {
						localStorage.previous_chapter = "";
						localStorage.previous_page = "error_page";
					} else if(current_url.video) {
						localStorage.previous_chapter = "product_page";
						localStorage.previous_page = (typeof current_url.url_path[3] !== "undefined") ? current_url.url_path[3] : "";
					} else if(current_url.about_us) {
						localStorage.previous_chapter = "about_us";
						localStorage.previous_page = (typeof current_url.url_path[2] !== "undefined") ? current_url.url_path[2] : "";
					} else if(current_url.general_category) {
						localStorage.previous_chapter = "categories";
						localStorage.previous_page = "categories";
					} else if(current_url.general_tag) {
						localStorage.previous_chapter = "tags";
						localStorage.previous_page = "tags";
					} else if(current_url.general_programme) {
						localStorage.previous_chapter = "";
						localStorage.previous_page = "programme";
					}
					
					localStorage.current_time = Math.floor(Date.now() / 1000);
					localStorage.previous_url = window.location.href;
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
				level2 = (typeof level2Id !== "undefined") ? level2Id : 1;
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
			if(tagsList !== "undefined" && tagsList != "") {
				variablesSitioPersonalizadas[2] = "[" + tagsList + "]";
			}
		}
		
		if(typeof(Storage) !== "undefined" && localStorage.previous_chapter != "") {
			variablesSitioPersonalizadas[3] = "[" + localStorage.previous_chapter + "]";
		}
		if(typeof(Storage) !== "undefined" && localStorage.previous_page != "") {
			variablesSitioPersonalizadas[4] = "[" + localStorage.previous_page + "]";
		}
		
		return variablesSitioPersonalizadas;
	};
	
	/**
	 * Si estamos en la página de búsqueda, según el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaBusqueda = function() {
		var result = {};
		
		if($('form#_search_WAR_europarltv_search_\\:formSearch').length > 0) {
			var searchBy = getParameterByName("text");
			if(searchBy != null && searchBy != "") {
				result[1] = searchBy;
			}
			
			var dateFrom = getParameterByName("pDateFrom");
			if(dateFrom != null && dateFrom != "") {
				var current_value_split = dateFrom.split('/');
				if(current_value_split.length == 3) {
					var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
					result[2] = "[" + send_value + "]";
				}
			}
			
			var dateTo = getParameterByName("pDateTo");
			if(dateTo != null && dateTo != "") {
				var current_value_split = dateTo.split('/');
				if(current_value_split.length == 3) {
					var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
					result[3] = "[" + send_value + "]";
				}
			}
			
			var programType = getParameterByName("pType");
			if(programType != null && programType != "") {
				result[4] = programType;
			}
			
			var category = getParameterByName("pCategory");
			if(category != null && category != "") {
				result[5] = category;
			}
			
			var meps = getParameterByName("meps");
			if(meps != null && meps != "") {
				result[6] = meps;
			}
		}
		
		return result;
	};
	
	/**
	 * Si estamos en la página de error, según el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaError = function() {
		return result = {
			1 : '404',
			2 : (typeof(Storage) !== "undefined" && localStorage.previous_url != "") ? '[' + localStorage.previous_url + ']' : '',
			3 : '[' + window.location.href + ']'
		};
	};
	
	var getPageData = function() {
		var current_url = initURLObject.getInstance();
		var pageData = {};
		
		if(current_url.home) {
			pageData = {name: 'homepage', chapter1: 'hompage', level2: level2}
		} else if(current_url.category) {
			if(typeof current_url.url_path[2] !== "undefined") {
				pageData = {name: current_url.url_path[2], chapter1: 'categories', level2: level2};
			}
		} else if(current_url.tag) {
			if(typeof current_url.url_path[2] !== "undefined") {
				pageData = {name: current_url.url_path[2], chapter1: 'tags', level2: level2};
			}
		} else if(current_url.search) {
			pageData = {name: 'search_results', level2: level2};
		} else if(current_url.error) {
			pageData = {name: 'error_page', level2: level2};
		} else if(current_url.video) {
			if(typeof current_url.url_path[3] !== "undefined") {
				pageData = {name: current_url.url_path[3], chapter1: 'product_page', chapter2 : current_url.url_path[2], level2: level2};
			}
		} else if(current_url.about_us) {
			pageData = {name: current_url.url_path[1], chapter1 : 'about_us', level2: level2};
		} else if(current_url.rss) {
			pageData = {name: 'RSS feed', level2: level2};
		} else if(current_url.general_category) {
			pageData = {name: 'categories', chapter1: 'categories', level2: level2};
		} else if(current_url.general_tag) {
			pageData = {name: 'tags', chapter1: 'tags', level2: level2};
		} else if(current_url.general_programme) {
			pageData = {name: 'programme', level2: level2};
		}
		
		return pageData;
	};
	
	/**
	 * Dependiendo de la página que se esté visualizando se envian unos datos u otros 
	 * a la herramienta de Analítica Web de AT-Internet.
	 */
	var tagThisPage = (function() {
		// Iniciamos el objeto y el envío de datos al proveedor de Analítica web.
		current_url = initURLObject.getInstance();
		var tag = initATInternetTag.getInstance();
		
		var pageData = getPageData();
		var customVars = {};
		var tagsData = {};
		var internalSearch = {};
		
		if(current_url.home) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			tag.dispatch();
			
			debugData({action : 'Tagging Homepage', pageData : pageData, customVars : customVars});
		} else if(current_url.category) {
			if(typeof current_url.url_path[2] !== "undefined") {
				customVars = {site: getVariablesSitioPersonalizadas()};
				
				tag.page.set(pageData);
				tag.customVars.set(customVars);
				tag.dispatch();
				
				debugData({action : 'Tagging Category page', pageData : pageData, customVars : customVars});
			}
		} else if(current_url.tag) {
			if(typeof current_url.url_path[2] !== "undefined") {
				customVars = {site: getVariablesSitioPersonalizadas()};
				
				tag.page.set(pageData);
				tag.customVars.set(customVars);
				
				// Segun el plan de marcaje hay que enviar los tags relacionados de las página de tag.
				if($('.tags-list').length > 0) {
					$('.tags-list').each(function(id, val) {
						var lista_de_tags = $(this).attr('data-tags');
						if(lista_de_tags !== "undefined") {
							var lista_de_tags_split = lista_de_tags.split('|');
							if(lista_de_tags_split.length > 0) {
								if(typeof tagsData.keywords === "undefined") {
									tagsData = {keywords: lista_de_tags_split};
								} else {
									for(var i = 0; i < lista_de_tags_split.length; i++) {
										if(tagsData.keywords.indexOf(lista_de_tags_split[i]) === -1 ) {
											tagsData.keywords.push(lista_de_tags_split[i]);
										}
									}
								}
							}
						}
					});
					
					if(typeof tagsData.keywords === "undefined") {
						tag.tags.set(tagsData);
					}
				}
				tag.dispatch();
				
				var data = {action : 'Tagging Tag page', pageData : pageData, customVars : customVars};
				if(!$.isEmptyObject(tagsData)) {
					data.tags = tagsData;
				}
				debugData(data);
			}
		} else if(current_url.search) {
			customVars = {
				site : getVariablesSitioPersonalizadas(),
				page : getVariablesPaginaBusqueda()
			};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			
			if($("#_search_WAR_europarltv_search_\\:formSearch\\:inputTextSearchBy").length > 0) {
				internalSearch = {
					keyword: $("#_search_WAR_europarltv_search_\\:formSearch\\:inputTextSearchBy").val(), 
					resultPageNumber: '1'
				};
				tag.internalSearch.set(internalSearch);
			}
			tag.dispatch();
			
			debugData({action : 'Tagging Search page', pageData : pageData, customVars : customVars, internalSearch : internalSearch});
		} else if(current_url.error) {
			customVars = {
				site : getVariablesSitioPersonalizadas(),
				page : getVariablesPaginaError()
			};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			tag.dispatch();
			
			debugData({action : 'Tagging Error page', pageData : pageData, customVars : customVars});
		} else if(current_url.video) {
			if(typeof current_url.url_path[3] !== "undefined") {
				customVars = {site: getVariablesSitioPersonalizadas()};
				
				tag.page.set(pageData);
				tag.customVars.set(customVars);
				
				// Segun el plan de marcaje hay que enviar los tags relacionados de las página de producto.
				if($('#tags-list').length > 0) {
					var lista_de_tags = $('#tags-list').attr('data-tags');
					if(lista_de_tags !== "undefined") {
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
		} else if(current_url.about_us) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set();
			tag.dispatch();
			
			debugData({action : 'Tagging About us page', pageData : pageData, customVars : customVars});
		} else if(current_url.rss) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set();
			tag.dispatch();
			
			debugData({action : 'Tagging RSS page', pageData : pageData, customVars : customVars});
		} else if(current_url.general_category) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set();
			tag.dispatch();
			
			debugData({action : 'Tagging General Category page', pageData : pageData, customVars : customVars});
		} else if(current_url.general_tag) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set();
			tag.dispatch();
			
			debugData({action : 'Tagging General Tag page', pageData : pageData, customVars : customVars});
		} else if(current_url.general_programme) {
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set();
			tag.dispatch();
			
			debugData({action : 'Tagging General Programme page', pageData : pageData, customVars : customVars});
		}
		
		initURLObject.setCurrentPageData();
	})();
	
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
					localStorage.removeItem("previous_chapter");
					localStorage.removeItem("previous_page");
					localStorage.removeItem("current_time");
					localStorage.removeItem("previous_url");
				}
			}
		}
	});
	
	/**
	 * BUSCADOR
	 * 
	 * Al clicar al botón para mostrar la siguiente página de resultados,
	 * indicamos a la herramienta de Analítica web, la keyword y la página de resultados mostrada.
	 */ 
	$(document).on("click", 'div#p_p_id_search_WAR_europarltv_search_ div.load-more a', function() {
		var pageData = {name: 'search_results', level2: level2};
		var internalSearchData = {
			keyword: $("#_search_WAR_europarltv_search_\\:formSearch\\:inputTextSearchBy").val(), 
			resultPageNumber: $('div#_search_WAR_europarltv_search_\\:formSearch\\:initialResultsPanel div.videos-list').length + 1
		};
		
		var tag = initATInternetTag.getInstance();
		tag.page.set(pageData); 
		tag.internalSearch.set(internalSearchData); 
		tag.dispatch();
		
		debugData({action : '[Search] Click on Load More results button', pageData : pageData, internalSearchData : internalSearchData});
	});
	
	/**
	 * BUSCADOR
	 * 
	 * Cuando se selecciona uno de los videos de la página de resultados de búsqueda, hay 
	 * que notificar la keyword buscada, la página de resultados y la posición del resultado clicado.
	 */
	$(document).on("click", 'div#p_p_id_search_WAR_europarltv_search_ h2.title a', function(e) {
		var pagina_resultados = $(this).parent().parent().parent().prevAll().length;
		var num_videos_delante = $(this).parent().parent().prevAll().length;
		var num_videos_pagina = $('div.video-item', $(this).parent().parent().parent()).length;
		
		internalSearchData = {
			elem : $(this).get(0),
		    keyword: $("#_search_WAR_europarltv_search_\\:formSearch\\:inputTextSearchBy").val(),
		    resultPageNumber: pagina_resultados + 1,
		    resultPosition: ((pagina_resultados == 0) ? (num_videos_delante + 1) : ((num_videos_pagina * pagina_resultados) + (num_videos_delante + 1)))
		};
		
		var tag = initATInternetTag.getInstance();
		tag.internalSearch.send(internalSearchData);
		
		debugData({action : '[Search] Click on Search Result', internalSearchData : internalSearchData});
	});
	
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
	 * CLICKS
	 * 
	 * Cuando se clica un TAG, hay que enviar un evento de click a AT-INTERNET.
	 * Ya sea en la página de tags o en la de producto.
	 */
	$(document).on("click", '.tags-list a', function(e) {
		var current_url = initURLObject.getInstance();
		sendClickEvent({
			elem: $(this).get(0), 
			name: getLastSegmentFromURL(window.location.href), 
			chapter1: 'tags', 
			chapter2 : getLastSegmentFromURL($(this).attr('href')), 
			chapter3 : ((current_url.tag) ? 'tags_page' : 'product_page'), 
			type: 'action', 
			action : '[Click] on Tag'
		});
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando se clica un TAG, hay que enviar un evento de click a AT-INTERNET.
	 * Ya sea en la página de tags o en la de producto.
	 */
	$(document).on("click", 'ul.socialmedia-buttons a', function(e) {
		var current_url = initURLObject.getInstance();
		sendClickEvent({
			elem: $(this).get(0),
	        name: $(this).text().trim(),
	        chapter1: 'share_video',
	        chapter2 : (typeof current_url.url_path[3] !== "undefined") ? current_url.url_path[3] : '', 
	        type: 'action',
	        action : '[Click] on Share link (video)'
		});
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando se clica un enlace de compartir en las redes sociales del pie de página
	 * hay que enviar un evento de click a AT-INTERNET.
	 */
	$(document).on("click", 'div#socialmedia div.ep_list ul li.ep_item a', function(e) {
		var current_url = initURLObject.getInstance();
		var clickData = {
	        elem: $(this).get(0),
	        name: $(this).text().trim(),
	        chapter1: 'share_page',
	        type: 'action'
	    };
		
		if(current_url.home) {
			clickData.chapter2 = 'homepage';
			clickData.chapter3 = 'homepage';
		} else if(current_url.category) {
			if(typeof current_url.url_path[2] !== "undefined") {
				clickData.chapter2 = 'categories';
				clickData.chapter3 = current_url.url_path[2];
			}
		} else if(current_url.tag) {
			if(typeof current_url.url_path[2] !== "undefined") {
				clickData.chapter2 = 'tags';
				clickData.chapter3 = current_url.url_path[2];
			}
		} else if(current_url.video) {
			if(typeof current_url.url_path[3] !== "undefined") {
				clickData.chapter2 = current_url.url_path[2];
				clickData.chapter3 = current_url.url_path[3];
			}
		} else if(current_url.about_us) {
			clickData.chapter2 = 'about_us';
			clickData.chapter3 = getLastSegmentFromURL(window.location.href);
		} else {
			clickData.chapter3 = getLastSegmentFromURL(window.location.href);
		}
		
		clickData.action = '[Click] on Share link (footer)';
		sendClickEvent(clickData);
	});
	
	/**
	 * CLICKS
	 * 
	 * Para todos los clicks se comprueba si el target es _blank para etiquetarlo
	 * como link de salida en la herramienta de Analítica web.
	 */
	$(document).on("click", 'a', function(e) {
		var link_target = $(this).attr('target');
		if(link_target !== "undefined" && link_target == "_blank") {
			var clickData = {
		        elem: $(this).get(0),
		        name: $(this).attr('href'),
		        chapter1: 'exit_link',
		        type: 'action',
		        action : '[Click] on Exit Link'
		    };
		
			sendClickEvent(clickData);
		}
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando alguien selecciona el botón de enviar para suscribirse a la newsletter
	 * también debemos enviar una notificacion de click a AT-Internet.
	 */
	$(document).on("click", 'form.subscription-form input.btn-success', function(e) {
		var pageData = getPageData();
		
		var clickData = {
	        elem: $(this).get(0),
	        name: "newsletter_subscription",
    		chapter1: (typeof pageData.name !== "undefined" && typeof pageData.name !== undefined) ? pageData.name : '',
	        type: 'action',
	        action : '[Click] on Newsletter Subscription'
	    };
		
		sendClickEvent(clickData);
	});
	
	if($('#ati-jobcode').length > 0) {
		jobCode = $('#ati-jobcode').html();
	}
	if($('#ati-publish_download_date').length > 0) {
		publicationDate = $('#ati-publish_download_date').html();
	}
	
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