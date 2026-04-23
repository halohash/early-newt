var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function(window) {
    var HistoryHelper = window.HistoryHelper = {};

    function normalizeUrlHelper(options) {
        var url = options.path;
        if (url.charAt(url.length - 1) === '/') {
            url = url + 'index.html';
        }
        return url;
    }

    function isSameOrigin(url) {
        var loc = window.location,
            a = document.createElement('a');

        a.href = url;

        return a.hostname == loc.hostname &&
               a.port == loc.port &&
               a.protocol == loc.protocol;
    }

    $.extend(HistoryHelper, {
        isCurrentPageModal: false,

        getPageUrl: function(theUrl) {
            var href = window.location.href,
                rtrnUrl = (theUrl && theUrl.length > 0) ? theUrl : href;
            rtrnUrl = (rtrnUrl.lastIndexOf(window.location.host) >= 0) ? rtrnUrl.substr(rtrnUrl.indexOf(window.location.host) + window.location.host.length) : rtrnUrl;
            rtrnUrl = normalizeUrlHelper({
                "path": rtrnUrl
            });
            return rtrnUrl;
        },


        init: function(modal, pageId) {
            var that = this;
            if (!that.initialized) {
                var historyJS_Obj = History.getState(),
                    weSaveContextForThisPage = (historyJS_Obj.data.index !== undefined) ? historyJS_Obj.data.index : false;
                
                //TODO: this grabs the current page title, but still may need improvement for modals    
                var curTitle = document.title;

                if (weSaveContextForThisPage === false) { // It is a History page we saved context for -- Do not update it
                    History.replaceState({
                        myUrl: that.getPageUrl(),
                        index: 0,
                        isModal: modal,
                        pageId: pageId
                    }, curTitle, historyJS_Obj.url); // TODO: fix title
                }
                History.Adapter.bind(window, 'statechange', function() {
                    HistoryHelper.historyStateChangeHandler();
                });
                that.initialized = true;
            }
        },

        historyStateChangeHandler: function() {
            //TODO: Test Use case: Reload page and then hit back to previous bookmark.  unshift to history array
            var that = this,
                historyJS_Obj = History.getState(),
                historyJSDataIndex = (historyJS_Obj.data.index !== undefined) ? historyJS_Obj.data.index : -1,
                historyJSDataIsModal = (historyJS_Obj.data.isModal !== undefined) ? historyJS_Obj.data.isModal : false,
                pageUrlTmp = historyJS_Obj.data.myUrl ? historyJS_Obj.data.myUrl : historyJS_Obj.url,
                pageUrl = that.getPageUrl(pageUrlTmp);

            //console.error("CHANGE", pageUrl, historyJS_Obj.data.pageId);
            if (historyJSDataIndex >= 0) { // It is a History page we saved context for and need to handle
                if (that.locationBarUrlWeKnow !== pageUrl) { // Ignore state changed with the same url
                    that.locationBarUrlWeKnow = pageUrl;
                    that.isCurrentPageModal = historyJSDataIsModal;
                    Tn.parseHistoryPage(pageUrl, historyJS_Obj.data);
                }
            } else {
                // It not one of our managed pages so just send them there
                
                // It turns out that the loading of a page we don't manage made the UI look stalled, 
                // so instead of allowing the user to click around as if nothing happend, throw up our pjax splash
                Tn.showPjaxSplash(true);

                location.href = pageUrl;
            }
        },

        /**
            This function adds or replaces states in the history stack after we have entered into a modal state.  Four scenarios
            1 - Going forward to a modal from a page
            2 - Going back to a modal from a page 
            3 - Going forward to a page from a modal
            4 - Going back to a page from a modal
            - Going back to a modal from a off site link // TODO 
         */
        changeStateHelper: function(options) {
            var that = this,
                nextPageUrl = that.getPageUrl(options.nextPageUrl),
                historyJSNextData = {},
                historyJS_Obj = History.getState(),
                historyJSDataIndex = (historyJS_Obj.data.index !== undefined) ? historyJS_Obj.data.index : 0,
                didHistoryStateChange = false,
                defaultTitle = window.siteDefaults.defaultTitle;

            if (that.locationBarUrlWeKnow !== nextPageUrl) {
                didHistoryStateChange = true;
                historyJSNextData['index'] = historyJSDataIndex + 1;
                historyJSNextData['myUrl'] = nextPageUrl;
                historyJSNextData['isModal'] = options.isModalLinkClick ? true : false;
                historyJSNextData['pageId'] = options.pageId;

                if(!isSameOrigin(nextPageUrl)){
                    location.href = nextPageUrl;
                } else if (that.isCurrentPageModal && options.isModalLinkClick) {
                    History.replaceState(historyJSNextData, defaultTitle, nextPageUrl);
                } else if (options.isModalLinkClick) {
                    History.pushState(historyJSNextData, "n/a", nextPageUrl);
                } else {
                    History.pushState(historyJSNextData, defaultTitle, nextPageUrl);
                }
            }

            return didHistoryStateChange;
        },

        set: function(param, value) {
            if (param !== undefined && param.length > 0) {
                this[param] = value;
            } else {
                console.log("Can't set invalid param");
            }
        },

        get: function(param) {
            var returnVal;
            if (param && param.length > 0) {
                returnVal = this[param];
            } else {
                console.log("Can't get invalid param");
            }
            return returnVal;
        }
    });

    HistoryHelper.locationBarUrlWeKnow = HistoryHelper.getPageUrl();

})(window);

}

/*
     FILE ARCHIVED ON 17:29:06 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:41 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.541
  load_resource: 37.265
  PetaboxLoader3.datanode: 29.299
*/