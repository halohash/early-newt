var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
/**
 * @class adHelper
 * @singleton
 */
 
(function(window, $) {
    window.loadAds = function() {
        // Removing this seen in http://i.cdn.turner.com/ads/tnt_4/ad_controller.js 
        return false;
    };

    window.ad_string_render = function() {
        // Overrriding the function in http://i.cdn.turner.com/ads/tnt_4/ad_controller.js since I don't need it and it may cause problems if called.
        console.error('ad_string_render should never be called.  TODO: remove this');
    };

    var History = window.History,
        HistoryHelper = window.HistoryHelper,
        adHelper = window.adHelper = window.adHelper || {};

    $.extend(adHelper, {
        desktopAdTagOff: 'desktopAdTagOff',
        adWrapperSelector: 'div[data-ad-wrapper]',
        idForSyncAdToWork: 'medium_rectangle',
        idForSyncAdTurnedOff: 'fw_medium_rectangle',
        idForSkinSyncAdToWork: 'fw_tbs_skin_slot',
        idForSkinSyncAdTurnedOff: 'fw_fw_tbs_skin_slot',
        reloadingAdClass: 'iAmAReloadingAdTag',
        epicScriptIdPrefix: 'epicAd',
        mobileAdWrapperSelector: '#headerAds',
        epicScriptTagCounter: 0,

        mobileAdConf: [
            {
                'hostnameRE': new RegExp("tntdrama.com"),
                'adNURLMatch': [
                {
                    're': new RegExp("^/index.html|^/$"),
                    'info': { 'theClass': 'home_top' }
                }, 
                {
                    're': new RegExp("^/shows/index.html|^/shows/$"),
                    'info': { 'theClass': 'shows_top' }
                }, {
                    're': new RegExp("^/schedule/index.html|^/schedule/$|^/schedule/list.html"),
                    'info': { 'theClass': 'schedule_top' }
                }]
            },
            {
                'hostnameRE': new RegExp("tbs.com"),
                'adNURLMatch': [
                {
                    're': new RegExp("^/index.html|^/$"),
                    'info': { 'theClass': 'home_top' }
                }, 
                {
                    're': new RegExp("^/shows/index.html|^/shows/$"),
                    'info': { 'theClass': 'shows_top' }
                }, {
                    're': new RegExp("^/schedule/index.html|^/schedule/$|^/schedule/list.html"),
                    'info': { 'theClass': 'schedule_top' }
                }]
            }
        ],

        specialAdsInfoPerURL: function(pageUrlTmp) {
            var that = this,
                myHostName = window.location.hostname,
                thePageUrl = HistoryHelper.getPageUrl(pageUrlTmp),
                returnObj = {}, adNURLMatchArr;

            for (var j = 0; j < that.mobileAdConf.length; j++) {
                if (that.mobileAdConf[j].hostnameRE.test(myHostName)) {
                    adNURLMatchArr = that.mobileAdConf[j].adNURLMatch;
                    for (var i = 0; i < adNURLMatchArr.length; i++) {
                        if (adNURLMatchArr[i].re.test(thePageUrl)) {
                            returnObj = adNURLMatchArr[i].info;
                        }
                    }
                }
            }
            return returnObj;
        },

        manageSyncAds: function(showEls, hideEls) {
            var that = this;
            $(showEls).find('._fwph').attr("id", that.idForSyncAdToWork);
            $(hideEls).find('._fwph').attr("id", that.idForSyncAdTurnedOff);
        },
        manageSkinSyncAds: function(showEls, hideEls) {
            var that = this;
            $(showEls).find('._fwph').attr("id", that.idForSkinSyncAdToWork);
            $(hideEls).find('._fwph').attr("id", that.idForSkinSyncAdTurnedOff);
        },
        hasSyncAd: function($el){
            return (
                ($($el).find('#' + this.idForSyncAdToWork).length > 0) || 
                ($($el).find('#' + this.idForSyncAdTurnedOff).length > 0)
            );
        },
        hasAd: function($el){
            var that = this;
            return ($($el).find(that.adWrapperSelector).length > 0);
        },
        
        loadAds2: function($els, eventType, segvar) {
            var that = this;
            // authFail and modal is the corner case discussed with Lennox where ads can be displayed and not shown.  Handled here
            $els.find(that.adWrapperSelector + ':has(".epicAd")').each(function() {
                var theAdWrapper = this,
                    showAds = false,
                    hasCorrectEventType = false,
                    theAdWrapperEventTypesArr = $(theAdWrapper).data('load-event-type').split(" ");
                for (var i = 0; i < theAdWrapperEventTypesArr.length; i++) {
                    if(theAdWrapperEventTypesArr[i] === eventType){
                        hasCorrectEventType = true;
                    }
                }
                if ((!window.pageStateChanges || (!window.pageStateChanges.authFail && !window.pageStateChanges.gotoAppModal)) && hasCorrectEventType && !$(theAdWrapper).hasClass(that.desktopAdTagOff)) {
                    var widthRestrictionTest = true,
                        heightRestrictionTest = true,
                        epicAdTest = true,
                        $epicDiv,
                        epicSrc,
                        epicDomId,
                        adParameters = $(theAdWrapper).data("ad-parameters"),
                        $tileTmp, $tile;
                    adParameters = (adParameters && typeof(adParameters) == 'object')?adParameters:{};
                    $tileTmp = (adParameters.tileSelectorFromAd)?$(theAdWrapper).parents(adParameters.tileSelectorFromAd):theAdWrapper;
                    $tile = ($tileTmp.length)?$tileTmp:theAdWrapper;
                    // A round error has been added since computed css style returned by jquery doesn't always match the css style.
                    if (adParameters.pageHeightLimit){
                        var pageHeightDiff = adParameters.pageHeightLimit - $(window).height();
                        if(adParameters.pageHeightLimit > $(window).height() && Math.abs(pageHeightDiff) > 1){
                            heightRestrictionTest = false;
                        }
                    }
                    if (adParameters.tileHeightLimit){
                        var tileHeightDiff = adParameters.tileHeightLimit - $($tile).height();
                        if(adParameters.tileHeightLimit > $($tile).height() && Math.abs(tileHeightDiff) > 1){
                            heightRestrictionTest = false;
                        }

                    }

                    if (adParameters.pageWidthLimit){
                        var pageWidthDiff = adParameters.pageWidthLimit - $(window).width();
                        if(adParameters.pageWidthLimit > $(window).width() && Math.abs(pageWidthDiff) > 1){
                            widthRestrictionTest = false;
                        }
                    }

                    if (adParameters.tileWidthLimit){
                        var tileWidthDiff = adParameters.tileWidthLimit - $($tile).width();
                        if(adParameters.tileWidthLimit > $($tile).width() && Math.abs(tileWidthDiff) > 1){
                            widthRestrictionTest = false;
                        }
                    }
                    $epicDiv = $(theAdWrapper).find('.epicAd');
                    if($epicDiv.length && $epicDiv.data('src')){
                        epicSrc = $epicDiv.data('src');
                        epicDomId = $epicDiv.attr('id');
                    } else {
                        epicAdTest = false;
                        console.log('Failed epic ad test.');
                    }
                    if (heightRestrictionTest && widthRestrictionTest && epicAdTest) {
                        $(theAdWrapper).show();
                        if($(theAdWrapper).parent().hasClass('ad_right_banner')){
                           $(theAdWrapper).parent().show(); 
                        }
                        showAds = true;
                        //Per ticket http://tickets.turner.com/browse/TENONENINE-911 we need to add a segvar on refresh
                        that.accountForSegvar(theAdWrapper, segvar);

                        try {
                            that.loadEpicAd(theAdWrapper, epicSrc, epicDomId);
                        } catch (e){
                            console.log('Could not load ad');
                        }
                    }
                }
                // This snippet is done to remove the Advertisement image if there is no ad.  If is the ad is present because we retrieve a page in the 
                // dom, don't hide it.
                if(!showAds && $.trim($(theAdWrapper).find('[data-adname]').html()) === ''){
                    $(theAdWrapper).hide();
                    if($(theAdWrapper).parent().hasClass('ad_right_banner')){
                       $(theAdWrapper).parent().hide(); 
                    }
                }
            });
        },

        loadEpicAd: function(theAdWrapper, epicSrc, adId){
            var that = this,
                adScriptId = that.getAdScriptId(),
                scriptEl;
            if($(theAdWrapper).hasClass('adInitialized')){
                AMPTManager.refreshAd(adId);
            } else {
                that.makeScriptTag({"type": "text/javascript", "async": true, "id": adScriptId, "src": epicSrc}, true);
                $(theAdWrapper).addClass('adInitialized');
            }
        },
        makeScriptTag: function(theAttributes, removeAfterLoad){
            var scriptId = theAttributes.id, scriptEl;
            if(scriptId){
                scriptEl = document.getElementById(scriptId);
                if(scriptEl){
                    scriptEl.parentNode.removeChild(scriptEl);
                }
            }
            scriptEl= document.createElement('script');

            var head = document.getElementsByTagName('head')[0];
            $.each( theAttributes, function( key, value ) {
                if(key !== 'src'){
                    scriptEl[key] = value;
                }
            });
            if(removeAfterLoad){
                // We could add function to do after load here as well.  Not needed at the moment so add it if needed
                scriptEl.onload = scriptEl.onreadystatechange = function() {
                    if (!scriptEl.readyState || (scriptEl.readyState === 'complete' || scriptEl.readyState === 'loaded')) {
                            scriptEl.onload = scriptEl.onreadystatechange = null;
                            scriptEl.parentNode.removeChild(scriptEl);
                    }
                };
            }
            scriptEl.src= theAttributes.src;
            head.appendChild(scriptEl);
        },
        getAdScriptId: function(){
            var that = this;
            that.epicScriptTagCounter++;
            if(that.epicScriptTagCounter > 30){
                that.epicScriptTagCounter = 0;
            }
            return that.epicScriptIdPrefix + '_' + that.epicScriptTagCounter;
        },
		
		/**
         * For video pages only. 
		 * Replaces the ad tag on the page in place so that the iframe is deleted but refreshed for the ad_controller code.
		 * It is required that $orig_ad and $new_ad be actual ad tags.  i.e. they have the [data-adname] attribute.
		 */
        replaceAdTag: function($orig_video_page, $new_video_page) {
            var that = this,
                $orig_ad = $orig_video_page.find('#pane-share ' + that.adWrapperSelector + ' [data-adname]'),
                $new_ad = $new_video_page.find('#pane-share ' + that.adWrapperSelector + ' [data-adname]'),
                $orig_ad_wrapper = $orig_video_page.find('#pane-share ' + that.adWrapperSelector);
            if($orig_video_page.length){ // When first going to a video page, there isn't a existing video page or existing ad to replace.
                if ($orig_ad.length && $new_ad.length) {
                    //Can't remove iframe because of memory leak so reset the ad config container
                    //1st clear its attributes
                    try {
                        var new_ad_attributes,
                            orig_attributes = $.map($orig_ad.prop('attributes'), function(item) {
                                return item.name;
                            });

                        //Remove no ad flag for scan and show
                        if (orig_attributes && orig_attributes.length) {
                            $.each(orig_attributes, function() {
                                $orig_ad.removeAttr(this);
                            });
                        }
                        // now copy to original
                        if ($new_ad.length) {
                            new_ad_attributes = $new_ad.prop("attributes");
                            if (new_ad_attributes.length) {
                                $.each(new_ad_attributes, function() {
                                    $orig_ad.attr(this.name, this.value);
                                });
                            }
                        }
                        //$orig_ad.attr('data-'+that.showAdFlag, 'yes');
                        $orig_ad_wrapper.removeClass(that.desktopAdTagOff);
                        $orig_ad_wrapper.show();
                    } catch (e) {
                        if (window.console) {
                            console.log(e);
                        }
                    }
                    //$orig_video_page.find('#pane-share .ad_right_banner').html($new_video_page.find('#pane-share .ad_right_banner').html());
                } else if ($orig_ad.length) {
                    // No new ad so just hide the one we have and prepare it for later ad insertion
                    //Add no ad flag for scan and hide
                    //$orig_ad.attr('data-'+that.showAdFlag, 'no');
                    $orig_ad_wrapper.addClass(that.desktopAdTagOff);
                    $orig_ad_wrapper.hide();
                } else if ($new_ad.length) {
                    $orig_ad_wrapper.removeClass(that.desktopAdTagOff);
                    $orig_ad_wrapper.show();
                    if ($orig_ad_wrapper.length) {
                        // Must of got to a state where the ad tag is omitted.  Replace it and start over.
                        $orig_ad_wrapper.html($new_ad[0].outerHTML);
                    } else {
                        // This case should not happen but adding it as a fail-safe
                        var $new_ad_wrapper = $('<div class="ad_right_banner"><div data-ad-wrapper="yes" data-load-event-type="onShow" id="myad-' + (new Date()).getTime() + '">' + $new_ad.html() + '</div></div>');
                        if ($orig_video_page.find('#pane-share .share-bar').length) {
                            //Per requirements, insert the ad after the share bar.  TODO: check for TBS/TCM
                            $new_ad_wrapper.insertAfter($orig_video_page.find('#pane-share .share-bar'));
                        } else {
                            //Per requirements, insert the ad in the share bar.  TODO: check for TBS/TCM
                            $orig_video_page.find('#pane-share').prepend($new_ad_wrapper);
                        }
                    }
                }
            }
        },

        accountForSegvar: function(theAdWrapper, segvar){
            var $theAdDiv = $(theAdWrapper).find('div[data-adname][cnnad_url]'),
                cnnad_url = $theAdDiv.attr('cnnad_url'),
                snippet = '&snippet=1';
            if(cnnad_url){
                if(cnnad_url.indexOf(snippet) > -1){
                    cnnad_url = cnnad_url.substr(0, cnnad_url.indexOf(snippet));
                }
                if(segvar){
                    cnnad_url = cnnad_url + snippet + segvar;
                }
                $theAdDiv.attr('cnnad_url', cnnad_url);
            }
        }
    });

}(window, jQuery));

}

/*
     FILE ARCHIVED ON 17:29:12 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.496
  load_resource: 119.366
  PetaboxLoader3.resolve: 75.957
  PetaboxLoader3.datanode: 33.891
*/