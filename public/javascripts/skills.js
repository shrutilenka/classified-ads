/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/simple-lightbox/src/simpleLightbox.js":
/*!************************************************************!*\
  !*** ./node_modules/simple-lightbox/src/simpleLightbox.js ***!
  \************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {

    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}

}(this, function() {

    function assign(target) {

        for (var i = 1; i < arguments.length; i++) {

            var obj = arguments[i];

            if (obj) {
                for (var key in obj) {
                    obj.hasOwnProperty(key) && (target[key] = obj[key]);
                }
            }

        }

        return target;

    }

    function addClass(element, className) {

        if (element && className) {
            element.className += ' ' + className;
        }

    }

    function removeClass(element, className) {

        if (element && className) {
            element.className = element.className.replace(
                new RegExp('(\\s|^)' + className + '(\\s|$)'), ' '
            ).trim();
        }

    }

    function parseHtml(html) {

        var div = document.createElement('div');
        div.innerHTML = html.trim();

        return div.childNodes[0];

    }

    function matches(el, selector) {

        return (el.matches || el.matchesSelector || el.msMatchesSelector).call(el, selector);

    }

    function getWindowHeight() {

        return 'innerHeight' in window
            ? window.innerHeight
            : document.documentElement.offsetHeight;

    }

    function SimpleLightbox(options) {

        this.init.apply(this, arguments);

    }

    SimpleLightbox.defaults = {

        // add custom classes to lightbox elements
        elementClass: '',
        elementLoadingClass: 'slbLoading',
        htmlClass: 'slbActive',
        closeBtnClass: '',
        nextBtnClass: '',
        prevBtnClass: '',
        loadingTextClass: '',

        // customize / localize controls captions
        closeBtnCaption: 'Close',
        nextBtnCaption: 'Next',
        prevBtnCaption: 'Previous',
        loadingCaption: 'Loading...',

        bindToItems: true, // set click event handler to trigger lightbox on provided $items
        closeOnOverlayClick: true,
        closeOnEscapeKey: true,
        nextOnImageClick: true,
        showCaptions: true,

        captionAttribute: 'title', // choose data source for library to glean image caption from
        urlAttribute: 'href', // where to expect large image

        startAt: 0, // start gallery at custom index
        loadingTimeout: 100, // time after loading element will appear

        appendTarget: 'body', // append elsewhere if needed

        beforeSetContent: null, // convenient hooks for extending library behavoiur
        beforeClose: null,
        afterClose: null,
        beforeDestroy: null,
        afterDestroy: null,

        videoRegex: new RegExp(/youtube.com|vimeo.com/) // regex which tests load url for iframe content

    };

    assign(SimpleLightbox.prototype, {

        init: function(options) {

            options = this.options = assign({}, SimpleLightbox.defaults, options);

            var self = this;
            var elements;

            if (options.$items) {
                elements = options.$items.get();
            }

            if (options.elements) {
                elements = [].slice.call(
                    typeof options.elements === 'string'
                        ? document.querySelectorAll(options.elements)
                        : options.elements
                );
            }

            this.eventRegistry = {lightbox: [], thumbnails: []};
            this.items = [];
            this.captions = [];

            if (elements) {

                elements.forEach(function(element, index) {

                    self.items.push(element.getAttribute(options.urlAttribute));
                    self.captions.push(element.getAttribute(options.captionAttribute));

                    if (options.bindToItems) {

                        self.addEvent(element, 'click', function(e) {

                            e.preventDefault();
                            self.showPosition(index);

                        }, 'thumbnails');

                    }

                });

            }

            if (options.items) {
                this.items = options.items;
            }

            if (options.captions) {
                this.captions = options.captions;
            }

        },

        addEvent: function(element, eventName, callback, scope) {

            this.eventRegistry[scope || 'lightbox'].push({
                element: element,
                eventName: eventName,
                callback: callback
            });

            element.addEventListener(eventName, callback);

            return this;

        },

        removeEvents: function(scope) {

            this.eventRegistry[scope].forEach(function(item) {
                item.element.removeEventListener(item.eventName, item.callback);
            });

            this.eventRegistry[scope] = [];

            return this;

        },

        next: function() {

            return this.showPosition(this.currentPosition + 1);

        },

        prev: function() {

            return this.showPosition(this.currentPosition - 1);

        },

        normalizePosition: function(position) {

            if (position >= this.items.length) {
                position = 0;
            } else if (position < 0) {
                position = this.items.length - 1;
            }

            return position;

        },

        showPosition: function(position) {

            var newPosition = this.normalizePosition(position);

            if (typeof this.currentPosition !== 'undefined') {
                this.direction = newPosition > this.currentPosition ? 'next' : 'prev';
            }

            this.currentPosition = newPosition;

            return this.setupLightboxHtml()
                .prepareItem(this.currentPosition, this.setContent)
                .show();

        },

        loading: function(on) {

            var self = this;
            var options = this.options;

            if (on) {

                this.loadingTimeout = setTimeout(function() {

                    addClass(self.$el, options.elementLoadingClass);

                    self.$content.innerHTML =
                        '<p class="slbLoadingText ' + options.loadingTextClass + '">' +
                            options.loadingCaption +
                        '</p>';
                    self.show();

                }, options.loadingTimeout);

            } else {

                removeClass(this.$el, options.elementLoadingClass);
                clearTimeout(this.loadingTimeout);

            }

        },

        prepareItem: function(position, callback) {

            var self = this;
            var url = this.items[position];

            this.loading(true);

            if (this.options.videoRegex.test(url)) {

                callback.call(self, parseHtml(
                    '<div class="slbIframeCont"><iframe class="slbIframe" frameborder="0" allowfullscreen src="' + url + '"></iframe></div>')
                );

            } else {

                var $imageCont = parseHtml(
                    '<div class="slbImageWrap"><img class="slbImage" src="' + url + '" /></div>'
                );

                this.$currentImage = $imageCont.querySelector('.slbImage');

                if (this.options.showCaptions && this.captions[position]) {
                    $imageCont.appendChild(parseHtml(
                        '<div class="slbCaption">' + this.captions[position] + '</div>')
                    );
                }

                this.loadImage(url, function() {

                    self.setImageDimensions();

                    callback.call(self, $imageCont);

                    self.loadImage(self.items[self.normalizePosition(self.currentPosition + 1)]);

                });

            }

            return this;

        },

        loadImage: function(url, callback) {

            if (!this.options.videoRegex.test(url)) {

                var image = new Image();
                callback && (image.onload = callback);
                image.src = url;

            }

        },

        setupLightboxHtml: function() {

            var o = this.options;

            if (!this.$el) {

                this.$el = parseHtml(
                    '<div class="slbElement ' + o.elementClass + '">' +
                        '<div class="slbOverlay"></div>' +
                        '<div class="slbWrapOuter">' +
                            '<div class="slbWrap">' +
                                '<div class="slbContentOuter">' +
                                    '<div class="slbContent"></div>' +
                                    '<button type="button" title="' + o.closeBtnCaption + '" class="slbCloseBtn ' + o.closeBtnClass + '">×</button>' +
                                    (this.items.length > 1
                                        ? '<div class="slbArrows">' +
                                             '<button type="button" title="' + o.prevBtnCaption + '" class="prev slbArrow' + o.prevBtnClass + '">' + o.prevBtnCaption + '</button>' +
                                             '<button type="button" title="' + o.nextBtnCaption + '" class="next slbArrow' + o.nextBtnClass + '">' + o.nextBtnCaption + '</button>' +
                                          '</div>'
                                        : ''
                                    ) +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                this.$content = this.$el.querySelector('.slbContent');

            }

            this.$content.innerHTML = '';

            return this;

        },

        show: function() {

            if (!this.modalInDom) {

                document.querySelector(this.options.appendTarget).appendChild(this.$el);
                addClass(document.documentElement, this.options.htmlClass);
                this.setupLightboxEvents();
                this.modalInDom = true;

            }

            return this;

        },

        setContent: function(content) {

            var $content = typeof content === 'string'
                ? parseHtml(content)
                : content
            ;

            this.loading(false);

            this.setupLightboxHtml();

            removeClass(this.$content, 'slbDirectionNext');
            removeClass(this.$content, 'slbDirectionPrev');

            if (this.direction) {
                addClass(this.$content, this.direction === 'next'
                    ? 'slbDirectionNext'
                    : 'slbDirectionPrev'
                );
            }

            if (this.options.beforeSetContent) {
                this.options.beforeSetContent($content, this);
            }

            this.$content.appendChild($content);

            return this;

        },

        setImageDimensions: function() {

            if (this.$currentImage) {
                this.$currentImage.style.maxHeight = getWindowHeight() + 'px';
            }

        },

        setupLightboxEvents: function() {

            var self = this;

            if (this.eventRegistry.lightbox.length) {
                return this;
            }

            this.addEvent(this.$el, 'click', function(e) {

                var $target = e.target;

                if (matches($target, '.slbCloseBtn') || (self.options.closeOnOverlayClick && matches($target, '.slbWrap'))) {

                    self.close();

                } else if (matches($target, '.slbArrow')) {

                    matches($target, '.next') ? self.next() : self.prev();

                } else if (self.options.nextOnImageClick && self.items.length > 1 && matches($target, '.slbImage')) {

                    self.next();

                }

            }).addEvent(document, 'keyup', function(e) {

                self.options.closeOnEscapeKey && e.keyCode === 27 && self.close();

                if (self.items.length > 1) {
                    (e.keyCode === 39 || e.keyCode === 68) && self.next();
                    (e.keyCode === 37 || e.keyCode === 65) && self.prev();
                }

            }).addEvent(window, 'resize', function() {

                self.setImageDimensions();

            });

            return this;

        },

        close: function() {

            if (this.modalInDom) {

                this.runHook('beforeClose');
                this.removeEvents('lightbox');
                this.$el && this.$el.parentNode.removeChild(this.$el);
                removeClass(document.documentElement, this.options.htmlClass);
                this.modalInDom = false;
                this.runHook('afterClose');

            }

            this.direction = undefined;
            this.currentPosition = this.options.startAt;

        },

        destroy: function() {

            this.close();
            this.runHook('beforeDestroy');
            this.removeEvents('thumbnails');
            this.runHook('afterDestroy');

        },

        runHook: function(name) {

            this.options[name] && this.options[name](this);

        }

    });

    SimpleLightbox.open = function(options) {

        var instance = new SimpleLightbox(options);

        return options.content
            ? instance.setContent(options.content).show()
            : instance.showPosition(instance.options.startAt);

    };

    SimpleLightbox.registerAsJqueryPlugin = function($) {

        $.fn.simpleLightbox = function(options) {

            var lightboxInstance;
            var $items = this;

            return this.each(function() {
                if (!$.data(this, 'simpleLightbox')) {
                    lightboxInstance = lightboxInstance || new SimpleLightbox($.extend({}, options, {$items: $items}));
                    $.data(this, 'simpleLightbox', lightboxInstance);
                }
            });

        };

        $.SimpleLightbox = SimpleLightbox;

    };

    if (typeof window !== 'undefined' && window.jQuery) {
        SimpleLightbox.registerAsJqueryPlugin(window.jQuery);
    }

    return SimpleLightbox;

}));


/***/ }),

/***/ "./node_modules/svg-injector/svg-injector.js":
/*!***************************************************!*\
  !*** ./node_modules/svg-injector/svg-injector.js ***!
  \***************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * SVGInjector v1.1.3 - Fast, caching, dynamic inline SVG DOM injection library
 * https://github.com/iconic/SVGInjector
 *
 * Copyright (c) 2014-2015 Waybury <hello@waybury.com>
 * @license MIT
 */

(function (window, document) {

  'use strict';

  // Environment
  var isLocal = window.location.protocol === 'file:';
  var hasSvgSupport = document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');

  function uniqueClasses(list) {
    list = list.split(' ');

    var hash = {};
    var i = list.length;
    var out = [];

    while (i--) {
      if (!hash.hasOwnProperty(list[i])) {
        hash[list[i]] = 1;
        out.unshift(list[i]);
      }
    }

    return out.join(' ');
  }

  /**
   * cache (or polyfill for <= IE8) Array.forEach()
   * source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
   */
  var forEach = Array.prototype.forEach || function (fn, scope) {
    if (this === void 0 || this === null || typeof fn !== 'function') {
      throw new TypeError();
    }

    /* jshint bitwise: false */
    var i, len = this.length >>> 0;
    /* jshint bitwise: true */

    for (i = 0; i < len; ++i) {
      if (i in this) {
        fn.call(scope, this[i], i, this);
      }
    }
  };

  // SVG Cache
  var svgCache = {};

  var injectCount = 0;
  var injectedElements = [];

  // Request Queue
  var requestQueue = [];

  // Script running status
  var ranScripts = {};

  var cloneSvg = function (sourceSvg) {
    return sourceSvg.cloneNode(true);
  };

  var queueRequest = function (url, callback) {
    requestQueue[url] = requestQueue[url] || [];
    requestQueue[url].push(callback);
  };

  var processRequestQueue = function (url) {
    for (var i = 0, len = requestQueue[url].length; i < len; i++) {
      // Make these calls async so we avoid blocking the page/renderer
      /* jshint loopfunc: true */
      (function (index) {
        setTimeout(function () {
          requestQueue[url][index](cloneSvg(svgCache[url]));
        }, 0);
      })(i);
      /* jshint loopfunc: false */
    }
  };

  var loadSvg = function (url, callback) {
    if (svgCache[url] !== undefined) {
      if (svgCache[url] instanceof SVGSVGElement) {
        // We already have it in cache, so use it
        callback(cloneSvg(svgCache[url]));
      }
      else {
        // We don't have it in cache yet, but we are loading it, so queue this request
        queueRequest(url, callback);
      }
    }
    else {

      if (!window.XMLHttpRequest) {
        callback('Browser does not support XMLHttpRequest');
        return false;
      }

      // Seed the cache to indicate we are loading this URL already
      svgCache[url] = {};
      queueRequest(url, callback);

      var httpRequest = new XMLHttpRequest();

      httpRequest.onreadystatechange = function () {
        // readyState 4 = complete
        if (httpRequest.readyState === 4) {

          // Handle status
          if (httpRequest.status === 404 || httpRequest.responseXML === null) {
            callback('Unable to load SVG file: ' + url);

            if (isLocal) callback('Note: SVG injection ajax calls do not work locally without adjusting security setting in your browser. Or consider using a local webserver.');

            callback();
            return false;
          }

          // 200 success from server, or 0 when using file:// protocol locally
          if (httpRequest.status === 200 || (isLocal && httpRequest.status === 0)) {

            /* globals Document */
            if (httpRequest.responseXML instanceof Document) {
              // Cache it
              svgCache[url] = httpRequest.responseXML.documentElement;
            }
            /* globals -Document */

            // IE9 doesn't create a responseXML Document object from loaded SVG,
            // and throws a "DOM Exception: HIERARCHY_REQUEST_ERR (3)" error when injected.
            //
            // So, we'll just create our own manually via the DOMParser using
            // the the raw XML responseText.
            //
            // :NOTE: IE8 and older doesn't have DOMParser, but they can't do SVG either, so...
            else if (DOMParser && (DOMParser instanceof Function)) {
              var xmlDoc;
              try {
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(httpRequest.responseText, 'text/xml');
              }
              catch (e) {
                xmlDoc = undefined;
              }

              if (!xmlDoc || xmlDoc.getElementsByTagName('parsererror').length) {
                callback('Unable to parse SVG file: ' + url);
                return false;
              }
              else {
                // Cache it
                svgCache[url] = xmlDoc.documentElement;
              }
            }

            // We've loaded a new asset, so process any requests waiting for it
            processRequestQueue(url);
          }
          else {
            callback('There was a problem injecting the SVG: ' + httpRequest.status + ' ' + httpRequest.statusText);
            return false;
          }
        }
      };

      httpRequest.open('GET', url);

      // Treat and parse the response as XML, even if the
      // server sends us a different mimetype
      if (httpRequest.overrideMimeType) httpRequest.overrideMimeType('text/xml');

      httpRequest.send();
    }
  };

  // Inject a single element
  var injectElement = function (el, evalScripts, pngFallback, callback) {

    // Grab the src or data-src attribute
    var imgUrl = el.getAttribute('data-src') || el.getAttribute('src');

    // We can only inject SVG
    if (!(/\.svg/i).test(imgUrl)) {
      callback('Attempted to inject a file with a non-svg extension: ' + imgUrl);
      return;
    }

    // If we don't have SVG support try to fall back to a png,
    // either defined per-element via data-fallback or data-png,
    // or globally via the pngFallback directory setting
    if (!hasSvgSupport) {
      var perElementFallback = el.getAttribute('data-fallback') || el.getAttribute('data-png');

      // Per-element specific PNG fallback defined, so use that
      if (perElementFallback) {
        el.setAttribute('src', perElementFallback);
        callback(null);
      }
      // Global PNG fallback directoriy defined, use the same-named PNG
      else if (pngFallback) {
        el.setAttribute('src', pngFallback + '/' + imgUrl.split('/').pop().replace('.svg', '.png'));
        callback(null);
      }
      // um...
      else {
        callback('This browser does not support SVG and no PNG fallback was defined.');
      }

      return;
    }

    // Make sure we aren't already in the process of injecting this element to
    // avoid a race condition if multiple injections for the same element are run.
    // :NOTE: Using indexOf() only _after_ we check for SVG support and bail,
    // so no need for IE8 indexOf() polyfill
    if (injectedElements.indexOf(el) !== -1) {
      return;
    }

    // Remember the request to inject this element, in case other injection
    // calls are also trying to replace this element before we finish
    injectedElements.push(el);

    // Try to avoid loading the orginal image src if possible.
    el.setAttribute('src', '');

    // Load it up
    loadSvg(imgUrl, function (svg) {

      if (typeof svg === 'undefined' || typeof svg === 'string') {
        callback(svg);
        return false;
      }

      var imgId = el.getAttribute('id');
      if (imgId) {
        svg.setAttribute('id', imgId);
      }

      var imgTitle = el.getAttribute('title');
      if (imgTitle) {
        svg.setAttribute('title', imgTitle);
      }

      // Concat the SVG classes + 'injected-svg' + the img classes
      var classMerge = [].concat(svg.getAttribute('class') || [], 'injected-svg', el.getAttribute('class') || []).join(' ');
      svg.setAttribute('class', uniqueClasses(classMerge));

      var imgStyle = el.getAttribute('style');
      if (imgStyle) {
        svg.setAttribute('style', imgStyle);
      }

      // Copy all the data elements to the svg
      var imgData = [].filter.call(el.attributes, function (at) {
        return (/^data-\w[\w\-]*$/).test(at.name);
      });
      forEach.call(imgData, function (dataAttr) {
        if (dataAttr.name && dataAttr.value) {
          svg.setAttribute(dataAttr.name, dataAttr.value);
        }
      });

      // Make sure any internally referenced clipPath ids and their
      // clip-path references are unique.
      //
      // This addresses the issue of having multiple instances of the
      // same SVG on a page and only the first clipPath id is referenced.
      //
      // Browsers often shortcut the SVG Spec and don't use clipPaths
      // contained in parent elements that are hidden, so if you hide the first
      // SVG instance on the page, then all other instances lose their clipping.
      // Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=376027

      // Handle all defs elements that have iri capable attributes as defined by w3c: http://www.w3.org/TR/SVG/linking.html#processingIRI
      // Mapping IRI addressable elements to the properties that can reference them:
      var iriElementsAndProperties = {
        'clipPath': ['clip-path'],
        'color-profile': ['color-profile'],
        'cursor': ['cursor'],
        'filter': ['filter'],
        'linearGradient': ['fill', 'stroke'],
        'marker': ['marker', 'marker-start', 'marker-mid', 'marker-end'],
        'mask': ['mask'],
        'pattern': ['fill', 'stroke'],
        'radialGradient': ['fill', 'stroke']
      };

      var element, elementDefs, properties, currentId, newId;
      Object.keys(iriElementsAndProperties).forEach(function (key) {
        element = key;
        properties = iriElementsAndProperties[key];

        elementDefs = svg.querySelectorAll('defs ' + element + '[id]');
        for (var i = 0, elementsLen = elementDefs.length; i < elementsLen; i++) {
          currentId = elementDefs[i].id;
          newId = currentId + '-' + injectCount;

          // All of the properties that can reference this element type
          var referencingElements;
          forEach.call(properties, function (property) {
            // :NOTE: using a substring match attr selector here to deal with IE "adding extra quotes in url() attrs"
            referencingElements = svg.querySelectorAll('[' + property + '*="' + currentId + '"]');
            for (var j = 0, referencingElementLen = referencingElements.length; j < referencingElementLen; j++) {
              referencingElements[j].setAttribute(property, 'url(#' + newId + ')');
            }
          });

          elementDefs[i].id = newId;
        }
      });

      // Remove any unwanted/invalid namespaces that might have been added by SVG editing tools
      svg.removeAttribute('xmlns:a');

      // Post page load injected SVGs don't automatically have their script
      // elements run, so we'll need to make that happen, if requested

      // Find then prune the scripts
      var scripts = svg.querySelectorAll('script');
      var scriptsToEval = [];
      var script, scriptType;

      for (var k = 0, scriptsLen = scripts.length; k < scriptsLen; k++) {
        scriptType = scripts[k].getAttribute('type');

        // Only process javascript types.
        // SVG defaults to 'application/ecmascript' for unset types
        if (!scriptType || scriptType === 'application/ecmascript' || scriptType === 'application/javascript') {

          // innerText for IE, textContent for other browsers
          script = scripts[k].innerText || scripts[k].textContent;

          // Stash
          scriptsToEval.push(script);

          // Tidy up and remove the script element since we don't need it anymore
          svg.removeChild(scripts[k]);
        }
      }

      // Run/Eval the scripts if needed
      if (scriptsToEval.length > 0 && (evalScripts === 'always' || (evalScripts === 'once' && !ranScripts[imgUrl]))) {
        for (var l = 0, scriptsToEvalLen = scriptsToEval.length; l < scriptsToEvalLen; l++) {

          // :NOTE: Yup, this is a form of eval, but it is being used to eval code
          // the caller has explictely asked to be loaded, and the code is in a caller
          // defined SVG file... not raw user input.
          //
          // Also, the code is evaluated in a closure and not in the global scope.
          // If you need to put something in global scope, use 'window'
          new Function(scriptsToEval[l])(window); // jshint ignore:line
        }

        // Remember we already ran scripts for this svg
        ranScripts[imgUrl] = true;
      }

      // :WORKAROUND:
      // IE doesn't evaluate <style> tags in SVGs that are dynamically added to the page.
      // This trick will trigger IE to read and use any existing SVG <style> tags.
      //
      // Reference: https://github.com/iconic/SVGInjector/issues/23
      var styleTags = svg.querySelectorAll('style');
      forEach.call(styleTags, function (styleTag) {
        styleTag.textContent += '';
      });

      // Replace the image with the svg
      el.parentNode.replaceChild(svg, el);

      // Now that we no longer need it, drop references
      // to the original element so it can be GC'd
      delete injectedElements[injectedElements.indexOf(el)];
      el = null;

      // Increment the injected count
      injectCount++;

      callback(svg);
    });
  };

  /**
   * SVGInjector
   *
   * Replace the given elements with their full inline SVG DOM elements.
   *
   * :NOTE: We are using get/setAttribute with SVG because the SVG DOM spec differs from HTML DOM and
   * can return other unexpected object types when trying to directly access svg properties.
   * ex: "className" returns a SVGAnimatedString with the class value found in the "baseVal" property,
   * instead of simple string like with HTML Elements.
   *
   * @param {mixes} Array of or single DOM element
   * @param {object} options
   * @param {function} callback
   * @return {object} Instance of SVGInjector
   */
  var SVGInjector = function (elements, options, done) {

    // Options & defaults
    options = options || {};

    // Should we run the scripts blocks found in the SVG
    // 'always' - Run them every time
    // 'once' - Only run scripts once for each SVG
    // [false|'never'] - Ignore scripts
    var evalScripts = options.evalScripts || 'always';

    // Location of fallback pngs, if desired
    var pngFallback = options.pngFallback || false;

    // Callback to run during each SVG injection, returning the SVG injected
    var eachCallback = options.each;

    // Do the injection...
    if (elements.length !== undefined) {
      var elementsLoaded = 0;
      forEach.call(elements, function (element) {
        injectElement(element, evalScripts, pngFallback, function (svg) {
          if (eachCallback && typeof eachCallback === 'function') eachCallback(svg);
          if (done && elements.length === ++elementsLoaded) done(elementsLoaded);
        });
      });
    }
    else {
      if (elements) {
        injectElement(elements, evalScripts, pngFallback, function (svg) {
          if (eachCallback && typeof eachCallback === 'function') eachCallback(svg);
          if (done) done(1);
          elements = null;
        });
      }
      else {
        if (done) done(0);
      }
    }
  };

  /* global module, exports: true, define */
  // Node.js or CommonJS
  if ( true && typeof module.exports === 'object') {
    module.exports = exports = SVGInjector;
  }
  // AMD support
  else if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return SVGInjector;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Otherwise, attach to window as global
  else {}
  /* global -module, -exports, -define */

}(window, document));


/***/ }),

/***/ "./src/data/undraw.js":
/*!****************************!*\
  !*** ./src/data/undraw.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "undrawGallery": () => (/* binding */ undrawGallery)
/* harmony export */ });
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
// Credits: https://github.com/pshah123/undraw-illustrations MIT licensed (modified minified version here)
const undrawGallery = [
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/making_art_759c.svg',
    title: 'Making art',
    tags: 'creative, painting, woman, art'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/quitting_time_dm8t.svg',
    title: 'Quitting time',
    tags: 'work, office, break, man, coffee, employee'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/user_flow_vr6w.svg',
    title: 'User flow',
    tags: 'wireframes, prototyping, design, ui, ux, invision, designer, personas, mockups, research, draw, low fidelity'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/printing_invoices_5r4r.svg',
    title: 'Printing invoices',
    tags: 'receipt, form, copy machine, pay, money, earn, finance'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/schedule_pnbk.svg',
    title: 'Schedule',
    tags: 'calendar, woman, character, organize, events'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/in_progress_ql66.svg',
    title: 'In progress',
    tags: 'development, creation, process, cogwheel, woman'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/messaging_fun_86y2.svg',
    title: 'Messaging fun',
    tags: 'message, connect, character, communicate, sent, woman'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_testing_reah.svg',
    title: 'Mobile testing',
    tags: 'smartphone, iphone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/barber_3uel.svg',
    title: 'Barber',
    tags: 'haircut, groom, looks, beauty'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/version_control_9bpv.svg',
    title: 'Version control',
    tags: 'git, github, bitbucket, gitlab, versioning, continuous integration, merge, commit, push, code, programming, source, development'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/status_update_jjgk.svg',
    title: 'Status update',
    tags: 'browser, social, site, communication, chat, message, talk'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/jason_mask_t07o.svg',
    title: 'Jason mask',
    tags: 'friday 13th, halloween, serial killer, mask, jason'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_dashboard_k3pt.svg',
    title: 'Social dashboard',
    tags: 'media, smartphone, mobile, facebook, twitter, instagram, youtube, twitch, pinterest'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/robotics_kep0.svg',
    title: 'Robotics',
    tags: 'machine learning, artificial, intelligence, singularity, smart, android, humanoid, lab'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/scrum_board_cesn.svg',
    title: 'Scrum board',
    tags: 'kanban, board, brainstorming, project, planning, stages, mindmap, study, students'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/usability_testing_2xs4.svg',
    title: 'Usability testing',
    tags: 'design, browser, interaction design, use, system, men, product, website, interface, prototype'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wind_turbine_x2k4.svg',
    title: 'Wind turbine',
    tags: 'energy, clean, battery charging, wind farms, renewable energy, kinetic energy, woman'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/developer_activity_bv83.svg',
    title: 'Developer activity',
    tags: 'programmer, man, laptop, github, repo, stats, contributors, tracking, charts'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/medicine_b1ol.svg',
    title: 'Medicine',
    tags: 'doctors, hospital, clinic, man, woman, examination, appointment, physician, medical practitioner'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/revenue_3osh.svg',
    title: 'Revenue',
    tags: 'laptop, man, money, economics, business, investment, banking, accounting, income, stock, funds'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/scooter_aia8.svg',
    title: 'Scooter',
    tags: 'man, san francisco, ride, character, mobility, clean energy, bike, tech, transportation, battery'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wallet_aym5.svg',
    title: 'Wallet',
    tags: 'money, bank, man, pig, income, pay, earn, personal finance, fund, investment, deposit, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/witch_7uk7.svg',
    title: 'Witch',
    tags: 'halloween, scary, pumpkin, woman, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wedding_t1yl.svg',
    title: 'Wedding',
    tags: 'bride, groom, married, happy, love, forever, celebration, man, woman, wife, husband, family'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/warning_cyit.svg',
    title: 'Warning',
    tags: '404 page, alert, notice, rocks, be careful, signal, woman, character, important'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/personal_trainer_ote3.svg',
    title: 'Personal trainer',
    tags: 'woman, girl, gym, workout, health, relax, character, exercise, physical strength, flexibility, man'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/winners_2yls.svg',
    title: 'Winners',
    tags: 'congrats, special moment, celebration, happy, achievement, success, people, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/group_chat_v059.svg',
    title: 'Group chat',
    tags: 'communication, message, talk, sms, instant, messaging, response, inbox, sent, chatbot, speak, language, people'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/night_calls_5jh7.svg',
    title: 'Night calls',
    tags: 'dark, woman, calling, working, character, phone, speaking, talking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_marketing_iqbr.svg',
    title: 'Mobile marketing',
    tags: 'cell phone, people, characters, digital strategy, reaching users, audience, device, smartphone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/winter_designer_a2m7.svg',
    title: 'Winter designer',
    tags: 'woman, office, desk, design, pc, create, prototype, ui, ux, interface, hannah'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/maker_launch_crhe.svg',
    title: 'Maker launch',
    tags: 'rocket, fast, space, man, push button, project'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/data_trends_b0wg.svg',
    title: 'Data trends',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, pie, bars, segmentation, polls, analytics, statistics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/features_overview_jg7a.svg',
    title: 'Features overview',
    tags: 'site, install, woman, characters, design, template, structure, guide, course, complete'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/interview_rmcf.svg',
    title: 'Interview',
    tags: 'man, woman, job, resume, talking, work, deal, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/content_vbqo.svg',
    title: 'Content',
    tags: 'browser, news, man, people, blog, characters, create, information'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/questions_75e0.svg',
    title: 'Questions',
    tags: 'quiz, ask, answer, woman, character, faq, problem'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/balloons_vxx5.svg',
    title: 'Balloons',
    tags: 'woman, celebration, happy, congrats, welcome, character, air, wind'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/doctors_hwty.svg',
    title: 'Doctors',
    tags: 'hospital, woman, man, examination, appointment, physician, medical practitioner'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/savings_hjfl.svg',
    title: 'Savings',
    tags: 'money, bank, man, pig, income, pay, earn, personal finance, fund, investment, deposit, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/children_4rtb.svg',
    title: 'Children',
    tags: 'friends, happy, jump rope, playful, siblings, young, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/security_o890.svg',
    title: 'Security',
    tags: 'safety, browser, lock, man, bodyguard, character, private'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/super_thank_you_obwk.svg',
    title: 'Super thank you',
    tags: 'love, appreciation, woman, happy, in love, character, congratulation, welcome, new user, first time'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/voice_control_ofo1.svg',
    title: 'Voice control',
    tags: 'man, office, echo, working, character, alexa, speech recognition, virtual assistant'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/missed_chances_k3cq.svg',
    title: 'Missed chances',
    tags: 'man, woman, people, characters, city, lost opportunity'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/world_9iqb.svg',
    title: 'World',
    tags: 'earth, destination, pins, man, characters, trip, pc, mac'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/setup_analytics_8qkl.svg',
    title: 'Setup analytics',
    tags: 'charts, metrics, numbers, graphics, infographics, polls, analytics, browser, man, character, install'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/videographer_nnc7.svg',
    title: 'Videographer',
    tags: 'man, character, video, record, production, youtube, news broadcasting, camera operator, camera setup, filmmaking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/setup_wizard_r6mr.svg',
    title: 'Setup wizard',
    tags: 'guide, software, woman, character, options, fill, install, browser, multipage, information, gather, collect'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/heartbroken_cble.svg',
    title: 'Heartbroken',
    tags: 'woman, character, nature, heart, sad, thinking, creative'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/interaction_design_odgc.svg',
    title: 'Interaction design',
    tags: 'users, ux, ui, people, alexa, devices, woman, man, characters, pc, mobile, cell phone, interface'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/startled_8p0r.svg',
    title: 'Startled',
    tags: 'monster, man, surprised, scary, character, 404'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/site_stats_l57q.svg',
    title: 'Site stats',
    tags: 'charts, metrics, numbers, graphics, infographics, polls, analytics, pc, man, character, fast, speed, hourglass, time'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/add_to_cart_vkjp.svg',
    title: 'Add to cart',
    tags: 'buy, pick, choose, woman, character, browser, online shopping'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/confirmation_2uy0.svg',
    title: 'Confirmation',
    tags: 'check, people, man, woman, characters, accept, success, ready, order confirmed, congrats'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/fatherhood_7i19.svg',
    title: 'Fatherhood',
    tags: 'dad, son, child, characters, family, parenthood, helping, skate, hallie'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/dashboard_nklg.svg',
    title: 'Dashboard',
    tags: 'control, settings, preferences, users, data, analytics, stats, man, character, pc, mac'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/feeling_blue_4b7q.svg',
    title: 'Feeling blue',
    tags: 'sad, woman, emoticon, character, 404'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/order_confirmed_1m3v.svg',
    title: 'Order confirmed',
    tags: 'woman, character, success, cell phone, mobile, check, congrats'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/business_plan_5i9d.svg',
    title: 'Business plan',
    tags: 'man, work, analytics, data, meeting, presentation, character, metrics, numbers, excel, statistics, graphics, infographics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/before_dawn_bqrj.svg',
    title: 'Before dawn',
    tags: 'woman, alone, nature, character, tree, bench, park, no electricity'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/businesswoman_pc12.svg',
    title: 'Businesswoman',
    tags: 'character, work, walking, travel, busy, mobile, cell phone, person, networking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/getting_coffee_wntr.svg',
    title: 'Getting coffee',
    tags: 'man, woman, together, happy, conversation, talking, characters, outside'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pedestrian_crossing_l6jv.svg',
    title: 'Pedestrian crossing',
    tags: 'man, walking, road, character, crosswalk'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/powerful_26ry.svg',
    title: 'Powerful',
    tags: 'strong, woman, businesswoman, chair, character, influence, welcome'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/programming_2svr.svg',
    title: 'Programming',
    tags: 'programmer, pc, working, character, man, focus, coding, computer, working, testing, debugging, software development, building systems'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/working_late_pukg.svg',
    title: 'Working late',
    tags: 'woman, laptop, sitting, work, office, night, city, view, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/envelope_n8lc.svg',
    title: 'Envelope',
    tags: 'mail, open, chose, select, read, envelope, inbox, received, accepted, messages, man, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/press_play_bx2d.svg',
    title: 'Press play',
    tags: 'tablet, apple, play, enter, watch, office, desk, woman, character, work, relax, login, sign up'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/emails_6uqr.svg',
    title: 'Emails',
    tags: 'tablet, apple, mail, open, chose, select, read, envelope, inbox, received, accepted, messages'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/dark_alley_hl3o.svg',
    title: 'Dark alley',
    tags: 'fire, winter, road, alone, walking, cold, shadow, woman, character, wall'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/chef_lbjx.svg',
    title: 'Chef',
    tags: 'cook, man, character, kitchen, restaurant, hotel, food, recipe'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/off_road_9oae.svg',
    title: 'Off road',
    tags: 'car, vehicle, people, characters, trip, nature, relax, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/QA_engineers_dg5p.svg',
    title: 'QA engineers',
    tags: 'work, man, character, quality assurance, feedback, detailed, test, estimating, errors, debugging'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pie_chart_6efe.svg',
    title: 'Pie chart',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, statistics, graphics, infographics, pie, bars, segmentation, polls, man, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/baby_ja7a.svg',
    title: 'Baby',
    tags: 'mother, child, maternity, love, family, mom, character, baby crib'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_payments_edgf.svg',
    title: 'Mobile payments',
    tags: 'money, transfer, services, financial, device, phone, smartphone, cell phone, man, character, cash register'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/design_community_rcft.svg',
    title: 'Design community',
    tags: 'dribbble, behance, designer news, prototypr, man, woman, characters, people, ui, ux, startups, tech'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/preferences_uuo2.svg',
    title: 'Preferences',
    tags: 'settings, choose, like, woman, character, browser, customer'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/businessman_97x4.svg',
    title: 'Businessman',
    tags: 'man, working, walking, busy, mobile, cell phone, person, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/trip_dv9f.svg',
    title: 'Trip',
    tags: 'man, woman, vacation, characters, nature, map, photography, laptop, bag, couple, relax, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/on_the_office_fbfs.svg',
    title: 'On the office',
    tags: 'office, work, code, relax, design, mac, apple, pc, desk, man, character, waiting'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wireframing_nxyi.svg',
    title: 'Wireframing',
    tags: 'design. woman, character, pc, mac, apple, ux. ui, web, browser, product, prototype, layout, template, interface'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/product_teardown_elol.svg',
    title: 'Product teardown',
    tags: 'disassembling, man, phone, mobile, cell phone, man, character, device, identify, component parts, system functionality. information'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/alien_science_nonm.svg',
    title: 'Alien science',
    tags: 'scientist, woman, lab, research, character, chemist, experiment, intelligent'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/hang_out_h9ud.svg',
    title: 'Hang out',
    tags: 'coffee, break, people, man, woman, character, nature, friends, friendship, together, talking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/science_fqhl.svg',
    title: 'Science',
    tags: 'scientist, woman, lab, research, character, chemist, experiment'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/conversation_h12g.svg',
    title: 'Conversation',
    tags: 'meeting, talk, friends, discussion, gossip, dialogue, man, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/business_deal_cpi9.svg',
    title: 'Business deal',
    tags: 'man, buy, sell, trade, characters, office, work, handshake, agreement'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/focus_sey6.svg',
    title: 'Focus',
    tags: 'photography, artist, photos, photographer, nature, woman character, camera, shot, snap, snapshot, amber'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/designer_life_w96d.svg',
    title: 'Designer life',
    tags: 'woman, office, work, design, prototype, pc, laptop, mac, character, ui, ux, users, interface, experience, collaboration, template, working, creative, chief'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/server_status_5pbv.svg',
    title: 'Server status',
    tags: 'data, cloud, woman, character, check, online'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/studying_s3l7.svg',
    title: 'Studying',
    tags: 'read, learn, school, homework, author, think, create, woman, character, work, book, analysis'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/blank_canvas_3rbb.svg',
    title: 'Blank canvas',
    tags: 'empty, woman, drawing, painter, character, school, 404, not found, error'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/smiley_face_lmgm.svg',
    title: 'Smiley face',
    tags: 'man, woman, people, happy, together, hug, characters, emoticons, feeling'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/back_to_school_inwc.svg',
    title: 'Back to school',
    tags: 'family, mother, mom, boy, son, school, characters, teach'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/product_tour_foyt.svg',
    title: 'Product Tour',
    tags: 'navigate, man, woman, people, characters, company, read, visitors, customer, news'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/upload_87y9.svg',
    title: 'Upload',
    tags: 'man, files, style guide, characters, organize, documents, gathering, cloud'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/fall_is_coming_dg3x.svg',
    title: 'Fall is coming',
    tags: 'park, day, people, man, woman, character, relax, walk, nature, bench, trees, life, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/target_kriv.svg',
    title: 'Target',
    tags: 'dart, man, character, goals, dart board, sport, hobby'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/to_do_list_a49b.svg',
    title: 'To do list',
    tags: 'checklist, files, write, check, arrange, woman, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/city_driver_jh2h.svg',
    title: 'City driver',
    tags: 'car, woman, travel, road, vehicle, character, mini cooper'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/motherhood_7htu.svg',
    title: 'Motherhood',
    tags: 'maternity, love, child, family, mother, mom, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/digital_nomad_9kgl.svg',
    title: 'Digital nomad',
    tags: 'remote, work, man, freelancer, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/creativity_wqmm.svg',
    title: 'Creativity',
    tags: 'woman, browser, paint, color, design, prototype, palette, interface, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/online_shopping_ga73.svg',
    title: 'Online shopping',
    tags: 'buy, clothes, pick, choose, woman, character, browser, smartphone, mobile, cell phone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/more_music_w70e.svg',
    title: 'More music',
    tags: 'man, woman, songs, piano, sing, together, diplo, characters, compose music, mo'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/instant_support_elxh.svg',
    title: 'Instant support',
    tags: 'man, flying, character, sky, instantly, real time, work, teacher, radar, question, search, hero'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/book_lover_mkck.svg',
    title: 'Book lover',
    tags: 'woman, reading, reads, character, self improve, hobby, author, writer, homework, study, school'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/startup_life_2du2.svg',
    title: 'Startup life',
    tags: 'man, laptop, macbook, apple, programmer, designer, walking, character, startup'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/design_tools_42tf.svg',
    title: 'Design tools',
    tags: 'ui, ux, users, interface, experience, prototype, sketch, adobe, xd, collaboration, template, characters, working, creative, office, computers, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_browsers_lib5.svg',
    title: 'Mobile browsers',
    tags: 'edge, chrome, safari, people, woman, characters, phone, smartphone, browsers, internet, walking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/work_chat_erdt.svg',
    title: 'Work chat',
    tags: 'communication, message, talk, sms, instant, messaging, response, inbox, sent, chatbot, speak, language, group chat'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/doctor_kw5l.svg',
    title: 'Doctor',
    tags: 'pediatrician, kid, characters, man, people, examination, doctor appointment, physician, medical practitioner'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/team_spirit_hrr4.svg',
    title: 'Team spirit',
    tags: 'team, about us, work together, dog, characters, people, man, woman, members, voters, supporters, followers'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/work_time_lhoj.svg',
    title: 'Work time',
    tags: 'working, office, man, character, pc, desk, chair, work, anges244'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/empty_xct9.svg',
    title: 'Empty',
    tags: 'no data, empty state, man, character, box, carrying, not found, nothing, void'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/weather_d9t2.svg',
    title: 'Weather',
    tags: 'forecast, man, character, predict weather, sun, clouds'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/word_of_mouth_v1j9.svg',
    title: 'Word of mouth',
    tags: 'marketing, advertising, viral, man, woman, characters, whispering, strategies'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/on_the_way_ldaq.svg',
    title: 'On the way',
    tags: 'delivering, vespa, packages, woman, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/birthday_cake_7df8.svg',
    title: 'Birthday cake',
    tags: 'man, woman, celebration, birthday, cake, characters, people, balloons, happy, new'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/a_day_at_the_park_owg1.svg',
    title: 'A day at the park',
    tags: 'people, man, woman, park, day, nature, walking, life, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Calculator_0evy.svg',
    title: 'Calculator',
    tags: 'numbers, man, character, accountant, finance, number cruncher, data processor, statistician'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/group_selfie_ijc6.svg',
    title: 'Group selfie',
    tags: 'man, woman, people, characters, photo, smartphone, take a selfie, selfie, photograph, happy, fun'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/personalization_triu.svg',
    title: 'Personalization',
    tags: 'man, smartphone, iphone, mobile, character, customization'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/relaxing_at_home_9tyc.svg',
    title: 'Relaxing at home',
    tags: 'sofa, couch, woman, laptop, home, relax, comfortable, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pilates_gpdb.svg',
    title: 'Pilates',
    tags: 'woman, girl, gym, workout, health, relax, character, exercise, physical strength, flexibility'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/loading_frh4.svg',
    title: 'Loading',
    tags: 'woman, dog, loading, waiting, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/running_wild_ni0y.svg',
    title: 'Running wild',
    tags: 'man, woman, run, freedom, happiness, joy, happy, characters, people'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/taking_notes_tjaf.svg',
    title: 'Taking notes',
    tags: 'remember, man, notes, sticky notes, character, reading, think'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/collection_u2np.svg',
    title: 'Collection',
    tags: 'photos, upload, man, character, browser, online, cloud, gathering'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/thoughts_e49y.svg',
    title: 'Thoughts',
    tags: 'woman, park, nature, thinking, gaze, bench, alone, character, stare'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/refreshing_ncum.svg',
    title: 'Refreshing',
    tags: 'soda, drink, people, man, woman, refresh, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/moment_to_remember_02gj.svg',
    title: 'Moment to remember',
    tags: 'selfie, man, character, mobile, smartphone, photo, taking photo, cellphone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/analysis_4jis.svg',
    title: 'Analysis',
    tags: 'man, woman, examination, detailed examination, study, working, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/workout_gcgu.svg',
    title: 'Workout',
    tags: 'exercise, woman, dance, character, healthy, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/airport_2581.svg',
    title: 'Airport',
    tags: 'man, travel, trip, airplane, coffee, businessman, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/photocopy_gj0t.svg',
    title: 'Photocopy',
    tags: 'woman, papers, copy, character, photocopy machine, work, office'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/campfire_s6y4.svg',
    title: 'Campfire',
    tags: 'girls, woman, forest, camping, relax, travel, characters, nature'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/High_five_u364.svg',
    title: 'High five',
    tags: 'man, woman, couple, happy, successful, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/young_and_happy_hfpe.svg',
    title: 'Young and happy',
    tags: 'youthful, man, boy, character, joy, cheerful'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/report_mx0a.svg',
    title: 'Report',
    tags: 'outline, detail, man, character, ipad, apple, analytics, data, announce, review, record, charts, tabs, metrics, numbers, excel, graphics, infographics, bars, polls'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/music_r1se.svg',
    title: 'Music',
    tags: 'woman, dance, dancing, happy, samsung, mobile, cellphone, android, device, play, listen, smartphones, google, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/navigation_lytx.svg',
    title: 'Navigation',
    tags: 'place, location, woman, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/surfer_m6jb.svg',
    title: 'Surfer',
    tags: 'man, sea, beach, summer, character, surfing'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/exploring_1l7f.svg',
    title: 'Exploring',
    tags: 'forest, woman, backpack, travel, seek, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/onboarding_o8mv.svg',
    title: 'Onboarding',
    tags: 'man, character, site, website, browser, help, explain'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/art_lover_yjfr.svg',
    title: 'Art lover',
    tags: 'woman, girl, painting, art, admire, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/in_the_pool_c5h0.svg',
    title: 'In the pool',
    tags: 'woman, pool, sea, relax, character, summer'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/successful_purchase_uyin.svg',
    title: 'Successful purchase',
    tags: 'shopping, bags, woman, buy, character, shopping therapy, purchase, success'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/organize_resume_utk5.svg',
    title: 'Organize resume',
    tags: 'browser, woman, site, personal website, easy, resume, job, apply, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/android_jr64.svg',
    title: 'Android',
    tags: 'phone, cellphone, mobile, operating system, google, smartphones, google play, device'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/ethereum_desire_wy1b.svg',
    title: 'Ether',
    tags: 'crypto, coin, cash, coinbase, blockchain, banks, money, women, plants, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/reading_list_4boi.svg',
    title: 'Reading list',
    tags: 'man, books, read, recommendation, character, self improve'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/gardening_j8jx.svg',
    title: 'Gardening',
    tags: 'woman, flowers, character, growing, landscaping, planting'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/online_world_mc1t.svg',
    title: 'Online world',
    tags: 'woman, mobile, cellphone, message, connect, character, communicate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/messaging_uok8.svg',
    title: 'Messaging',
    tags: 'woman, mobile, cellphone, message, connect, character, communicate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/online_1qud.svg',
    title: 'Online',
    tags: 'instagram, twitter, facebook, twitch, youtube, linkedin, social, mobile, cellphone, man, books'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/forgot_password_gi2d.svg',
    title: 'Forgot password',
    tags: 'man, password, login, sign in, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/lost_bqr2.svg',
    title: 'Lost',
    tags: 'man, map, directions, gps, character, place, find'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/beach_56sf.svg',
    title: 'Beach',
    tags: 'sun, summer, couple, man, woman, umbrella, ball, sand'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/credit_card_payment_12va.svg',
    title: 'Credit card payments',
    tags: 'money, woman, pay, character, card, plastic money'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/time_management_30iu.svg',
    title: 'Time management',
    tags: 'clock, woman, hour, schedule, busy, character, time control, arrangement of working time, timing'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/inbox_cleanup_w2ur.svg',
    title: 'Inbox cleanup',
    tags: 'gmail, mail. email, yahoo mail, cleaner, clean, man, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/crypto_flowers_6bgv.svg',
    title: 'Crypto flowers',
    tags: 'crypto, coin, cash, coinbase, blockchain, satoshi, banks, money, woman, plants, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/community_8nwl.svg',
    title: 'Community',
    tags: 'man, woman, group, together, people, common, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wall_post_83ul.svg',
    title: 'Wall post',
    tags: 'post, website, personal, browser, woman, man, comment, profile, write'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/app_installation_mbdv.svg',
    title: 'App installation',
    tags: 'tablet, man, apps, android, app store, apple, install, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/vr_chat_kq3p.svg',
    title: 'VR chat',
    tags: 'man, woman, laptop, chat, communication, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/forever_5ag7.svg',
    title: 'Forever',
    tags: 'couple, sunset, man, woman, romantic, character, love, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/track_and_field_33qn.svg',
    title: 'Track and field',
    tags: 'sports, hobby, health, woman, character, obstacles, jump'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/fishing_hoxa.svg',
    title: 'Fishing',
    tags: 'man, boat, sea, river, mountains, character, nature, hobby'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/be_the_hero_ssr2.svg',
    title: 'Be the hero',
    tags: 'man, excalibur, sword, character, strength'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/accept_terms_4in8.svg',
    title: 'Accept terms',
    tags: 'gdpr, privacy, terms, security, eu, ads, rules, websites'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/gdpr_3xfb.svg',
    title: 'GDPR',
    tags: 'woman, gdpr, privacy, terms, security, eu, ads, rules, websites, character, flag'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/in_sync_xwsa.svg',
    title: 'In sync',
    tags: 'devices, people, woman, man, characters, mobile, cell phone, tablet, laptop, synchronize'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/basketball_agx4.svg',
    title: 'Basketball',
    tags: 'player, ball, man, sport, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_ideas_e8rj.svg',
    title: 'Social ideas',
    tags: 'woman, sky, character, dreaming, instagram, twitter, facebook, twitch, youtube, linkedin, social, ideas, thinking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/marilyn_v73y.svg',
    title: 'Marilyn',
    tags: 'woman, character, white dress, dress, got me, 404 page'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/staying_in_i80u.svg',
    title: 'Staying in',
    tags: 'bed, man, woman, characters, eat, pizza, home, bedroom'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/organize_photos_d5nr.svg',
    title: 'Organize photos',
    tags: 'man, character, mobile, cell phone, photos, camera, collection'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/podcast_q6p7.svg',
    title: 'Podcast',
    tags: 'woman, character, radio, netcast, digital audio, computer, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/people_search_wctu.svg',
    title: 'People search',
    tags: 'man, woman, search, find, characters, contact.'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/girl_just_wanna_have_fun_9d5u.svg',
    title: 'Girls just wanna have fun',
    tags: 'teen, teenagers, girls, woman, clothes, dress up, happy, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/messenger_e7iu.svg',
    title: 'Messenger',
    tags: 'mail, woman, send, character, receive, angel, wings, email'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_networking_nqk4.svg',
    title: 'Social networking',
    tags: 'man, woman, office, work, chat, video chat, social media, online'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Ride_a_bicycle_2yok.svg',
    title: 'Ride a bicycle',
    tags: 'bike, boy, man, character, happy, hobby, bicycle'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/friendship_mni7.svg',
    title: 'Friendship',
    tags: 'man, happy, characters, tree, friends, nature'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/makeup_artist_rxn8.svg',
    title: 'Makeup artist',
    tags: 'beauty, cosmetics, people, man, woman, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/electric_car_b7hl.svg',
    title: 'Electric car',
    tags: 'elon musk, amrith, tesla, car, roadster, energy, roads'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/freelancer_b0my.svg',
    title: 'Freelancer',
    tags: 'woman, working, home, character, laptop, apple, relax'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/gaming_6oy3.svg',
    title: 'Gaming',
    tags: 'playstation, ps4, man, character, video games, sony, controller'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/rising_8svm.svg',
    title: 'Rising',
    tags: 'tombstone, hand, cemetery, grave'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/events_2p66.svg',
    title: 'Events',
    tags: 'calendar, woman, character, schedule, organize'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Follow_me_drone_kn76.svg',
    title: 'Follow me drone',
    tags: 'drone, ai, smart, woman, character, follow'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Bibliophile_hwqc.svg',
    title: 'Bibliophile',
    tags: 'books, read, love, woman, curious, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/old_day_6x25.svg',
    title: 'Old day',
    tags: 'arcade, game, man, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/co-working_825n.svg',
    title: 'Co-working',
    tags: 'together, man, woman, office, mac, report, documents, management, pc, mac'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/segmentation_uioo.svg',
    title: 'Segmentation',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, polls, analytics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/may_the_force_bgdm.svg',
    title: 'May the force',
    tags: 'star wars, movies, jedi'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/back_in_the_day_knsh.svg',
    title: 'Back in the day',
    tags: 'old, pc, man, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/goal_0v5v.svg',
    title: 'Goal',
    tags: 'ball, man, characters, activity, sport, fun, football, soccer'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/firmware_mf69.svg',
    title: 'Firmware',
    tags: 'ai, artificial intelligence, robot, coding, man, characters, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/country_side_ayop.svg',
    title: 'Country side',
    tags: 'woman, character, plats, nature, walk, relax'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/blogging_vpvv.svg',
    title: 'Blogging',
    tags: 'woman, character, office, setup, website, online, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/sunny_day_bk3m.svg',
    title: 'Sunny day',
    tags: 'woman, walk, relax, happy, sun, building'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/sleep_analysis_o5f9.svg',
    title: 'Sleep analysis',
    tags: 'woman, analysis, data, bed, nap, cycle'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/wishes_icyp.svg',
    title: 'Wishes',
    tags: 'lantern, woman, character, air'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/data_report_bi6l.svg',
    title: 'Data report',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, bars, polls, analytics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/healthy_habit_bh5w.svg',
    title: 'Healthy habit',
    tags: 'work out, apple, man, gym, health, diet, character'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/static_assets_rpm6.svg',
    title: 'Static assets',
    tags: 'man, woman, server, characters, javascript, html, css'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/in_love_3dcq.svg',
    title: 'In love',
    tags: 'man, woman, love, wait, together, happy, nature'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/good_doggy_4wfq.svg',
    title: 'Good doggy',
    tags: 'dog, woman, pet, city, walk'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/virtual_reality_y5ig.svg',
    title: 'Virtual reality',
    tags: 'vr, artificial intelligence, equipment, fantasy, gaming, equipment, projection, realistic, technology'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/by_my_car_ttge.svg',
    title: 'By my car',
    tags: 'car, man, character, drive, relax'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/filing_system_b5d2.svg',
    title: 'Filing system',
    tags: 'organize, documents, man, character, files, upload, take, download'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/celebration_0jvk.svg',
    title: 'Celebration',
    tags: 'happy, people, man, woman, characters, success, achievement, welcome'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/drone_race_0sim.svg',
    title: 'Drone race',
    tags: 'competition, race, sport, air racing'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/artificial_intelligence_upfn.svg',
    title: 'Artificial intelligence',
    tags: 'ai, robot, machine, blocks'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mindfulness_scgo.svg',
    title: 'Mindfulness',
    tags: 'meditation, present moment, woman, character, buddhist, spa, yoga, workout, wellness, fitness'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/make_it_rain_iwk4.svg',
    title: 'Make it rain',
    tags: 'credit card, money, man, character, payment'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/building_blocks_n0nc.svg',
    title: 'Building blocks',
    tags: 'firewall, man, character, build, create, secure, improve, backyard, rocks, garden'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/coding_6mjf.svg',
    title: 'Coding',
    tags: 'programmer, laptop, working, character, man, focus'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/selfie_time_cws4.svg',
    title: 'Selfie time',
    tags: 'photo, woman, mobile, cell phone, character, iphone, self-portrait, smartphone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/web_devices_ad58.svg',
    title: 'Web devices',
    tags: 'internet, responsive, design, site, iphone, ipad, apple, imac, mac, woman, devices, real time'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/eating_together_tjhx.svg',
    title: 'Eating together',
    tags: 'food, couple, noodles, dinner, lunch, meal, man, woman, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/drone_delivery_5vrm.svg',
    title: 'Drone delivery',
    tags: 'arrive, city, drone, packages'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/street_food_hm5i.svg',
    title: 'Street food',
    tags: 'food, truck, man, woman, foodtruck, characters'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/window_shopping_b96y.svg',
    title: 'Window shopping',
    tags: 'clothes, dresses, woman, pick, choose, design, thinking'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/in_the_office_o44c.svg',
    title: 'In the office',
    tags: 'man, woman, working, together'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/tasting_de22.svg',
    title: 'Tasting',
    tags: 'cupcake, food, sweet, man, eat'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/romantic_getaway_k2mf.svg',
    title: 'Romantic getaway',
    tags: 'woman, man, tree, vacation, trip, relax, forest, love, together, couple'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/image_upload_wqh3.svg',
    title: 'Image upload',
    tags: 'photo, man, site, personal, setup, browser, safari, upload, website'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/newsletter_vovu.svg',
    title: 'Newsletter',
    tags: 'messages, email, inbox, envelope, opened, notification, received, outgoing, accepted'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/easter_egg_hunt_r36d.svg',
    title: 'Easter egg hunt',
    tags: 'woman, bunny, eggs, happy, holiday, happy, hunting, easter, vacation'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/finance_0bdk.svg',
    title: 'Finance',
    tags: 'laptop, man, money, economics, business, investment, banking, accounting, revenue, income, stock, funds'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/through_the_desert_fcin.svg',
    title: 'Through the desert',
    tags: 'woman, desert, camel, pyramids, sun, travel, destination, trip'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/grand_slam_0q5r.svg',
    title: 'Grand slam',
    tags: 'woman, tennis, sports, happy, racket, ball, elli'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/walk_in_the_city_1ma6.svg',
    title: 'Walk in the city',
    tags: 'music, listening, city, plants, man, buildings, town, cool, headphones'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/ethereum_fb7n.svg',
    title: 'Ethereum',
    tags: 'crypto, coin, cash, coinbase, blockchain, banks, money, women, plants'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/website_setup_5hr2.svg',
    title: 'Website setup',
    tags: 'browser, woman, photo, site, personal website, easy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/co-workers_ujs6.svg',
    title: 'Co-workers',
    tags: 'together, man, woman, office, laptop, mac, report, documents, management'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/departing_lsgy.svg',
    title: 'Departing',
    tags: 'travel, suitcase, airplane, destination, holidays, instagram, influencer, blogger'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_apps_4wgf.svg',
    title: 'Mobile apps',
    tags: 'iphone, mobile, cell, apple, samsung, apps'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/influencer_d3xx.svg',
    title: 'Influencer',
    tags: 'twitter, facebook, instagram, youtube, social, audience, girl, confident, modern woman, growth'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/outer_space_3v6n.svg',
    title: 'Outer space',
    tags: 'astronaut, rocket, space, planets, launch, stars'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/btc_p2p_lth5.svg',
    title: 'Bitcoin P2P',
    tags: 'crypto, coin, cash, coinbase, blockchain, satoshi, banks, money, women, plants'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_strategy_1wuq.svg',
    title: 'Social strategy',
    tags: 'pinterest, twitter, facebook, instagram, trees, plants, woman'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/together_j0gj.svg',
    title: 'Together',
    tags: 'man, woman, trees, couple, walk, nature'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/modern_woman_9l0u.svg',
    title: 'Modern woman',
    tags: 'dog, animal, walk, city, street, landing, life, happy, plants, road'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/meeting_115p.svg',
    title: 'Meeting',
    tags: 'bear, report, brainstorm, discussion, woman, startups, files, documents'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/ordinary_day_xi0c.svg',
    title: 'Ordinary day',
    tags: 'houses, people, man, woman, trees, clouds, sun, birds, walking, street, life, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/home_run_oerh.svg',
    title: 'Home run',
    tags: 'baseball, sport, ball, hit, success, bat, man, win'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/cloud_hosting_aodd.svg',
    title: 'Cloud hosting',
    tags: 'aws, amazon, google cloud, heroku, paas, hosting, platform, cloud, computing, apps'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/broadcast_jhwx.svg',
    title: 'Broadcast',
    tags: 'wifi, antenna, internet'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/tweetstorm_49e8.svg',
    title: 'Tweetstorm',
    tags: 'social media, twitter, box, bird'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/happy_birthday_s72n.svg',
    title: 'Happy birthday',
    tags: 'balloons, gift, celebration, happy, festive'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/JavaScript_Frameworks_x21l.svg',
    title: 'JavaScript frameworks',
    tags: 'react, vue, angular, jquery, plants, books, wall'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/women_day_2m89.svg',
    title: 'Women day',
    tags: 'women, celebration, together, happy, love, sky'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/spreadsheets_xdjy.svg',
    title: 'Spreadsheets',
    tags: 'documents, office, excel, math, organize, docs'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/email_capture_x8kv.svg',
    title: 'Email capture',
    tags: 'gather, addresses, man, magnet, users, newsletter, gmail, yahoo'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/fast_loading_0lbh.svg',
    title: 'Fast loading',
    tags: 'man, files, documents, speed, browser, light'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/login_jdch.svg',
    title: 'Login',
    tags: 'man, door, sign in, entrance'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/hello_aeia.svg',
    title: 'Hello',
    tags: 'man, character, laptop, mac, plant, office, happy, working, greeting, welcome, coffee'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/collecting_fjjl.svg',
    title: 'Collecting',
    tags: 'documents, files, information, box, save, organize, data, research, keep, together'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/organizing_projects1_47ja.svg',
    title: 'Organizing projects',
    tags: 'woman, pc, laptop, coffee, mac, plant, documents, files, arrange'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/live_collaboration_2r4y.svg',
    title: 'Live collaboration',
    tags: 'people, man, woman, documents, excel, word, working, files, cloud, team, together, edit, add'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/product_hunt_n3f5.svg',
    title: 'Product hunt',
    tags: 'woman, cat, cup, celebration'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/connecting_teams3_1pgn.svg',
    title: 'Connecting Teams',
    tags: 'people, support, team, network, wheels, work, anywhere'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/new_message_2gfk.svg',
    title: 'New message',
    tags: 'receive, messager, email, inbox, accepted'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Lighthouse_frb8.svg',
    title: 'Lighthouse',
    tags: 'sea, birds, clouds, welcome, login, sign in, sign up, landscape, trees'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/houses3_xwf7.svg',
    title: 'Houses',
    tags: 'buildings, grow, real estate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/about_us_page_ee1k.svg',
    title: 'About us page',
    tags: 'members, profiles, people, search, results, club, voters, supporters, followers, woman, man, browser'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/bitcoin2_ave7.svg',
    title: 'Bitcoin',
    tags: 'crypto, coin, cash, coinbase, blockchain, satoshi, banks, money'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/fans_gr54.svg',
    title: 'Fans',
    tags: 'people, celebration, man, football, popcorn, soda, sofa, sport, win, lose'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Winter_olympics_p07j.svg',
    title: 'Winter olympics',
    tags: 'chloe kim, churros, winning, sport, snowboarder, snow, woman'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/To_the_stars_qhyy.svg',
    title: 'To the stars',
    tags: 'rocket, fast, space, tesla, cloud, falcon heavy, elon musk, spacex, launch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/responsive_6c8s.svg',
    title: 'Responsive',
    tags: 'web design, office, pc, imac, design, plant, web application, desktop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/creation_process_vndn.svg',
    title: 'Creation process',
    tags: 'man, character, idea, brainstorming, notes, work, post-it, mvp'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/designer_kcp7.svg',
    title: 'Designer',
    tags: 'working, office, man, character, plant, coffee'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/profile_pic_ic5t.svg',
    title: 'Profile pic',
    tags: 'man, display image, personal, image, avatar, anges244'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/team_ih79.svg',
    title: 'Team',
    tags: 'about us, members, profiles, people, search, results, club, voters, supporters, followers, woman, man'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/notes1_cf55.svg',
    title: 'Notes',
    tags: 'woman, character, record, entry, item, memo'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/selfie1_kpqf.svg',
    title: 'Selfie',
    tags: 'photo, iphone, samsung, mobile, cell, hand'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/news_go0e.svg',
    title: 'News',
    tags: 'read, rss, report, announcement, story, broadcast, rumor, leak, statement, discovery, scandal, exposé, news flash, man'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/development_ouy3.svg',
    title: 'Development',
    tags: 'creation, man, woman, people, progress, process'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/messages1_9ah2.svg',
    title: 'Messages',
    tags: 'people, woman, cell, phone, mobile, social, group, iphone, samsung, communication, message, talk, sms, instant messaging, response, inbox, sent, chatbot, speak, language'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/credit_card_payment_yb88.svg',
    title: 'Credit card payment',
    tags: 'credit card, money, banks, bitcoin, plastic, chip, buy, sell, payments, transactions, swipe, stripe, braintree'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/love_is_in_the_air_4mmc.svg',
    title: 'Love is in the air',
    tags: 'couple, man, woman, in love, roses, happy, romantic, valentine'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/superhero_kguv.svg',
    title: 'Superhero',
    tags: 'man, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/active_support_6rwo.svg',
    title: 'Active support',
    tags: 'man, online, social, chat, assistant, laptop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/design_process_iqqg.svg',
    title: 'Design process',
    tags: 'wireframing, mobile, cell, iphone, samsung'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/control_panel1_20gm.svg',
    title: 'Control panel',
    tags: 'buttons, lever, switches, screwdriver'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/transfer_files_6tns.svg',
    title: 'Transfer files',
    tags: 'share, upload, cloud, documents, sync'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/hiring_cyhs.svg',
    title: 'Hiring',
    tags: 'work, cv, files, documents, reports, profiles, office, business, resume'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/brainstorming_49d4.svg',
    title: 'Brainstorming',
    tags: 'students, ideas, woman, man, study, notes, working, together'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/startman1_h7l9.svg',
    title: 'Starman',
    tags: 'elon musk, space, car'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/post2_19cj.svg',
    title: 'Post',
    tags: 'opinions, community, feedback, site, feed, stream, rss, news, readlist, items'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/graduation_9x4i.svg',
    title: 'Graduation',
    tags: 'college, education, learning, student, university'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/no_data_qbuo.svg',
    title: 'No data',
    tags: 'empty state, not found'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/cloud_sync_2aph.svg',
    title: 'Cloud sync',
    tags: 'server, mobile, cell, hand, check'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/grades_j6jn.svg',
    title: 'Grades',
    tags: 'people, man, woman, level, charts, stats, rank, analytics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/gift1_sgf8.svg',
    title: 'Gift',
    tags: 'present, man, sitting, happy, achievement'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/add_file2_gvbb.svg',
    title: 'Add files',
    tags: 'documents, upload, cloud, save'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/connected_8wvi.svg',
    title: 'Connected',
    tags: 'people, man, woman, tablet, ipad, communicate, chat, check'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/secure_data_0rwp.svg',
    title: 'Secure data',
    tags: 'lock, files, analytics, charts'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/agreement_aajr.svg',
    title: 'Agreement',
    tags: 'handshake, partnership, contract, signing, people, business, deal'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/taken_yju1.svg',
    title: 'Taken',
    tags: 'alien, ghost, 404, not found, spaceship'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/confirmed_81ex.svg',
    title: 'Confirmed',
    tags: 'check, hand, mobile, cell, success, iphone, samsung'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/security_on_6e8f.svg',
    title: 'Security on',
    tags: 'man, check, safe, shield, antivirus'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/air_support_wy1q.svg',
    title: 'Air support',
    tags: 'help, people, woman, man, house, sky, sun, clouds'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/beer_celebration_3wc8.svg',
    title: 'Beer celebration',
    tags: 'fun, drinking, happy, special moment, congrats'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/chatting_2yvo.svg',
    title: 'Chatting',
    tags: 'people, woman, cell, phone, mobile, social, group, iphone, samsung'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/upvote_96dp.svg',
    title: 'Upvote',
    tags: 'win, browser, chrome, safari, edge, mozilla'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/secure_server_s9u8.svg',
    title: 'Secure server',
    tags: 'laptop, antivirus, computer, shield, virus'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/queue_qt30.svg',
    title: 'Queue',
    tags: 'people, man, woman, waiting, in line'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/choose_80qg.svg',
    title: 'Choose',
    tags: 'man, select, check'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/chilling_8tii.svg',
    title: 'Chilling',
    tags: 'rest, man, cat, animal, relax, sofa'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/swipe_profiles1_i6mr.svg',
    title: 'Swipe profiles',
    tags: 'man, woman, iphone, mobile, cell, browse, find'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/real-time_sync_o57k.svg',
    title: 'Real-time sync',
    tags: 'laptop, mobile, iphone, mac, cell, devices, android, samsung, wifi, responsive, apple, ios, touch, mobile, cellphone, tablet, ipad'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/add_user_ipe3.svg',
    title: 'Add user',
    tags: 'browser, man, safari, edge, mozilla'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/customer_survey_f9ur.svg',
    title: 'Customer survey',
    tags: 'analysis, review, check'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mission_impossible_bwa2.svg',
    title: 'Mission impossible',
    tags: 'laptop, people, man'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/filter_4kje.svg',
    title: 'Filter',
    tags: 'select, choose'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Cautious_dog_q83f.svg',
    title: 'Cautious dog',
    tags: 'hungry, food, pet, animal, cute, feed, smell'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Container_ship_urt4.svg',
    title: 'Container ship',
    tags: 'sea, sun, work, carrying, cargo, trade, transport'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/playful_cat_ql3n.svg',
    title: 'Playful cat',
    tags: 'animal, fun, happy, purse'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/specs2_2jb3.svg',
    title: 'Specs',
    tags: 'working, office, colors, mobile, iphone, diary, notes, ink, pen'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/job_hunt_byf9.svg',
    title: 'Job hunt',
    tags: 'files, check, select, discovery, find, skills'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/file_searching_duff.svg',
    title: 'File searching',
    tags: 'analytics, charts, organize, papers'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Jogging_t14q.svg',
    title: 'Jogging',
    tags: 'woman, health, running, workout, watch, apple, samsung'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/collaboration2_8og0.svg',
    title: 'Collaboration',
    tags: 'file, man, woman, check, together, work'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/working2_ce2b.svg',
    title: 'Working',
    tags: 'coffee, colors, mobile, iphone, notes, office'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/experts3_3njd.svg',
    title: 'Experts',
    tags: 'man, woman, people, professional, experienced'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/windows_q9m0.svg',
    title: 'Windows',
    tags: 'browsers, profile, websites, tabs'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/destanation1_h3vq.svg',
    title: 'Destination',
    tags: 'travel, trip, woman, man, iphone, mobile, map'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Meditation_o89g.svg',
    title: 'Meditation',
    tags: 'workout, woman, gym, health, heart'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/opened_gi4n.svg',
    title: 'Opened',
    tags: 'messages, email, inbox, envelope, success, opened, received, accepted'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/growing_rk7d.svg',
    title: 'Growing',
    tags: 'charts, metrics, numbers, graphics, polls, analytics, statistics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/invite_i6u7.svg',
    title: 'Invite',
    tags: 'people, work, together, select, check, woman, man, profile'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pen_nqf7.svg',
    title: 'Pen tool',
    tags: 'tool, design, vector'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/checklist_7q37.svg',
    title: 'Checklist',
    tags: 'to do, man, boy, arrange'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/floating_61u6.svg',
    title: 'Floating',
    tags: 'man, woman, girl, boy, air, balloons, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/address_udes.svg',
    title: 'Address',
    tags: 'location, place, zip code, street'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/vault_9cmw.svg',
    title: 'Vault',
    tags: 'money, bank, deposit, safe, lock, secure'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/typing_jie3.svg',
    title: 'Typing',
    tags: 'communication, message, talk, sms, instant messaging, response, inbox, sent, chatbot, speak, language'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mail_box_kd5i.svg',
    title: 'Mailbox',
    tags: 'messages, email, inbox, envelope, success, opened, received, accepted'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/house_searching_n8mp.svg',
    title: 'House searching',
    tags: 'tree, building, real estate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/sync4_xlc6.svg',
    title: 'Sync',
    tags: 'apple, watch, iphone, mobile, devices, android, samsung, phablet, cell, apple, ios, touch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/notebook_g9x9.svg',
    title: 'Notebook',
    tags: 'coffee, working, office, glasses, book'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/alert_mc7b.svg',
    title: 'Alert',
    tags: 'security, pc, laptop, mobile, iphone, mac, safe'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/movie_night_93wl.svg',
    title: 'Movie night',
    tags: 'drink, popcorn, watch, fun'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/welcome_3gvl.svg',
    title: 'Welcome',
    tags: 'sign in, log in, happy, success, window, man, boy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/maintenance_cn7j.svg',
    title: 'Maintenance',
    tags: 'server, fast, cloud, database, upkeep, care, repair'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/setup_obqo.svg',
    title: 'Setup',
    tags: 'system, structure, organization, arrangement, framework, format, layout, composition'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/select_13cv.svg',
    title: 'Select',
    tags: 'iphone, devices, android, samsung, phablet, cell, apple, ios, touch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/presentation1_tqkp.svg',
    title: 'Presentation',
    tags: 'demonstration, talk, lecture, address, speech, show, exhibition, display, introduction, launch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/photo_sharing_1_85vy.svg',
    title: 'Photo sharing',
    tags: 'polaroid, moment, picture, mountain, landscape, media, files, png, svg, jpeg, jpg, capture, photography, twitter, facebook, google plus, pinterest, linkedin, chrome, safari, edge, mozilla'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mail_2_tqip.svg',
    title: 'Mail',
    tags: 'messages, email, inbox, envelope, success, opened, notification, received, outgoing, accepted, iphone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/camping_j8s0.svg',
    title: 'Camping',
    tags: 'bear, woods, happy, tree, fire, trip, vacation'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/safe_bnk7.svg',
    title: 'Safe',
    tags: 'security, browser, lock, chrome, safari, edge, mozilla, private'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/account_490v.svg',
    title: 'Account',
    tags: 'profile, report, record'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/processing_qj6a.svg',
    title: 'Processing',
    tags: 'method, pc, apple, mac, woman, working, office, systematic actions, convert'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/for_sale_viax.svg',
    title: 'For sale',
    tags: 'house, tree, sun, building, real estate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/data_xmfy.svg',
    title: 'Data',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, pie, bars, segmentation, polls, analytics, statistics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Golden_Gate_Bridge_00us.svg',
    title: 'Golden gate bridge',
    tags: 'sun, boat, ship, sea, river, sailing'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/calendar_dutt.svg',
    title: 'Calendar',
    tags: 'hour, appointment, meeting, month, day, clock'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_growth_d0y3.svg',
    title: 'Social growth',
    tags: 'twitter, facebook, google plus, pinterest, linkedin, chrome, safari, edge, mozilla'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/search_engines_nn9e.svg',
    title: 'Search engines',
    tags: 'results, google, bing, yahoo, yandex, filter, find, discover, results, ranking, seo, discover'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/server_q2pb.svg',
    title: 'Server',
    tags: 'pc, download, upload, fast, cloud, database'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/bus_stop_h370.svg',
    title: 'Bus stop',
    tags: 'dog, people, trees, happy, woman, girl, boy, man, road, waiting'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/relaxation_1_wbr7.svg',
    title: 'Relaxation',
    tags: 'sun, beach, happy, leisure, enjoyment'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/segment_uwu1.svg',
    title: 'Segment',
    tags: 'section, part, pc, mac, apple, browser, man'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/contrast_vb82.svg',
    title: 'Contrast',
    tags: 'browser, light, dark, difference, color, compare'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/browser_stats_704t.svg',
    title: 'Browser stats',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, pie, bars, segmentation, polls, analytics, chrome, safari, edge, mozilla'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/appreciation_2_v4bt.svg',
    title: 'Appreciation',
    tags: 'engage, collect, love, heart, click, gain, show, target'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/couple_a7s9.svg',
    title: 'Couple',
    tags: 'man, woman, romantic, girlfriend, boyfriend, love, together, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/create_f05x.svg',
    title: 'Create',
    tags: 'combine, feedback'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/morning_essentials_9fw8.svg',
    title: 'Morning essentials',
    tags: 'alarm, clock, coffee, mondays, wake up, warm, iphone, devices, android, samsung, cell, wireless, wifi, apple, ios, touch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/resume_folder_2_arse.svg',
    title: 'Resume folder',
    tags: 'work, cv, files, documents, reports, profiles, hiring, hire, office, business'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/images_aef7.svg',
    title: 'Images',
    tags: 'picture, mountain, landscape, memories, media, svg, png, jpeg, jpg, gif, files, photography, photos'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Astronaut_0o7w.svg',
    title: 'Astronaut',
    tags: 'space, flag, success, happy, achieve, stars'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/depi_wexf.svg',
    title: 'Depi',
    tags: 'woman, bikini, beach, tanning, swimsuit, swimwear, styling, fashion, young, bathing suit'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Building_leu4.svg',
    title: 'Building',
    tags: 'architecture, construction, home, house, sun, engineering, modeling, habitation'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/statistics_ctoq.svg',
    title: 'Statistics',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, graphics, infographics, pie, bars, segmentation, polls, analytics'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/passing_by_gqfk.svg',
    title: 'Passing by',
    tags: 'dog, cute, happy, peeing, stop'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Internet_on_the_go_5xx0.svg',
    title: 'Internet on the go',
    tags: 'iphone, devices, android, samsung, phablet, cell, wireless, wifi, responsive, apple, ios, touch, mobile, cellphone, tablet, ipad'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/resume_1hqp.svg',
    title: 'Resume',
    tags: 'work, cv, files, documents, reports, profiles, hiring, hire, office, business'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/snowman_1_a2ch.svg',
    title: 'Snowman',
    tags: 'christmas, holiday, freeze, cold, winter, new year, frosty, happy'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/autumn_2_ygk5.svg',
    title: 'Autumn',
    tags: 'fall, couple, woman, man, umbrella, bench, leaves, together, walk, life, love, romantic'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/social_tree_1_y9wa.svg',
    title: 'Social tree',
    tags: 'christmas, twitter, facebook, google plus, pinterest, linkedin, holiday, xmas, new year, gifts'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/working_woman_3uve.svg',
    title: 'Designer girl',
    tags: 'woman, pc, sitting, office, drawing, illustrator, sketch, photoshop, canvas, create, web design, modern'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/man_eiev.svg',
    title: 'Nerd',
    tags: 'man, glasses, happy, godin, tech, hipster, people, human, customer support'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/woman_mevk.svg',
    title: 'Woman',
    tags: 'call, happy, girl, mobile, dog, walk, happy, cell phone, dog sitting, trendy, hoodie'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/map_light_6ttm.svg',
    title: 'Map light',
    tags: 'destination, road, location, directions, pin, gps, guide, landmark, address, where, travel'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/photos_1nui.svg',
    title: 'Photos',
    tags: 'polaroid, moment, picture, mountain, landscape, media, files, png, svg, jpeg, jpg, capture, photography'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Posts_rskc.svg',
    title: 'Posts',
    tags: 'opinions, community, feedback, site, feed, stream, rss, news, readlist, items'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mobile_prle.svg',
    title: 'Mobile',
    tags: 'iphone, devices, android, samsung, phablet, cell, wireless, wifi, responsive, apple, ios, touch'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/folder_x4ft.svg',
    title: 'Image folder',
    tags: 'organize, photos, images, media, files, container, store'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/tabs_jf82.svg',
    title: 'Tabs',
    tags: 'browsers, profile, websites, portfolio, pages, social, images, twitter'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/travel_pb6m.svg',
    title: 'Yacht',
    tags: 'ship, boat, sea, sun, destination, cruise, travel, caribbean, luxury, money, billionaire, atlantic, sunbathe, holidays, summer'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/plain_credit_card_c8b8.svg',
    title: 'Plain credit card',
    tags: 'credit card, money, banks, bitcoin, plastic, chip, buy, sell, payments, transactions, swipe, stripe, braintree'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/portfolio_essv.svg',
    title: 'Portfolio',
    tags: 'personal, site, work, photos, gallery, images, page load, pages, websites, designer'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/analytics_5pgy.svg',
    title: 'Analytics',
    tags: 'charts, tabs, metrics, numbers, excel, analytics, statistics, graphics, infographics, pie, bars, segmentation, polls'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/files1_9ool.svg',
    title: 'Documents',
    tags: 'organize, work, read, files, media, reports, papers, analysis, stack, dropbox, copy, clone'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/chat_1wo5.svg',
    title: 'Chat',
    tags: 'communication, message, talk, sms, instant messaging, response, inbox, sent, chatbot, speak, language'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mail1_uab6.svg',
    title: 'Delivery',
    tags: 'travel, gps, location, road, mobile, iphone, landmark, invitation, invite, destination, locate'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/files_6b3d.svg',
    title: 'At work',
    tags: 'coffee, work, cv, resume, files, documents, reports, profiles, hiring, hire, office, business'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/Devices_e67q.svg',
    title: 'Devices',
    tags: 'pc, laptop, mobile, iphone, mac, tablet, ipad, screens, android, phablet, desktop, imac, apple, windows, responsive, web'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/charts_jj6t.svg',
    title: 'Charts',
    tags: 'analytics, metrics, numbers, excel, statistics, graphics, infographics, pie, bars, segmentation, polls'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/blog_anyj.svg',
    title: 'Blog post',
    tags: 'report, write, site, presentation, read, document, articles, posts, letter, learn'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/photo_4yb9.svg',
    title: 'Photo',
    tags: 'picture, mountain, landscape, memories, media, svg, png, jpeg, jpg, gif, files, images, photography'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/map_dros.svg',
    title: 'Map dark',
    tags: 'destination, road, location, directions, pin, gps, guide, landmark, address, where'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/search_2dfv.svg',
    title: 'Search',
    tags: 'results, google, bing, yahoo, yandex, filter, find, discover, results, ranking, seo, discover'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/mail_cg1t.svg',
    title: 'Mail sent',
    tags: 'messages, email, inbox, envelope, success, opened, notification, received, outgoing, accepted'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/pcsocial_16rw.svg',
    title: 'Social media',
    tags: 'pc, facebook, twitter, google, pinterest, likedin, community, work, office, coffee, at work, marketing, marketer, outreach, viral'
  },
  {
    image:
      'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/credit_card_df1m.svg',
    title: 'Credit card',
    tags: 'credit card, money, banks, bitcoin, plastic, chip, buy, sell, payments, transactions, swipe, stripe, braintree'
  }
]


/***/ }),

/***/ "./src/helpers/lis.js":
/*!****************************!*\
  !*** ./src/helpers/lis.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LIS": () => (/* binding */ LIS)
/* harmony export */ });
// DEFINED ALIASES FOR SOME COMMON LONG NAMED FUNCTIONS
const LIS = {
  id: function (id) {
    return document.getElementById(id)
  },
  remove: function (id) {
    document.getElementById(id).parentNode.removeChild(document.getElementById(id))
  }
}


/***/ }),

/***/ "./src/views/skills/color-picker/setup-color-picker.js":
/*!*************************************************************!*\
  !*** ./src/views/skills/color-picker/setup-color-picker.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setupColorPicker": () => (/* binding */ setupColorPicker)
/* harmony export */ });
/* harmony import */ var _load_illustrations_state_all_paths__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../load-illustrations/state/all-paths */ "./src/views/skills/load-illustrations/state/all-paths.js");
/* harmony import */ var vanilla_picker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vanilla-picker */ "./node_modules/vanilla-picker/dist/vanilla-picker.mjs");
/* harmony import */ var _load_illustrations_state_past_color__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../load-illustrations/state/past-color */ "./src/views/skills/load-illustrations/state/past-color.js");
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Color picker @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



let newColor
const setupColorPicker = () => {
  const parent = document.querySelector('#parent')
  if (parent) {
    const picker = new vanilla_picker__WEBPACK_IMPORTED_MODULE_1__["default"](parent)
    picker.onChange = function (color) {
      // Fill allPaths with pathes of SVGs inside 'img-container' div (undraw illustrations)
      if (!_load_illustrations_state_all_paths__WEBPACK_IMPORTED_MODULE_0__.allPaths.current) {
        _load_illustrations_state_all_paths__WEBPACK_IMPORTED_MODULE_0__.allPaths.current = Array.from(
          document.querySelectorAll('.img-container')
        )
          .map((a) => Array.from(a.children[0].querySelectorAll('*')))
          .flat()
      }
      parent.style.background = color.hex
      newColor = color.hex
      _load_illustrations_state_all_paths__WEBPACK_IMPORTED_MODULE_0__.allPaths.current.forEach((path) => {
        if (path.getAttribute('fill') === _load_illustrations_state_past_color__WEBPACK_IMPORTED_MODULE_2__.pastColor.current) {
          path.setAttribute('fill', newColor)
        }
      })
      _load_illustrations_state_past_color__WEBPACK_IMPORTED_MODULE_2__.pastColor.current = newColor
      // TODO: unselect radio box
    }
  }
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/helpers/build-miniatures-grid.js":
/*!******************************************************************************!*\
  !*** ./src/views/skills/load-illustrations/helpers/build-miniatures-grid.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buildMiniaturesGrid": () => (/* binding */ buildMiniaturesGrid)
/* harmony export */ });
/* harmony import */ var svg_injector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svg-injector */ "./node_modules/svg-injector/svg-injector.js");
/* harmony import */ var svg_injector__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(svg_injector__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _state_lightbox__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../state/lightbox */ "./src/views/skills/load-illustrations/state/lightbox.js");
/* harmony import */ var _state_all_paths__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../state/all-paths */ "./src/views/skills/load-illustrations/state/all-paths.js");
/* harmony import */ var _chosen_img__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chosen-img */ "./src/views/skills/load-illustrations/helpers/chosen-img.js");




/**
 * build Miniatures Grid with undraw illustrations
 * @param {String} urls
 */
function buildMiniaturesGrid (urls) {
  // Empty 'img-container' parent div from possible earlier images
  const paras = document.getElementsByClassName('img-container')
  while (paras[0]) {
    paras[0].parentNode.removeChild(paras[0])
  }
  // Empty 'allPaths' from possible earlier SVGs
  _state_all_paths__WEBPACK_IMPORTED_MODULE_2__.allPaths.current = undefined
  // Define new 'img-container' divs
  window.chosenImg = _chosen_img__WEBPACK_IMPORTED_MODULE_3__.chosenImg
  urls.forEach((url, idx) => {
    const container = `<div class="img-container">
      <img class="svgg" src="${url}"/> 
      <input type="radio" class="img-radio" name="img_radio" id="${idx}"
      onclick="javascript:chosenImg(this)" />
    </div>`
    document
      .getElementById('undraw-input')
      .insertAdjacentHTML('beforeend', container)
  })
  // Convert img tags to full SVG markups
  setTimeout(() => {
    try {
      const IMGs = document.querySelectorAll('img.svgg')
      svg_injector__WEBPACK_IMPORTED_MODULE_0___default()(IMGs)
      setTimeout(() => {
        const SVGs = Array.from(
          document.querySelectorAll('.img-container svgg')
        )
        SVGs.forEach((svg, idx) => {
          svg.onclick = function () {
            _state_lightbox__WEBPACK_IMPORTED_MODULE_1__.lightbox.current.showPosition(idx)
          }
        })
      }, 2000)
    } catch (error) {
      console.error(error)
    }
  }, 2000)
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/helpers/chosen-img.js":
/*!*******************************************************************!*\
  !*** ./src/views/skills/load-illustrations/helpers/chosen-img.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "chosenImg": () => (/* binding */ chosenImg)
/* harmony export */ });
/* harmony import */ var _helpers_lis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../helpers/lis */ "./src/helpers/lis.js");
/* harmony import */ var _state_lightbox__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../state/lightbox */ "./src/views/skills/load-illustrations/state/lightbox.js");
/* harmony import */ var _state_past_color__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../state/past-color */ "./src/views/skills/load-illustrations/state/past-color.js");
// Hopefully this stays online for a while
// https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.
// ssl.cf5.rackcdn.com/illustrations/




/**
 * chosen Img
 * @param {dom} radio
 */
function chosenImg (radio) {
  const svgURL = _state_lightbox__WEBPACK_IMPORTED_MODULE_1__.lightbox.current.items[radio.id]
  const chosen = svgURL.split('/')[4].split('.')[0]
  if (chosen) {
    const undrawInput = _helpers_lis__WEBPACK_IMPORTED_MODULE_0__.LIS.id('undraw')
    undrawInput.value = chosen + _state_past_color__WEBPACK_IMPORTED_MODULE_2__.pastColor.current
  }
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/helpers/get-all-indexes.js":
/*!************************************************************************!*\
  !*** ./src/views/skills/load-illustrations/helpers/get-all-indexes.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getAllIndexes": () => (/* binding */ getAllIndexes)
/* harmony export */ });
/* harmony import */ var _data_undraw__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../data/undraw */ "./src/data/undraw.js");
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ SIMPLELIGHTBOX @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// simpleLightbox


/**
 * getAllIndexes
 * @param {Array} arr
 * @param {number} val
 * @return {Array} indexes
 */
function getAllIndexes (arr, val) {
  const indexes = []
  let i
  for (i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      indexes.push(i)
    }
  }
  return indexes
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/load-illustrations.js":
/*!*******************************************************************!*\
  !*** ./src/views/skills/load-illustrations/load-illustrations.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "loadIllustrations": () => (/* binding */ loadIllustrations)
/* harmony export */ });
/* harmony import */ var simple_lightbox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! simple-lightbox */ "./node_modules/simple-lightbox/src/simpleLightbox.js");
/* harmony import */ var simple_lightbox__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(simple_lightbox__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _data_undraw__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../data/undraw */ "./src/data/undraw.js");
/* harmony import */ var _helpers_build_miniatures_grid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/build-miniatures-grid */ "./src/views/skills/load-illustrations/helpers/build-miniatures-grid.js");
/* harmony import */ var _helpers_get_all_indexes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers/get-all-indexes */ "./src/views/skills/load-illustrations/helpers/get-all-indexes.js");
/* harmony import */ var _state_lightbox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./state/lightbox */ "./src/views/skills/load-illustrations/state/lightbox.js");
/**
 * loads Illustrations
 * @param {dom} keyword
 */






let corpus = []
if (typeof _data_undraw__WEBPACK_IMPORTED_MODULE_1__.undrawGallery !== 'undefined') {
  corpus = _data_undraw__WEBPACK_IMPORTED_MODULE_1__.undrawGallery.map((a) => a.tags.split(', '))
}
const loadIllustrations = (keyword) => {
  if (_state_lightbox__WEBPACK_IMPORTED_MODULE_4__.lightbox.current) {
    _state_lightbox__WEBPACK_IMPORTED_MODULE_4__.lightbox.current.destroy()
  }
  if (corpus.length && keyword.value) {
    const scoreIt = (tags) =>
      tags.indexOf(keyword.value) > -1 && 1 / tags.length
    const scores = corpus.map(scoreIt)
    const bestImgIdx = (0,_helpers_get_all_indexes__WEBPACK_IMPORTED_MODULE_3__.getAllIndexes)(scores, Math.max(...scores))
    const simpleLightboxInput = bestImgIdx
      .map((idx) => _data_undraw__WEBPACK_IMPORTED_MODULE_1__.undrawGallery[idx].image)
      .slice(0, 3)
    if (simpleLightboxInput.length) {
      _state_lightbox__WEBPACK_IMPORTED_MODULE_4__.lightbox.current = simple_lightbox__WEBPACK_IMPORTED_MODULE_0___default().open({
        items: simpleLightboxInput
      })
      ;(0,_helpers_build_miniatures_grid__WEBPACK_IMPORTED_MODULE_2__.buildMiniaturesGrid)(simpleLightboxInput)
    }
  }
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/state/all-paths.js":
/*!****************************************************************!*\
  !*** ./src/views/skills/load-illustrations/state/all-paths.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "allPaths": () => (/* binding */ allPaths)
/* harmony export */ });
const allPaths = {
  current: undefined
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/state/lightbox.js":
/*!***************************************************************!*\
  !*** ./src/views/skills/load-illustrations/state/lightbox.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lightbox": () => (/* binding */ lightbox)
/* harmony export */ });
const lightbox = {
  current: undefined
}


/***/ }),

/***/ "./src/views/skills/load-illustrations/state/past-color.js":
/*!*****************************************************************!*\
  !*** ./src/views/skills/load-illustrations/state/past-color.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pastColor": () => (/* binding */ pastColor)
/* harmony export */ });
const pastColor = {
  current: '#6c63ff'
}


/***/ }),

/***/ "./node_modules/vanilla-picker/dist/vanilla-picker.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/vanilla-picker/dist/vanilla-picker.mjs ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

String.prototype.startsWith = String.prototype.startsWith || function (needle) {
    return this.indexOf(needle) === 0;
};
String.prototype.padStart = String.prototype.padStart || function (len, pad) {
    var str = this;while (str.length < len) {
        str = pad + str;
    }return str;
};

var colorNames = { cb: '0f8ff', tqw: 'aebd7', q: '-ffff', qmrn: '7fffd4', zr: '0ffff', bg: '5f5dc', bsq: 'e4c4', bck: '---', nch: 'ebcd', b: '--ff', bvt: '8a2be2', brwn: 'a52a2a', brw: 'deb887', ctb: '5f9ea0', hrt: '7fff-', chcT: 'd2691e', cr: '7f50', rnw: '6495ed', crns: '8dc', crms: 'dc143c', cn: '-ffff', Db: '--8b', Dcn: '-8b8b', Dgnr: 'b8860b', Dgr: 'a9a9a9', Dgrn: '-64-', Dkhk: 'bdb76b', Dmgn: '8b-8b', Dvgr: '556b2f', Drng: '8c-', Drch: '9932cc', Dr: '8b--', Dsmn: 'e9967a', Dsgr: '8fbc8f', DsTb: '483d8b', DsTg: '2f4f4f', Dtrq: '-ced1', Dvt: '94-d3', ppnk: '1493', pskb: '-bfff', mgr: '696969', grb: '1e90ff', rbrc: 'b22222', rwht: 'af0', stg: '228b22', chs: '-ff', gnsb: 'dcdcdc', st: '8f8ff', g: 'd7-', gnr: 'daa520', gr: '808080', grn: '-8-0', grnw: 'adff2f', hnw: '0fff0', htpn: '69b4', nnr: 'cd5c5c', ng: '4b-82', vr: '0', khk: '0e68c', vnr: 'e6e6fa', nrb: '0f5', wngr: '7cfc-', mnch: 'acd', Lb: 'add8e6', Lcr: '08080', Lcn: 'e0ffff', Lgnr: 'afad2', Lgr: 'd3d3d3', Lgrn: '90ee90', Lpnk: 'b6c1', Lsmn: 'a07a', Lsgr: '20b2aa', Lskb: '87cefa', LsTg: '778899', Lstb: 'b0c4de', Lw: 'e0', m: '-ff-', mgrn: '32cd32', nn: 'af0e6', mgnt: '-ff', mrn: '8--0', mqm: '66cdaa', mmb: '--cd', mmrc: 'ba55d3', mmpr: '9370db', msg: '3cb371', mmsT: '7b68ee', '': '-fa9a', mtr: '48d1cc', mmvt: 'c71585', mnLb: '191970', ntc: '5fffa', mstr: 'e4e1', mccs: 'e4b5', vjw: 'dead', nv: '--80', c: 'df5e6', v: '808-0', vrb: '6b8e23', rng: 'a5-', rngr: '45-', rch: 'da70d6', pgnr: 'eee8aa', pgrn: '98fb98', ptrq: 'afeeee', pvtr: 'db7093', ppwh: 'efd5', pchp: 'dab9', pr: 'cd853f', pnk: 'c0cb', pm: 'dda0dd', pwrb: 'b0e0e6', prp: '8-080', cc: '663399', r: '--', sbr: 'bc8f8f', rb: '4169e1', sbrw: '8b4513', smn: 'a8072', nbr: '4a460', sgrn: '2e8b57', ssh: '5ee', snn: 'a0522d', svr: 'c0c0c0', skb: '87ceeb', sTb: '6a5acd', sTgr: '708090', snw: 'afa', n: '-ff7f', stb: '4682b4', tn: 'd2b48c', t: '-8080', thst: 'd8bfd8', tmT: '6347', trqs: '40e0d0', vt: 'ee82ee', whT: '5deb3', wht: '', hts: '5f5f5', w: '-', wgrn: '9acd32' };

function printNum(num) {
    var decs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var str = decs > 0 ? num.toFixed(decs).replace(/0+$/, '').replace(/\.$/, '') : num.toString();
    return str || '0';
}

var Color = function () {
    function Color(r, g, b, a) {
        classCallCheck(this, Color);


        var that = this;
        function parseString(input) {

            if (input.startsWith('hsl')) {
                var _input$match$map = input.match(/([\-\d\.e]+)/g).map(Number),
                    _input$match$map2 = slicedToArray(_input$match$map, 4),
                    h = _input$match$map2[0],
                    s = _input$match$map2[1],
                    l = _input$match$map2[2],
                    _a = _input$match$map2[3];

                if (_a === undefined) {
                    _a = 1;
                }

                h /= 360;
                s /= 100;
                l /= 100;
                that.hsla = [h, s, l, _a];
            } else if (input.startsWith('rgb')) {
                var _input$match$map3 = input.match(/([\-\d\.e]+)/g).map(Number),
                    _input$match$map4 = slicedToArray(_input$match$map3, 4),
                    _r = _input$match$map4[0],
                    _g = _input$match$map4[1],
                    _b = _input$match$map4[2],
                    _a2 = _input$match$map4[3];

                if (_a2 === undefined) {
                    _a2 = 1;
                }

                that.rgba = [_r, _g, _b, _a2];
            } else {
                if (input.startsWith('#')) {
                    that.rgba = Color.hexToRgb(input);
                } else {
                    that.rgba = Color.nameToRgb(input) || Color.hexToRgb(input);
                }
            }
        }

        if (r === undefined) ; else if (Array.isArray(r)) {
            this.rgba = r;
        } else if (b === undefined) {
            var color = r && '' + r;
            if (color) {
                parseString(color.toLowerCase());
            }
        } else {
            this.rgba = [r, g, b, a === undefined ? 1 : a];
        }
    }

    createClass(Color, [{
        key: 'printRGB',
        value: function printRGB(alpha) {
            var rgb = alpha ? this.rgba : this.rgba.slice(0, 3),
                vals = rgb.map(function (x, i) {
                return printNum(x, i === 3 ? 3 : 0);
            });

            return alpha ? 'rgba(' + vals + ')' : 'rgb(' + vals + ')';
        }
    }, {
        key: 'printHSL',
        value: function printHSL(alpha) {
            var mults = [360, 100, 100, 1],
                suff = ['', '%', '%', ''];

            var hsl = alpha ? this.hsla : this.hsla.slice(0, 3),
                vals = hsl.map(function (x, i) {
                return printNum(x * mults[i], i === 3 ? 3 : 1) + suff[i];
            });

            return alpha ? 'hsla(' + vals + ')' : 'hsl(' + vals + ')';
        }
    }, {
        key: 'printHex',
        value: function printHex(alpha) {
            var hex = this.hex;
            return alpha ? hex : hex.substring(0, 7);
        }
    }, {
        key: 'rgba',
        get: function get$$1() {
            if (this._rgba) {
                return this._rgba;
            }
            if (!this._hsla) {
                throw new Error('No color is set');
            }

            return this._rgba = Color.hslToRgb(this._hsla);
        },
        set: function set$$1(rgb) {
            if (rgb.length === 3) {
                rgb[3] = 1;
            }

            this._rgba = rgb;
            this._hsla = null;
        }
    }, {
        key: 'rgbString',
        get: function get$$1() {
            return this.printRGB();
        }
    }, {
        key: 'rgbaString',
        get: function get$$1() {
            return this.printRGB(true);
        }
    }, {
        key: 'hsla',
        get: function get$$1() {
            if (this._hsla) {
                return this._hsla;
            }
            if (!this._rgba) {
                throw new Error('No color is set');
            }

            return this._hsla = Color.rgbToHsl(this._rgba);
        },
        set: function set$$1(hsl) {
            if (hsl.length === 3) {
                hsl[3] = 1;
            }

            this._hsla = hsl;
            this._rgba = null;
        }
    }, {
        key: 'hslString',
        get: function get$$1() {
            return this.printHSL();
        }
    }, {
        key: 'hslaString',
        get: function get$$1() {
            return this.printHSL(true);
        }
    }, {
        key: 'hex',
        get: function get$$1() {
            var rgb = this.rgba,
                hex = rgb.map(function (x, i) {
                return i < 3 ? x.toString(16) : Math.round(x * 255).toString(16);
            });

            return '#' + hex.map(function (x) {
                return x.padStart(2, '0');
            }).join('');
        },
        set: function set$$1(hex) {
            this.rgba = Color.hexToRgb(hex);
        }
    }], [{
        key: 'hexToRgb',
        value: function hexToRgb(input) {

            var hex = (input.startsWith('#') ? input.slice(1) : input).replace(/^(\w{3})$/, '$1F').replace(/^(\w)(\w)(\w)(\w)$/, '$1$1$2$2$3$3$4$4').replace(/^(\w{6})$/, '$1FF');

            if (!hex.match(/^([0-9a-fA-F]{8})$/)) {
                throw new Error('Unknown hex color; ' + input);
            }

            var rgba = hex.match(/^(\w\w)(\w\w)(\w\w)(\w\w)$/).slice(1).map(function (x) {
                return parseInt(x, 16);
            });

            rgba[3] = rgba[3] / 255;
            return rgba;
        }
    }, {
        key: 'nameToRgb',
        value: function nameToRgb(input) {

            var hash = input.toLowerCase().replace('at', 'T').replace(/[aeiouyldf]/g, '').replace('ght', 'L').replace('rk', 'D').slice(-5, 4),
                hex = colorNames[hash];
            return hex === undefined ? hex : Color.hexToRgb(hex.replace(/\-/g, '00').padStart(6, 'f'));
        }
    }, {
        key: 'rgbToHsl',
        value: function rgbToHsl(_ref) {
            var _ref2 = slicedToArray(_ref, 4),
                r = _ref2[0],
                g = _ref2[1],
                b = _ref2[2],
                a = _ref2[3];

            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            var h = void 0,
                s = void 0,
                l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);break;
                    case g:
                        h = (b - r) / d + 2;break;
                    case b:
                        h = (r - g) / d + 4;break;
                }

                h /= 6;
            }

            return [h, s, l, a];
        }
    }, {
        key: 'hslToRgb',
        value: function hslToRgb(_ref3) {
            var _ref4 = slicedToArray(_ref3, 4),
                h = _ref4[0],
                s = _ref4[1],
                l = _ref4[2],
                a = _ref4[3];

            var r = void 0,
                g = void 0,
                b = void 0;

            if (s === 0) {
                r = g = b = l;
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;

                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            var rgba = [r * 255, g * 255, b * 255].map(Math.round);
            rgba[3] = a;

            return rgba;
        }
    }]);
    return Color;
}();

var EventBucket = function () {
    function EventBucket() {
        classCallCheck(this, EventBucket);

        this._events = [];
    }

    createClass(EventBucket, [{
        key: 'add',
        value: function add(target, type, handler) {
            target.addEventListener(type, handler, false);
            this._events.push({
                target: target,
                type: type,
                handler: handler
            });
        }
    }, {
        key: 'remove',
        value: function remove(target, type, handler) {
            this._events = this._events.filter(function (e) {
                var isMatch = true;
                if (target && target !== e.target) {
                    isMatch = false;
                }
                if (type && type !== e.type) {
                    isMatch = false;
                }
                if (handler && handler !== e.handler) {
                    isMatch = false;
                }

                if (isMatch) {
                    EventBucket._doRemove(e.target, e.type, e.handler);
                }
                return !isMatch;
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this._events.forEach(function (e) {
                return EventBucket._doRemove(e.target, e.type, e.handler);
            });
            this._events = [];
        }
    }], [{
        key: '_doRemove',
        value: function _doRemove(target, type, handler) {
            target.removeEventListener(type, handler, false);
        }
    }]);
    return EventBucket;
}();

function parseHTML(htmlString) {

    var div = document.createElement('div');
    div.innerHTML = htmlString;
    return div.firstElementChild;
}

function dragTrack(eventBucket, area, callback) {
    var dragging = false;

    function clamp(val, min, max) {
        return Math.max(min, Math.min(val, max));
    }

    function onMove(e, info, starting) {
        if (starting) {
            dragging = true;
        }
        if (!dragging) {
            return;
        }

        e.preventDefault();

        var bounds = area.getBoundingClientRect(),
            w = bounds.width,
            h = bounds.height,
            x = info.clientX,
            y = info.clientY;

        var relX = clamp(x - bounds.left, 0, w),
            relY = clamp(y - bounds.top, 0, h);

        callback(relX / w, relY / h);
    }

    function onMouse(e, starting) {
        var button = e.buttons === undefined ? e.which : e.buttons;
        if (button === 1) {
            onMove(e, e, starting);
        } else {
            dragging = false;
        }
    }

    function onTouch(e, starting) {
        if (e.touches.length === 1) {
            onMove(e, e.touches[0], starting);
        } else {
            dragging = false;
        }
    }

    eventBucket.add(area, 'mousedown', function (e) {
        onMouse(e, true);
    });
    eventBucket.add(area, 'touchstart', function (e) {
        onTouch(e, true);
    });
    eventBucket.add(window, 'mousemove', onMouse);
    eventBucket.add(area, 'touchmove', onTouch);
    eventBucket.add(window, 'mouseup', function (e) {
        dragging = false;
    });
    eventBucket.add(area, 'touchend', function (e) {
        dragging = false;
    });
    eventBucket.add(area, 'touchcancel', function (e) {
        dragging = false;
    });
}

var BG_TRANSP = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'2\' height=\'2\'%3E%3Cpath d=\'M1,0H0V1H2V2H1\' fill=\'lightgrey\'/%3E%3C/svg%3E")';
var HUES = 360;

var EVENT_KEY = 'keydown',
    EVENT_CLICK_OUTSIDE = 'mousedown',
    EVENT_TAB_MOVE = 'focusin';

function $(selector, context) {
    return (context || document).querySelector(selector);
}

function stopEvent(e) {

    e.preventDefault();
    e.stopPropagation();
}
function onKey(bucket, target, keys, handler, stop) {
    bucket.add(target, EVENT_KEY, function (e) {
        if (keys.indexOf(e.key) >= 0) {
            if (stop) {
                stopEvent(e);
            }
            handler(e);
        }
    });
}

var _style = document.createElement('style');
_style.textContent = '.picker_wrapper.no_alpha .picker_alpha{display:none}.picker_wrapper.no_editor .picker_editor{position:absolute;z-index:-1;opacity:0}.picker_wrapper.no_cancel .picker_cancel{display:none}.layout_default.picker_wrapper{display:-webkit-box;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;flex-flow:row wrap;-webkit-box-pack:justify;justify-content:space-between;-webkit-box-align:stretch;align-items:stretch;font-size:10px;width:25em;padding:.5em}.layout_default.picker_wrapper input,.layout_default.picker_wrapper button{font-size:1rem}.layout_default.picker_wrapper>*{margin:.5em}.layout_default.picker_wrapper::before{content:\'\';display:block;width:100%;height:0;-webkit-box-ordinal-group:2;order:1}.layout_default .picker_slider,.layout_default .picker_selector{padding:1em}.layout_default .picker_hue{width:100%}.layout_default .picker_sl{-webkit-box-flex:1;flex:1 1 auto}.layout_default .picker_sl::before{content:\'\';display:block;padding-bottom:100%}.layout_default .picker_editor{-webkit-box-ordinal-group:2;order:1;width:6.5rem}.layout_default .picker_editor input{width:100%;height:100%}.layout_default .picker_sample{-webkit-box-ordinal-group:2;order:1;-webkit-box-flex:1;flex:1 1 auto}.layout_default .picker_done,.layout_default .picker_cancel{-webkit-box-ordinal-group:2;order:1}.picker_wrapper{box-sizing:border-box;background:#f2f2f2;box-shadow:0 0 0 1px silver;cursor:default;font-family:sans-serif;color:#444;pointer-events:auto}.picker_wrapper:focus{outline:none}.picker_wrapper button,.picker_wrapper input{box-sizing:border-box;border:none;box-shadow:0 0 0 1px silver;outline:none}.picker_wrapper button:focus,.picker_wrapper button:active,.picker_wrapper input:focus,.picker_wrapper input:active{box-shadow:0 0 2px 1px dodgerblue}.picker_wrapper button{padding:.4em .6em;cursor:pointer;background-color:whitesmoke;background-image:-webkit-gradient(linear, left bottom, left top, from(gainsboro), to(transparent));background-image:linear-gradient(0deg, gainsboro, transparent)}.picker_wrapper button:active{background-image:-webkit-gradient(linear, left bottom, left top, from(transparent), to(gainsboro));background-image:linear-gradient(0deg, transparent, gainsboro)}.picker_wrapper button:hover{background-color:white}.picker_selector{position:absolute;z-index:1;display:block;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%);border:2px solid white;border-radius:100%;box-shadow:0 0 3px 1px #67b9ff;background:currentColor;cursor:pointer}.picker_slider .picker_selector{border-radius:2px}.picker_hue{position:relative;background-image:-webkit-gradient(linear, left top, right top, from(red), color-stop(yellow), color-stop(lime), color-stop(cyan), color-stop(blue), color-stop(magenta), to(red));background-image:linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);box-shadow:0 0 0 1px silver}.picker_sl{position:relative;box-shadow:0 0 0 1px silver;background-image:-webkit-gradient(linear, left top, left bottom, from(white), color-stop(50%, rgba(255,255,255,0))),-webkit-gradient(linear, left bottom, left top, from(black), color-stop(50%, rgba(0,0,0,0))),-webkit-gradient(linear, left top, right top, from(gray), to(rgba(128,128,128,0)));background-image:linear-gradient(180deg, white, rgba(255,255,255,0) 50%),linear-gradient(0deg, black, rgba(0,0,0,0) 50%),linear-gradient(90deg, gray, rgba(128,128,128,0))}.picker_alpha,.picker_sample{position:relative;background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'2\' height=\'2\'%3E%3Cpath d=\'M1,0H0V1H2V2H1\' fill=\'lightgrey\'/%3E%3C/svg%3E") left top/contain white;box-shadow:0 0 0 1px silver}.picker_alpha .picker_selector,.picker_sample .picker_selector{background:none}.picker_editor input{font-family:monospace;padding:.2em .4em}.picker_sample::before{content:\'\';position:absolute;display:block;width:100%;height:100%;background:currentColor}.picker_arrow{position:absolute;z-index:-1}.picker_wrapper.popup{position:absolute;z-index:2;margin:1.5em}.picker_wrapper.popup,.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{background:#f2f2f2;box-shadow:0 0 10px 1px rgba(0,0,0,0.4)}.picker_wrapper.popup .picker_arrow{width:3em;height:3em;margin:0}.picker_wrapper.popup .picker_arrow::before,.picker_wrapper.popup .picker_arrow::after{content:"";display:block;position:absolute;top:0;left:0;z-index:-99}.picker_wrapper.popup .picker_arrow::before{width:100%;height:100%;-webkit-transform:skew(45deg);transform:skew(45deg);-webkit-transform-origin:0 100%;transform-origin:0 100%}.picker_wrapper.popup .picker_arrow::after{width:150%;height:150%;box-shadow:none}.popup.popup_top{bottom:100%;left:0}.popup.popup_top .picker_arrow{bottom:0;left:0;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.popup.popup_bottom{top:100%;left:0}.popup.popup_bottom .picker_arrow{top:0;left:0;-webkit-transform:rotate(90deg) scale(1, -1);transform:rotate(90deg) scale(1, -1)}.popup.popup_left{top:0;right:100%}.popup.popup_left .picker_arrow{top:0;right:0;-webkit-transform:scale(-1, 1);transform:scale(-1, 1)}.popup.popup_right{top:0;left:100%}.popup.popup_right .picker_arrow{top:0;left:0}';
document.documentElement.firstElementChild.appendChild(_style);

var Picker = function () {
    function Picker(options) {
        classCallCheck(this, Picker);


        this.settings = {

            popup: 'right',
            layout: 'default',
            alpha: true,
            editor: true,
            editorFormat: 'hex',
            cancelButton: false,
            defaultColor: '#0cf'
        };

        this._events = new EventBucket();

        this.onChange = null;

        this.onDone = null;

        this.onOpen = null;

        this.onClose = null;

        this.setOptions(options);
    }

    createClass(Picker, [{
        key: 'setOptions',
        value: function setOptions(options) {
            var _this = this;

            if (!options) {
                return;
            }
            var settings = this.settings;

            function transfer(source, target, skipKeys) {
                for (var key in source) {
                    if (skipKeys && skipKeys.indexOf(key) >= 0) {
                        continue;
                    }

                    target[key] = source[key];
                }
            }

            if (options instanceof HTMLElement) {
                settings.parent = options;
            } else {

                if (settings.parent && options.parent && settings.parent !== options.parent) {
                    this._events.remove(settings.parent);
                    this._popupInited = false;
                }

                transfer(options, settings);

                if (options.onChange) {
                    this.onChange = options.onChange;
                }
                if (options.onDone) {
                    this.onDone = options.onDone;
                }
                if (options.onOpen) {
                    this.onOpen = options.onOpen;
                }
                if (options.onClose) {
                    this.onClose = options.onClose;
                }

                var col = options.color || options.colour;
                if (col) {
                    this._setColor(col);
                }
            }

            var parent = settings.parent;
            if (parent && settings.popup && !this._popupInited) {

                var openProxy = function openProxy(e) {
                    return _this.openHandler(e);
                };

                this._events.add(parent, 'click', openProxy);

                onKey(this._events, parent, [' ', 'Spacebar', 'Enter'], openProxy);

                this._popupInited = true;
            } else if (options.parent && !settings.popup) {
                this.show();
            }
        }
    }, {
        key: 'openHandler',
        value: function openHandler(e) {
            if (this.show()) {

                e && e.preventDefault();

                this.settings.parent.style.pointerEvents = 'none';

                var toFocus = e && e.type === EVENT_KEY ? this._domEdit : this.domElement;
                setTimeout(function () {
                    return toFocus.focus();
                }, 100);

                if (this.onOpen) {
                    this.onOpen(this.colour);
                }
            }
        }
    }, {
        key: 'closeHandler',
        value: function closeHandler(e) {
            var event = e && e.type;
            var doHide = false;

            if (!e) {
                doHide = true;
            } else if (event === EVENT_CLICK_OUTSIDE || event === EVENT_TAB_MOVE) {

                var knownTime = (this.__containedEvent || 0) + 100;
                if (e.timeStamp > knownTime) {
                    doHide = true;
                }
            } else {

                stopEvent(e);

                doHide = true;
            }

            if (doHide && this.hide()) {
                this.settings.parent.style.pointerEvents = '';

                if (event !== EVENT_CLICK_OUTSIDE) {
                    this.settings.parent.focus();
                }

                if (this.onClose) {
                    this.onClose(this.colour);
                }
            }
        }
    }, {
        key: 'movePopup',
        value: function movePopup(options, open) {

            this.closeHandler();

            this.setOptions(options);
            if (open) {
                this.openHandler();
            }
        }
    }, {
        key: 'setColor',
        value: function setColor(color, silent) {
            this._setColor(color, { silent: silent });
        }
    }, {
        key: '_setColor',
        value: function _setColor(color, flags) {
            if (typeof color === 'string') {
                color = color.trim();
            }
            if (!color) {
                return;
            }

            flags = flags || {};
            var c = void 0;
            try {

                c = new Color(color);
            } catch (ex) {
                if (flags.failSilently) {
                    return;
                }
                throw ex;
            }

            if (!this.settings.alpha) {
                var hsla = c.hsla;
                hsla[3] = 1;
                c.hsla = hsla;
            }
            this.colour = this.color = c;
            this._setHSLA(null, null, null, null, flags);
        }
    }, {
        key: 'setColour',
        value: function setColour(colour, silent) {
            this.setColor(colour, silent);
        }
    }, {
        key: 'show',
        value: function show() {
            var parent = this.settings.parent;
            if (!parent) {
                return false;
            }

            if (this.domElement) {
                var toggled = this._toggleDOM(true);

                this._setPosition();

                return toggled;
            }

            var html = this.settings.template || '<div class="picker_wrapper" tabindex="-1"><div class="picker_arrow"></div><div class="picker_hue picker_slider"><div class="picker_selector"></div></div><div class="picker_sl"><div class="picker_selector"></div></div><div class="picker_alpha picker_slider"><div class="picker_selector"></div></div><div class="picker_editor"><input aria-label="Type a color name or hex value"/></div><div class="picker_sample"></div><div class="picker_done"><button>Ok</button></div><div class="picker_cancel"><button>Cancel</button></div></div>';
            var wrapper = parseHTML(html);

            this.domElement = wrapper;
            this._domH = $('.picker_hue', wrapper);
            this._domSL = $('.picker_sl', wrapper);
            this._domA = $('.picker_alpha', wrapper);
            this._domEdit = $('.picker_editor input', wrapper);
            this._domSample = $('.picker_sample', wrapper);
            this._domOkay = $('.picker_done button', wrapper);
            this._domCancel = $('.picker_cancel button', wrapper);

            wrapper.classList.add('layout_' + this.settings.layout);
            if (!this.settings.alpha) {
                wrapper.classList.add('no_alpha');
            }
            if (!this.settings.editor) {
                wrapper.classList.add('no_editor');
            }
            if (!this.settings.cancelButton) {
                wrapper.classList.add('no_cancel');
            }
            this._ifPopup(function () {
                return wrapper.classList.add('popup');
            });

            this._setPosition();

            if (this.colour) {
                this._updateUI();
            } else {
                this._setColor(this.settings.defaultColor);
            }
            this._bindEvents();

            return true;
        }
    }, {
        key: 'hide',
        value: function hide() {
            return this._toggleDOM(false);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this._events.destroy();
            if (this.domElement) {
                this.settings.parent.removeChild(this.domElement);
            }
        }
    }, {
        key: '_bindEvents',
        value: function _bindEvents() {
            var _this2 = this;

            var that = this,
                dom = this.domElement,
                events = this._events;

            function addEvent(target, type, handler) {
                events.add(target, type, handler);
            }

            addEvent(dom, 'click', function (e) {
                return e.preventDefault();
            });

            dragTrack(events, this._domH, function (x, y) {
                return that._setHSLA(x);
            });

            dragTrack(events, this._domSL, function (x, y) {
                return that._setHSLA(null, x, 1 - y);
            });

            if (this.settings.alpha) {
                dragTrack(events, this._domA, function (x, y) {
                    return that._setHSLA(null, null, null, 1 - y);
                });
            }

            var editInput = this._domEdit;
            {
                addEvent(editInput, 'input', function (e) {
                    that._setColor(this.value, { fromEditor: true, failSilently: true });
                });

                addEvent(editInput, 'focus', function (e) {
                    var input = this;

                    if (input.selectionStart === input.selectionEnd) {
                        input.select();
                    }
                });
            }

            this._ifPopup(function () {

                var popupCloseProxy = function popupCloseProxy(e) {
                    return _this2.closeHandler(e);
                };

                addEvent(window, EVENT_CLICK_OUTSIDE, popupCloseProxy);
                addEvent(window, EVENT_TAB_MOVE, popupCloseProxy);
                onKey(events, dom, ['Esc', 'Escape'], popupCloseProxy);

                var timeKeeper = function timeKeeper(e) {
                    _this2.__containedEvent = e.timeStamp;
                };
                addEvent(dom, EVENT_CLICK_OUTSIDE, timeKeeper);

                addEvent(dom, EVENT_TAB_MOVE, timeKeeper);

                addEvent(_this2._domCancel, 'click', popupCloseProxy);
            });

            var onDoneProxy = function onDoneProxy(e) {
                _this2._ifPopup(function () {
                    return _this2.closeHandler(e);
                });
                if (_this2.onDone) {
                    _this2.onDone(_this2.colour);
                }
            };
            addEvent(this._domOkay, 'click', onDoneProxy);
            onKey(events, dom, ['Enter'], onDoneProxy);
        }
    }, {
        key: '_setPosition',
        value: function _setPosition() {
            var parent = this.settings.parent,
                elm = this.domElement;

            if (parent !== elm.parentNode) {
                parent.appendChild(elm);
            }

            this._ifPopup(function (popup) {

                if (getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }

                var cssClass = popup === true ? 'popup_right' : 'popup_' + popup;

                ['popup_top', 'popup_bottom', 'popup_left', 'popup_right'].forEach(function (c) {

                    if (c === cssClass) {
                        elm.classList.add(c);
                    } else {
                        elm.classList.remove(c);
                    }
                });

                elm.classList.add(cssClass);
            });
        }
    }, {
        key: '_setHSLA',
        value: function _setHSLA(h, s, l, a, flags) {
            flags = flags || {};

            var col = this.colour,
                hsla = col.hsla;

            [h, s, l, a].forEach(function (x, i) {
                if (x || x === 0) {
                    hsla[i] = x;
                }
            });
            col.hsla = hsla;

            this._updateUI(flags);

            if (this.onChange && !flags.silent) {
                this.onChange(col);
            }
        }
    }, {
        key: '_updateUI',
        value: function _updateUI(flags) {
            if (!this.domElement) {
                return;
            }
            flags = flags || {};

            var col = this.colour,
                hsl = col.hsla,
                cssHue = 'hsl(' + hsl[0] * HUES + ', 100%, 50%)',
                cssHSL = col.hslString,
                cssHSLA = col.hslaString;

            var uiH = this._domH,
                uiSL = this._domSL,
                uiA = this._domA,
                thumbH = $('.picker_selector', uiH),
                thumbSL = $('.picker_selector', uiSL),
                thumbA = $('.picker_selector', uiA);

            function posX(parent, child, relX) {
                child.style.left = relX * 100 + '%';
            }
            function posY(parent, child, relY) {
                child.style.top = relY * 100 + '%';
            }

            posX(uiH, thumbH, hsl[0]);

            this._domSL.style.backgroundColor = this._domH.style.color = cssHue;

            posX(uiSL, thumbSL, hsl[1]);
            posY(uiSL, thumbSL, 1 - hsl[2]);

            uiSL.style.color = cssHSL;

            posY(uiA, thumbA, 1 - hsl[3]);

            var opaque = cssHSL,
                transp = opaque.replace('hsl', 'hsla').replace(')', ', 0)'),
                bg = 'linear-gradient(' + [opaque, transp] + ')';

            this._domA.style.backgroundImage = bg + ', ' + BG_TRANSP;

            if (!flags.fromEditor) {
                var format = this.settings.editorFormat,
                    alpha = this.settings.alpha;

                var value = void 0;
                switch (format) {
                    case 'rgb':
                        value = col.printRGB(alpha);break;
                    case 'hsl':
                        value = col.printHSL(alpha);break;
                    default:
                        value = col.printHex(alpha);
                }
                this._domEdit.value = value;
            }

            this._domSample.style.color = cssHSLA;
        }
    }, {
        key: '_ifPopup',
        value: function _ifPopup(actionIf, actionElse) {
            if (this.settings.parent && this.settings.popup) {
                actionIf && actionIf(this.settings.popup);
            } else {
                actionElse && actionElse();
            }
        }
    }, {
        key: '_toggleDOM',
        value: function _toggleDOM(toVisible) {
            var dom = this.domElement;
            if (!dom) {
                return false;
            }

            var displayStyle = toVisible ? '' : 'none',
                toggle = dom.style.display !== displayStyle;

            if (toggle) {
                dom.style.display = displayStyle;
            }
            return toggle;
        }
    }], [{
        key: 'StyleElement',
        get: function get$$1() {
            return _style;
        }
    }]);
    return Picker;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Picker);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************************!*\
  !*** ./src/views/skills/skills.js ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _color_picker_setup_color_picker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./color-picker/setup-color-picker */ "./src/views/skills/color-picker/setup-color-picker.js");
/* harmony import */ var _load_illustrations_load_illustrations__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./load-illustrations/load-illustrations */ "./src/views/skills/load-illustrations/load-illustrations.js");



(0,_color_picker_setup_color_picker__WEBPACK_IMPORTED_MODULE_0__.setupColorPicker)()
window.loadIllustrations = _load_illustrations_load_illustrations__WEBPACK_IMPORTED_MODULE_1__.loadIllustrations

})();

/******/ })()
;
//# sourceMappingURL=skills.js.map