var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function() {

    var attachEvent = document.attachEvent;

    if (!attachEvent) {
        var requestFrame = (function() {
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                    function(fn) {
                        return window.setTimeout(fn, 20);
                };
            return function(fn) {
                return raf(fn);
            };
        })();

        var cancelFrame = (function() {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                window.clearTimeout;
            return function(id) {
                return cancel(id);
            };
        })();

        function resetTriggers(element) {
            var triggers = element.__resizeTriggers__,
                expand = triggers.firstElementChild,
                contract = triggers.lastElementChild,
                expandChild = expand.firstElementChild;
            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;
            expandChild.style.width = expand.offsetWidth + 1 + 'px';
            expandChild.style.height = expand.offsetHeight + 1 + 'px';
            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
        }

        function checkTriggers(element) {
            return element.offsetWidth != element.__resizeLast__.width ||
                element.offsetHeight != element.__resizeLast__.height;
        }

        function scrollListener(e) {
            var element = this;
            resetTriggers(this);
            if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
            this.__resizeRAF__ = requestFrame(function() {
                if (checkTriggers(element)) {
                    element.__resizeLast__.width = element.offsetWidth;
                    element.__resizeLast__.height = element.offsetHeight;
                    element.__resizeListeners__.forEach(function(fn) {
                        fn.call(element, e);
                    });
                }
            });
        }
    }

    window.addResizeListener = function(element, fn) {
        if (attachEvent) element.attachEvent('resize', fn);
        else {
            if (!element.__resizeTriggers__) {
                if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
                element.__resizeLast__ = {};
                element.__resizeListeners__ = [];
                (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
                element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
                    '<div class="contract-trigger"></div>';
                element.appendChild(element.__resizeTriggers__);
                resetTriggers(element);
                element.addEventListener('scroll', scrollListener, true);
            }
            element.__resizeListeners__.push(fn);
        }
    };

    window.removeResizeListener = function(element, fn) {
        if (attachEvent) element.detachEvent('resize', fn);
        else {
            element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
            if (!element.__resizeListeners__.length) {
                element.removeEventListener('scroll', scrollListener);
                element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
            }
        }
    };

})();

}

/*
     FILE ARCHIVED ON 17:29:14 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:45 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 22.817
  load_resource: 177.975
  PetaboxLoader3.resolve: 108.177
  PetaboxLoader3.datanode: 57.351
*/