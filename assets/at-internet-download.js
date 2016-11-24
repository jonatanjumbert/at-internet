/**
 * Script que envía los datos de la analítica web al proveedor de AT-Internet. 
 * 
 * @author Jonatan Jumbert
 * @contact hola@jonatanjumbert.com - http://jonatanjumbert.com 
 */

/*
 * Variables globales de la configuración AT-Internet
 * y de los datos de la propia página para poder utilizar desde el callback del player.
 */ 
var tag = null;
var current_url = null;
var debugData = null;
var level2 = null;
var producer = "";

$(function() {
	var url_segments = null;
	var siteID = null;
	var lang = "es";
	var debugEnabled = true;
	
	/**
	 * Si estamos en modoDebug simulamos la variable de Liferay que nos da el ID del usuario actual.
	 */
	if(debugEnabled) {
		var Liferay = {
			ThemeDisplay : {
				getUserId : function() {
					return "4871";
				}	
			}	
		};
	}
	
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
				'previous_page' : (typeof(Storage) !== "undefined" && localStorage.previous_page != "") ? localStorage.previous_page : "",
				'previous_chapter' : (typeof(Storage) !== "undefined" && localStorage.previous_chapter != "") ? localStorage.previous_chapter : "",
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
						localStorage.previous_chapter = "download";
						localStorage.previous_page = "hompage";
					} else if(current_url.login) {
						localStorage.previous_chapter = "download";
						localStorage.previous_page = "login";
					} else if(current_url.video) {
						if($('div.col-download ul.nav.nav-tabs li.active').length > 0) {
							var text = $('a', $('div.col-download ul.nav.nav-tabs li.active')).html();
							var active_tab = (text !== "undefined" && text != "") ? text.toLowerCase() : "download";

							localStorage.previous_chapter = "download";
							localStorage.previous_page = active_tab;
						}
					}
					localStorage.current_time = Math.floor(Date.now() / 1000);
				}
			}
	    };
	})();

	/**
	 * Se inicializa el objeto de AT-Internet con los datos que hacen referencia al site y al level2 en el código fuente de la página.
	 * @FIXME Importante que Balidea, ponga esos datos en el código fuente de todas las páginas dependiendo del Entorno (DEV/PRE/PRO).
	 */
	var initATInternetTag = (function() {
		var instance;
		
		function createInstance() {
			siteID = (typeof site_id !== "undefined") ? site_id : 573738;
			level2 = (typeof level2Id !== "undefined") ? level2Id : 2;
			return new ATInternet.Tracker.Tag({log: "logc407", logSSL: "logs1407", secure: false, site: siteID, domain: "xiti.com"});
		}
		
		return {
			getInstance: function() {
				if(!instance) {
					instance = createInstance();
				}
				return instance;
			}
	    };
	})();
	
	/**
	 * Recupera las variables del sitio personalizadas.
	 * @FIXME Importante que Balidea implemente una etiqueta #tags-list con data-tags para poder recuperar correctamente los tags de la página si los hubiera.
	 */
	var getVariablesSitioPersonalizadas = function() {
		var variablesSitioPersonalizadas = {
			1 : lang.toUpperCase()
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
	 * XXX FIXME TODO Revisar si en el site de download, los IDS corresponden exactamente igual que en el site normal.
	 * 
	 * Si estamos en la página de búsqueda, según el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaBusqueda = function() {
		var result = {};
		
		if($('form#_search_WAR_europarltv_search_\\:formSearch').length > 0) {
			$('form#_search_WAR_europarltv_search_\\:formSearch').children('input').each(function () {
				if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:inputTextSearchBy") {
					result[1] = "[" + this.value + "]";
				} else if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:calendarFrom_input") {
					var current_value = this.value;
					var current_value_split = current_value.split('/');
					if(current_value_split.length == 3) {
						var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
						result[2] = "[" + send_value + "]";
					}
				} else if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:calendarTo_input") {
					var current_value = this.value;
					var current_value_split = current_value.split('/');
					if(current_value_split.length == 3) {
						var send_value = parseInt("" + current_value_split[2] + current_value_split[1] + current_value_split[0], 10);
						result[3] = "[" + send_value + "]";
					}
				} else if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:types_focus") {
					result[4] = "[" + this.value + "]";
				} else if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:category_focus") {
					result[5] = "[" + this.value + "]";
				} else if($(this).attr('id') == "_search_WAR_europarltv_search_:formSearch:meps_hinput") {
					var current_value = this.value;
					var send_value = "[";
					
					if($.isArray(current_value)) {
						$.each(current_value, function(i, val) {
							send_value += val;
							if(i + 1 < current_value.length) {
								send_value += "|";
							}
						});
					} else {
						var current_value_split = current_value.split(',');
						if(current_value_split.length > 0) {
							$.each(current_value_split, function(i, val) {
								send_value += val;
								if(i + 1 < current_value_split.length) {
									send_value += "|";
								}
							});
						}
					}
					send_value += "]";
					
					if(send_value != "[]") {
						result[6] = "[" + send_value + "]";
					}
				}
			});
		}
		
		return result;
	};
	
	/**
	 * Dependiendo de la página que se esté visualizando se envian unos datos u otros 
	 * a la herramienta de Analítica Web de AT-Internet.
	 */
	var tagThisPage = (function() {
		// Iniciamos el objeto y el envío de datos al proveedor de Analítica web.
		current_url = initURLObject.getInstance();
		initURLObject.setCurrentPageData();
		tag = initATInternetTag.getInstance();
		
		var pageData = {};
		var customVars = {};
		var tagsData = {};
		
		if(current_url.home) {
			pageData = {name: 'homepage', chapter1: 'download', level2: level2}
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			tag.identifiedVisitor.set({id: Liferay.ThemeDisplay.getUserId()});
			tag.dispatch();
			
			debugData({action : 'Tagging Homepage', pageData : pageData, customVars : customVars});
		} else if(current_url.login) {
			pageData = {name: 'login', chapter1: 'download', level2: level2};
			customVars = {site: getVariablesSitioPersonalizadas()};
			
			tag.page.set(pageData);
			tag.customVars.set(customVars);
			tag.identifiedVisitor.set({id: Liferay.ThemeDisplay.getUserId()});
			tag.dispatch();
			
			debugData({action : 'Tagging Login page', pageData : pageData, customVars : customVars});
		} else if(current_url.video) {
			var programTitle = ($('h1.regular-text').length > 0) ? $('h1.regular-text').attr('data-slug') : "";
			
			if(programTitle !== "undefined" && programTitle != "") {
				pageData = {name: 'download', chapter1: 'download', chapter2 : 'programme_details', chapter3 : programTitle, level2: level2};
				customVars = {site: getVariablesSitioPersonalizadas()};
				
				tag.page.set(pageData);
				tag.customVars.set(customVars);
				tag.identifiedVisitor.set({id: Liferay.ThemeDisplay.getUserId()});
				
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
				
				debugData({action : 'Tagging Product page', pageData : pageData, customVars : customVars, tagsData : tagsData});
			}
		}
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
				}
			}
		}
	});
	
	/**
	 * BUSCADOR
	 * 
	 * Evento personalizado que envía de nuevo los datos del buscador cuando se produce una petición AJAX.
	 */ 
	$(document).on("change", "#_search_WAR_europarltv_search_\\:formSearch\\:inputTextSearchBy," +
		"#_search_WAR_europarltv_search_\\:formSearch\\:calendarFrom_input, " +
		"#_search_WAR_europarltv_search_\\:formSearch\\:calendarTo_input, " +
		"#_search_WAR_europarltv_search_\\:formSearch\\:types_focus," +
		"#_search_WAR_europarltv_search_\\:formSearch\\:category_focus," +
		"#_search_WAR_europarltv_search_\\:formSearch\\:meps_hinput", function() {
		
		var pageData = {name: 'search_results', level2: level2};
		var customVars = {
			site : getVariablesSitioPersonalizadas(),
			page : getVariablesPaginaBusqueda()
		};
		
		tag = initATInternetTag.getInstance();
		tag.page.set(pageData);
		tag.customVars.set(customVars);
		tag.dispatch();
		
		debugData({action : '[Search] Search AJAX Request', pageData : pageData, customVars : customVars});
	});
	
	/**
	 * BUSCADOR
	 * 
	 * Al clicar al botón para mostrar la siguiente página de resultados,
	 * indicamos a la herramienta de Analítica web, la keyword y la página de resultados mostrada.
	 */ 
	$(document).on("click", 'div#p_p_id_search_WAR_europarltv_search_ div.load-more a', function() {
		var pageData = {name: 'search_results', level2: level2};
		
		tag = initATInternetTag.getInstance();
		tag.page.set(pageData); 
		tag.dispatch();
		
		debugData({action : '[Search] Click on Load More results button', pageData : pageData});
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando se clica un TAG, hay que enviar un evento de click a AT-INTERNET.
	 * Ya sea en la página de tags o en la de producto.
	 */
	$(document).on("click", 'ul.tags-list a', function(e) {
		var current_url = initURLObject.getInstance();
		var clickData = {
	        elem: $(this).get(0),
	        name: getLastSegmentFromURL(window.location.href),
	        chapter1: 'tags',
	        chapter2: getLastSegmentFromURL($(this).attr('href')),
	        chapter3: (current_url.tag) ? 'tags_page' : 'product_page',
	        level2: level2,
	        type: 'action'
	    };
		
		tag = initATInternetTag.getInstance();
		tag.clickListener.send(clickData);
		
		debugData({action : '[Click] on Tag', clickData : clickData});
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando se clica un TAG, hay que enviar un evento de click a AT-INTERNET.
	 * Ya sea en la página de tags o en la de producto.
	 */
	$(document).on("click", 'ul.socialmedia-buttons a', function(e) {
		var current_url = initURLObject.getInstance();
		var clickData = {
	        elem: $(this).get(0),
	        name: $('span.ep_name', $(this)).html(),
	        chapter1: 'share_video',
	        chapter2 : (typeof current_url.url_path[3] !== "undefined") ? current_url.url_path[3] : '', 
	        level2: level2,
	        type: 'action'
	    };
		
		tag = initATInternetTag.getInstance();
		tag.clickListener.send(clickData);
		
		debugData({action : '[Click] on Share link (video)', clickData : clickData});
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
	        name: $('span.ep_name', $(this)).html(),
	        chapter1: 'share_page',
	        level2: level2,
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

		tag = initATInternetTag.getInstance();
		tag.clickListener.send(clickData);
		
		debugData({action : '[Click] on Share link (footer)', clickData : clickData});
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
		        level2: level2,
		        type: 'action'
		    };
		
			tag = initATInternetTag.getInstance();
			tag.clickListener.send(clickData);
			
			debugData({action : '[Click] on Exit Link', clickData : clickData});
		}
	});
	
	/**
	 * CLICKS
	 * 
	 * Cuando alguien selecciona el botón de enviar para suscribirse a la newsletter
	 * también debemos enviar una notificacion de click a AT-Internet.
	 */
	$(document).on("click", 'form.subscription-form > input[type=button]', function(e) {
		var clickData = {
	        elem: $(this).get(0),
	        name: 'newsletter_subscription',
	        level2: level2,
	        type: 'action'
	    };
	
		tag = initATInternetTag.getInstance();
		tag.clickListener.send(clickData);
		
		debugData({action : '[Click] on Newsletter Subscription', clickData : clickData});
	});
	
	if($('span.video-with-producer').length > 0) {
		var productor = $('span.video-with-producer').attr('data-producer');
		if(productor !== "undefined") {
			producer = productor;
		}
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