/**
 * Script que envía los datos de la analítica web al proveedor de AT-Internet. 
 * 
 * @author Jonatan Jumbert
 * @contact hola@jonatanjumbert.com - http://jonatanjumbert.com 
 */
$(function() {
	var current_url = null;
	var url_segments = null;
	var tag = null;
	var siteID = null;
	var level2 = null;
	var lang = "es";
	var sendData = false;
	
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
	 * 	- Tag que no existe: $('.ui-messages-error')
	 *  - Category que no existe: $('.ui-messages-error')
	 *  - Video que no existe:  $('.portlet-msg-error')
	 */
	var checkErrorPage = function() {
		if($('div#website.page-not-found').length > 0) {
			return true;
		} else if($('.ui-messages-error').length > 0) {
			return true;
		} else if($('.portlet-msg-error').length > 0) {
			return true;
		} else {
			return false;
		}
	};
	
	/**
	 * Objeto que contiene los datos de los segmentos de la URL actual, idioma y determina que tipo de página estamos visitando.
	 */ 
	var initURLObject = (function() {
		var instance;
		
		function createInstance() {
			var is_error_page = checkErrorPage();
			
			return {
				'url_path' : url_segments,
				'previous_page' : (typeof(Storage) !== "undefined" && localStorage.previous_page != "") ? localStorage.previous_page : "",
				'previous_chapter' : (typeof(Storage) !== "undefined" && localStorage.previous_chapter != "") ? localStorage.previous_chapter : "",
				'lang' : lang,
				'home' : checkHomePage(),
				'category' : (!is_error_page && url_segments.indexOf("category") > -1 ) ? true : false,
				'tag' : (!is_error_page && url_segments.indexOf("tag") > -1 ) ? true : false,
				'search' : (url_segments.indexOf("search") === -1 ) ? false : true,
				'error' : is_error_page,
				'video' : (!is_error_page && url_segments.indexOf("programme") > -1 ) ? true : false,
				'about_us' : checkAboutUsPage()
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
			level2 = (typeof level2Id !== "undefined") ? level2Id : 1;
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
	 * Dependiendo de en qué página nos encontremos. En el plan de marcaje se han definido variables 
	 * personalizadas que hay que enviar a la herramienta de analítica.
	 */
	var getVariablesPaginaPersonalizadas = function() {
		var current_url = initURLObject.getInstance();
		
		if(current_url.error) {
			var variablesPaginaPersonalizadas = {
				1 : '404',
				2 : (typeof(Storage) !== "undefined" && localStorage.previous_page != "") ? '[' + localStorage.previous_page + ']' : '',
				3 : '[' + window.location.href + ']'
			};
		} else if(current_url.search) {
			var variablesPaginaPersonalizadas = {};
		}
		
		return (typeof variablesPaginaPersonalizadas !== "undefined") ? variablesPaginaPersonalizadas : null;
	};
	
	/*
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
	
	// Iniciamos el objeto y el envío de datos al proveedor de Analítica web.
	current_url = initURLObject.getInstance();
	initURLObject.setCurrentPageData();
	tag = initATInternetTag.getInstance();
	
	// Dependiendo de la página que se esté visualizando se envian unos datos u otros.
	if(current_url.home) {
		tag.page.set({name: 'homepage', chapter1: 'hompage', level2: level2});
		sendData = true;
	} else if(current_url.category) {
		if(typeof current_url.url_path[2] !== "undefined") {
			tag.page.set({name: current_url.url_path[2], chapter1: 'categories', level2: level2});
			sendData = true;
		}
	} else if(current_url.tag) {
		if(typeof current_url.url_path[2] !== "undefined") {
			tag.page.set({name: current_url.url_path[2], chapter1: 'tags', level2: level2});
			sendData = true;
		}
	} else if(current_url.search) {
		// TODO
		getVariablesPaginaPersonalizadas();
	} else if(current_url.error) {
		// TODO
	} else if(current_url.video) {
		if(typeof current_url.url_path[3] !== "undefined") {
			tag.page.set({name: current_url.url_path[3], chapter1: 'product_page', chapter2 : current_url.url_path[2], level2: level2});
			sendData = true;
		}
	} else if(current_url.about_us) {
		// TODO
	}
	
	if(sendData) {
		tag.customVars.set({site: getVariablesSitioPersonalizadas()});
		tag.dispatch();
	}
	
	/********** JUST FOR DEBBUGING ****************/
	var var_dump = (function() {
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
			$('span#pagename').html(current_url.url_path.pop());
		}
	})();
});