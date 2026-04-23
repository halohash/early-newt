var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
var tnVars = {
    ua: navigator.userAgent.toLowerCase()
};

$.extend(tnVars, {
    touchStartX: null,
    touchEndX: null,
    touchStartY: null,
    touchEndY: null,
    isIPad: tnVars.ua.indexOf('ipad') !== -1 ? true : false,
    isIPhone: tnVars.ua.indexOf('iphone') !== -1 ? true : false,
    isIPod: tnVars.ua.indexOf('ipod') !== -1 ? true : false,
    //isIOS: this.isIPad || this.isIPhone || this.isIPod ? true : false,
    isAndroid: tnVars.ua.indexOf('android') !== -1 ? true : false,
    /* NOTE - android tablets are mostly not pixelDensity >= 2; they are at 1.5*/
    isRetinaScreen: window.devicePixelRatio >= 2 ? true : false,
    isKindle: tnVars.ua.indexOf('silk') !== -1 ? true : false,
    isWindows: tnVars.ua.indexOf('iemobile') !== -1 ? true : false,
    hasTouchStart: 'ontouchstart' in document.documentElement ? true : false,
    isAndroidChrome: tnVars.ua.indexOf('android') !== -1 && tnVars.ua.indexOf('chrome') !== -1,
    lastYPos: 0,
    lastMenuClick: 0,

    isIOS: function() {
        var isIOS = tnVars.isIPad || tnVars.isIPhone || tnVars.isIPod;
        return isIOS;
    },
    /**
     * Returns whether or not the current device is a mobile device.
     * @return {Boolean} True if it's a mobile device
     */
    isMobile: function() {
        var isMobile = tnVars.isIPad || tnVars.isIPhone || tnVars.isIPod || tnVars.isAndroid || tnVars.isKindle || tnVars.isWindows;
        return isMobile;
    },

    /**
     * [isAndroidTablet description]
     * @return {Boolean} [returns whether the android device is a tablet or not; based on screen size]
     */
    isAndroidTablet: function() {
        if (tnVars.isAndroid && $(window).width() >= 1000) {
            return true;
        } else {
            return false;
        }
    },
    isPhone: function(){
        return tnVars.isIPhone || tnVars.isIPod || ( tnVars.isAndroid && !tnVars.isAndroidTablet() ) ? true : false;
    },
    iosVersion: function() {
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (!v || v.length < 4) {return '';}
        return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)].join('.');
    },
    androidVersion: function() {
        var ua = navigator.userAgent;
        var match = ua.match(/Android\s([0-9\.]*)/);
        return match ? match[1] : false;
    },
    getPlatform: function() {
        var ret = [];
        if (tnVars.isMobile()) {
            ret.push("mobile");
        } else {
            ret.push("web");
        }
        if (tnVars.isAndroidTablet() || tnVars.isIPad) {
            ret.push("tablet");
        }
        if (tnVars.isIPad) {
            ret.push("ipad");
        }
        if (tnVars.isIPhone) {
            ret.push("iphone");
        }
        if (tnVars.isIPod) {
            ret.push("ipod");
        }
        if (tnVars.isAndroid) {
            ret.push("android");
            ret.push(tnVars.androidVersion());
        }
        if (tnVars.isIOS()) {
            ret.push("ios");
            ret.push(tnVars.iosVersion());
        }
        if (tnVars.isKindle) {
            ret.push("kindle");
        }
        if (tnVars.isWindows) {
            ret.push("windows");
        }
        if (tnVars.hasTouchStart) {
            ret.push("touch");
        }
        return ret.join(' ');
    },
    /**
     *
     * @type {Object}
     * video object associated with Player.js and playing tve video
     */
    turnerVideo: window.turnerVideo,

    /**
     *
     * @type {Function}
     * addResizeListener will put a listener on a DOM element to detect resize, similar to native window.resize
     */
    addResizeListener: window.addResizeListener,
    /**
     *
     * @type {Function}
     * removeResizeListener will remove resizeListener on a DOM element
     */
    removeResizeListener: window.removeResizeListener,
    /**
     *
     * @type {String}
     * string that will be added to end of truncated string
     */
    ellipsisStr: '',

    supportsOrientationChange: "onorientationchange" in window,
    orientationEvent: ("onorientationchange" in window) ? "orientationchange" : "resize",
    previousOrientation: window.orientation,


    // note these are not optimized for mobile yet
    windowHt: $(window).height(),
    windowW: $(window).width(),

    preventDefault: function(event){
        event.preventDefault();
        return false;
    },
    // this will totally disable the window scroll
    // right now this is used when the menu button is clicked so the content will not scroll under the menu
    disableWindowScroll: function(){
        //console.log('scrollTop: ' + $(document).scrollTop() );
        if( $('.page.is-window-scroll').length !== 0) {
            $(document).on('touchmove', window.tnVars.preventDefault);
        }
    },
    // this re enables the window scrol
    // right now triggered when the menu is closed either by button click or closeMenu()
    enableWindowScroll: function(){
        if( $('.page.is-window-scroll').length !== 0) {
            $(document).off('touchmove', window.tnVars.preventDefault);
        }
    },
    // this will totally disable the window scroll
    // right now this is used when the menu button is clicked so the content will not scroll under the menu
    disableContentForGigyaMobile: function(){
        //console.log('disableContentForGigyaMobile scrollTop: ' + $(document).scrollTop() );
        $('.page.is-window-scroll').addClass('disable');
    },
    // this re enables the window scrol
    // right now triggered when the menu is closed either by button click or closeMenu()
    enableContentForGigyaMobile: function(){
        $('.page.is-window-scroll').removeClass('disable');
    }
   
});

(function($, tnVars) {
    document.addEventListener(tnVars.orientationEvent, function() {
        orientationChanges();
    }, false);

    function orientationChanges() {
        console.log("orientationChanges");
        tnVars.windowW = $(window).width();
        tnVars.windowHt = $(window).height();

        if (tnVars.windowW < 370) {
            $('#page-video aside .mobilecloseRR').addClass('show');
        } else {
            $('#page-video aside .mobilecloseRR').removeClass('show');
        }
        

        if (window.orientation !== tnVars.previousOrientation) {
            var orient = window.orientation;
            tnVars.previousOrientation = orient;
        }
    }

    $(window).resize(function(){
        resizeWatchExtras();
    });
    $(window).on('orientationchange',function(){
        resizeWatchExtras();
    });

    function resizeWatchExtras(){
        // we are trying to target any open watch extras sections
        $('.epright2 .accordionContentNew.extras.in').find('.main-content').each(function(){
            window.tnOverlays.resizeOverlay( $(this) );
        });
    }


    // we want to prevent the default browser drag event for images in the carousels
    // the carousels were not scrolling when you dragged an image, but would scroll when you dragged non image elements

    $(document).on('dragstart','.carousel-row img', function(event) {
        event.preventDefault();
    });

    // this is to prevent the flickering in the carousels, android does not have the problem as much so we will exclude android
    //$('.carousel-row-item img').css('-webkit-transform', 'translate3d(0,0,0)');
    if(!tnVars.isAndroid && !tnVars.isIPhone && !tnVars.isIPod && !tnVars.isIPad){
        //$('.carousel-row-header').css('-webkit-transform', 'translate3d(0,0,0)');
        /*$('.carousel-row-item img').css('-webkit-transform', 'translate3d(0,0,0)');
        $('.carousel-row-item .caption.withleft').css('-webkit-transform', 'translate3d(0,0,0)');
        $('.carousel-row-item .secondary-item .overlay').css('-webkit-transform', 'translate3d(0,0,0)');
        $('.carousel-row .shadowwrapper-right').css('-webkit-transform', 'translate3d(0,0,0)');
        $('.carousel-row .shadowwrapper-left').css('-webkit-transform', 'translate3d(0,0,0)');
        $('.nav-slider').css('-webkit-transform', 'translate3d(0,0,0)');*/
    }



})(jQuery, window.tnVars);



/*
	setting console for IE who does not have the console object
*/
if (!("console" in window) || typeof console === "undefined") {
    var methods = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    var emptyFn = function() {};
    window.console = {};
    for (var i = 0; i < methods.length; ++i) {
        window.console[methods[i]] = emptyFn;
    }
}

$('body').on({
    // gigya-log-in-clicked gets triggered when the a.logIn is clicked
    'gigya-log-in-clicked': function(){
        Tn.closeMenu();
        window.tnVars.disableContentForGigyaMobile();
    },
    // gigya-edit-profile-clicked gets triggered when the a.editProfile is clicked
    'gigya-edit-profile-clicked': function(){
        Tn.closeMenu();
        window.tnVars.disableContentForGigyaMobile();
    },
    'gigya-log-in': function() {
        window.tnVars.enableContentForGigyaMobile();
        Tn.updateAllProgress();

        try {
            var arktanIframe = $('#arktan-comments iframe');
            if (arktanIframe.length < 1) {
                return;
            }
            var iframe = arktanIframe.get(0);

            if (iframe.contentWindow && iframe.contentWindow.onLoginHandlerBP) {
                iframe.contentWindow.onLoginHandlerBP(Tn.currentUser);
            }
        } catch (e) {
            console.error("Arktan login error", e);
        }
    },
    'gigya-log-out': function() {
        Tn.updateAllProgress();
        window.tnVars.enableContentForGigyaMobile();
        try {
            var arktanIframe = $('#arktan-comments iframe');
            if (arktanIframe.length < 1) {
                return;
            }
            var iframe = arktanIframe.get(0);

            if (iframe.contentWindow && iframe.contentWindow.onLogoutHandlerBP) {
                iframe.contentWindow.onLogoutHandlerBP();
            }
        } catch (e) {
            console.error("Arktan login error", e);
        }
    },
    'gigya-log-in-dialog': function() {
        $('#continue-watching-dialog').modal('hide');
        window.ie8ie9placeholders();
    },
    'gigya-log-in-dialog-loaded': function() {
        // first unbind the event in case they already exist
        $('div.mobileclose').off('click');
        // first remove buttons in case they already exist
        $('div.mobileclose').remove();
        $('#gigya-register-screen').append('<div class="mobileclose"></div>');
        $('#gigya-login-screen').append('<div class="mobileclose"></div>');
        $('#gigya-forgot-password-screen').append('<div class="mobileclose"></div>');
        $('#gigya-forgot-password-success-screen').append('<div class="mobileclose"></div>');
        $('#gigya-forgot-password-success-screen').append('<div class="mobileclose"></div>');
        $('div.mobileclose').on('click', function() {
            History.back();
            window.tnVars.enableContentForGigyaMobile();
        });
    },

    'hidden.bs.modal': function() {
        // we want to close any bs accordians when the overlay closes
        // specifically the ones in the user profile
        // this is triggered when you close the view user profile; it works like a regular modal rather than a gigya page
        $('a[data-toggle="collapse"]:not(.collapsed)').trigger('click');
        window.tnVars.enableContentForGigyaMobile();

    },
    'gigya-cancel-log-out-dialog': function(){
        //used for mobile
        window.tnVars.enableContentForGigyaMobile();
    },
    'gigya-screen-set-hidden': function(){
        window.tnVars.enableContentForGigyaMobile();
    }
           
});


// For all new pages, check for accordion
$('body').on('pageshown', function(event, pageId) {
    var page = $('#' + pageId),
        headerAds = $('#headerAds .banner_ad').not('.tn-hidden');

    window.adHelper.loadAds2(page.add(headerAds), 'onLoad');
    window.pageStateChanges = {}; // See notes in adHelper.js
    // Begin work for TENONENINE-281
    force_new_cnnad_transactionID();
    // End work for TENONENINE-281
    Tn.updateAllProgress();

    window.turnerVideo.cancelUpNext();

    // for show detail and sport detail we will see if the shows is currently playing live
    if(page.find('.check-for-on-now').length !== 0){
        Tn.refreshTVPage();
    }
    
    // this will init them once and not reinit them if the page is reloaded
    // now we need to handle resizing
    //page.find('.accordionContentNew.extras:not(.overlayinitialized)').on('shown.bs.collapse', function(){

    //  im360 video have different play button functionality and no overlays so we do not want them processed here
    page.find('.accordionContentNew.extras:not(.im360)').on('shown.bs.collapse', function(){
        var acc = $(this);
        acc.find('.main-content').each(function(){
            var item = $(this);
            window.tnOverlays.init(item);
        });
        //acc.addClass('overlayinitialized');
    });

    


    page.find('.formatdurationsecs:not(.timeformatted)').each(function(){
        var durationSeconds = $(this).text();
        // Tn.formatDuration is in search.js
        var durationStr = Tn.formatDuration(durationSeconds);
        $(this).html(durationStr);
        $(this).addClass('timeformatted');
    });

    page.find('a[data-type]').on('click', function(event) {
        event.preventDefault();
        var type = $(this).attr('data-type');
        var href = $(this).attr('href');
        console.error("Found type", href);
        if (type === 'video') {
            Tn.showPlayer(href);
            return;
        }
        Tn.setUrl(href, true, 'page-generic');
    });

    page.find('a.playbut, a.playbutRef').not('.handled').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        var href = $(this).attr('href');
        if (href && href.length > 0) {
            Tn.showPlayer(href);
        }
    });

    // if (Tn.ArktanSocialStreamsClient && page!=='page-video') {
    //     try {
    //         Tn.ArktanSocialStreamsClient.stopLiveUpdates();
    //     } catch(e) {
    //         console.log("Arktan error", e.message);
    //     }
    //     delete Tn.ArktanSocialStreamsClient;
    // }

    // The video page is the only page where we have a special case of the div being loaded then destroyed on startup.
    // This causes Gigya to throw an initialization error.
    if (!Tn.startedOnVideoPage) {
        page.find('.socialshare').each(function(index, that) {
            var id = Tn.uid(),
                ua = new gigya.socialize.UserAction(),
                gyTitle = document.title,
                gyImageObj,
                gyDescription;
            $(that).attr('id', id).empty();
            var gigyaDataObj = $(this).data("gigya-obj");
            // Define a UserAction onject
            ua.setLinkBack(window.location.href);
            if (typeof(gigyaDataObj) === 'object') {
                gyTitle = gigyaDataObj.title ? gigyaDataObj.title : gyTitle;
                gyDescription = gigyaDataObj.description ? gigyaDataObj.description : gyDescription;
                gyImageObj = gigyaDataObj.image ? {
                    "type": "image",
                    "src": gigyaDataObj.image,
                    href: window.location.href
                } : gyImageObj;
            }

            ua.setTitle(gyTitle);
            if (gyDescription) {
                ua.setDescription(gyDescription);
            }
            if (gyImageObj) {
                ua.addMediaItem(gyImageObj);
            }
            var tnActionLink = "";
            if (window.siteDefaults.name === "TNT") {
                tnActionLink = "See More On tntdrama.com";
            } else {
                tnActionLink = "See More On tbs.com";
            }
            ua.addActionLink(tnActionLink, window.location.href);

            // Define Share Bar plugin's Parameters 
            var shareBarParams = {
                userAction: ua,
                iconsOnly: true,
                noButtonBorders: true,
                showTooltips: false,
                showCounts: 'none',
                shareButtons: [{
                    provider: 'facebook',
                    tooltip: 'Share on Facebook',
                    iconImgUp: '/images/facebook.png'
                }, {
                    provider: 'twitter',
                    tooltip: 'Share on Twitter',
                    iconImgUp: '/images/twitter.png'
                }, {
                    provider: 'googleplus',
                    tooltip: 'Share on Google+',
                    iconImgUp: '/images/googleplus.png'
                }, {
                    provider: 'share',
                    tooltip: 'Share...',
                    iconImgUp: '/images/share.png'
                }],
                containerID: id
            };

            // Load Share Bar plugin
            gigya.socialize.showShareBarUI(shareBarParams);
        });
    } else {
        delete Tn.startedOnVideoPage;
    }

    page.find('.socialfollowwrapper').each(function(index, that) {
        var gigyaFollowParams = {},
            gigyaFollowBttnArr = [];
        var id = Tn.uid();
        $(that).find('.gigyaFollowInsert').attr('id', id);
        $(that).find('.gigyaFollowData li[data-gigya-obj]').each(function(index, that) {
            var gigyaDataObj = $(that).data("gigya-obj");
            if (typeof(gigyaFollowBttnArr) === 'object') {
                gigyaFollowBttnArr.push(gigyaDataObj);
            }
        });
        if (gigyaFollowBttnArr.length > 0) {
            gigyaFollowParams["containerID"] = id;
            gigyaFollowParams["iconSize"] = 30;
            gigyaFollowParams["buttons"] = gigyaFollowBttnArr;
            gigya.services.socialize.showFollowBarUI(gigyaFollowParams);
        }
    });
    //ACCORDION BUTTON ACTION (ON CLICK DO THE FOLLOWING)
    page.find('.accordionButton').click(function() {
        //REMOVE THE ON CLASS FROM ALL BUTTONS
        $('.accordionButton').removeClass('on');
        //NO MATTER WHAT WE CLOSE ALL OPEN SLIDES
        $('.accordionContent').slideUp('normal');
        //IF THE NEXT SLIDE WASN'T OPEN THEN OPEN IT
        if ($(this).next().is(':hidden') === true) {
            //ADD THE ON CLASS TO THE BUTTON
            $(this).addClass('on');
            //OPEN THE SLIDE
            $(this).next().slideDown('normal');
        }
    });

    // FLIP ARROW ON ACCORDION
    $('.accordionContentNew').on('show.bs.collapse', function(evt) {
        var that = this,
            associatedElClass = $(that).data("associated-div");
        $(associatedElClass).find("i.fa").removeClass("fa-caret-up").addClass("fa-caret-down");
    });
    $('.accordionContentNew').on('hide.bs.collapse', function(evt) {
        var that = this,
            associatedElClass = $(that).data("associated-div");
        $(associatedElClass).find("i.fa").removeClass("fa-caret-down").addClass("fa-caret-up");
    });
    /*** REMOVE IF MOUSEOVER IS NOT REQUIRED ***/

    //ADDS THE .OVER CLASS FROM THE STYLESHEET ON MOUSEOVER 
    page.find('.accordionButton').mouseover(function() {
        $(this).addClass('over');
        //ON MOUSEOUT REMOVE THE OVER CLASS
    }).mouseout(function() {
        $(this).removeClass('over');
    });

    /*** END REMOVE IF MOUSEOVER IS NOT REQUIRED ***/



    /********************************************************************************************************************
	CLOSES ALL S ON PAGE LOAD
	********************************************************************************************************************/
    page.find('.accordionContent').hide();


    //ACCORDION BUTTON ACTION (ON CLICK DO THE FOLLOWING)
    page.find('.inneraccordionButton').click(function() {
        //REMOVE THE ON CLASS FROM ALL BUTTONS
        $('.inneraccordionButton').removeClass('on');
        //NO MATTER WHAT WE CLOSE ALL OPEN SLIDES
        $('.inneraccordionContent').slideUp('normal');
        //IF THE NEXT SLIDE WASN'T OPEN THEN OPEN IT
        if ($(this).next().is(':hidden') === true) {
            //ADD THE ON CLASS TO THE BUTTON
            $(this).addClass('on');
            //OPEN THE SLIDE
            $(this).next().slideDown('normal');
        }
    });


    /*** REMOVE IF MOUSEOVER IS NOT REQUIRED ***/

    //ADDS THE .OVER CLASS FROM THE STYLESHEET ON MOUSEOVER 
    page.find('.inneraccordionButton').mouseover(function() {
        $(this).addClass('over');

        //ON MOUSEOUT REMOVE THE OVER CLASS
    }).mouseout(function() {
        $(this).removeClass('over');
    });

    /*** END REMOVE IF MOUSEOVER IS NOT REQUIRED ***/


    /********************************************************************************************************************
	CLOSES ALL S ON PAGE LOAD
	********************************************************************************************************************/
    page.find('.inneraccordionContent').hide();

    /********************************************************************************************************************
	LEARN MORE FUNCTIONS
	********************************************************************************************************************/

    function helpDotDotDot() {
        // We loose the click events when the screen is resized
        $(".epright2 .blurb .more").click(function() {
            var content = $(".epright2 .blurb p").triggerHandler("originalContent.dot");
            $(".epright2 .blurb p").trigger("destroy.dot").append(content);
        });
    }

    function helpDotDotDotVideo() {
        // We loose the click events when the screen is resized
        $(".in-player-tray #pane-info p.desc .more").click(function() {
            var content = $(".in-player-tray #pane-info p.desc").triggerHandler("originalContent.dot");
            $(".in-player-tray #pane-info p.desc").trigger("destroy.dot").append(content);
        });
    }

    var item;

    // Designed where there's only one div.page-series-info element
    var dotdotdotJQObj = $(".epright2 .blurb p").trigger("destroy.dot"); // Dispose of other dotdotdot instances in all cases

    if (page.find('.seasonlist').length > 0) {
        // SEASON DROP-DOWN 
        page.find('.seasonlist:not(:last-child)').hide();

        // the BS event was not getting triggered on ios so we will manually trigger it via touchend
        $('.accordion-drop-down').on('touchend', function(e) {
            console.log("we have touchended");
            e.preventDefault();
            $(this).trigger('click.bs.collapse.data-api');

        });

        $('.accordion-content-drop-down .season-dd-item').on('click touchend', function(event) {
            event.preventDefault();
            var that = this,
                newSelectedText = $(that).data("display-text");
            if ($(event.originalEvent.target).hasClass('arrow-selector')) { // Clicked arrown and just want to close it.
                return;
            }
            $('.seasonlist').hide();
            $('#' + $(that).data("display-id")).show();
            $(that).parents('.accordion-drop-down').find(".topText").text(newSelectedText);
            $(that).parent().find(".season-dd-item").removeClass("isSelected");
            $(that).addClass("isSelected");
        });

        var lineH = dotdotdotJQObj.css('line-height'),
            theFontSize = parseInt(dotdotdotJQObj.css('font-size'), 10);

        if (!lineH.match('px')) {
            if ($.isNumeric(parseFloat(lineH)) && parseFloat(lineH) < 2 && $.isNumeric(theFontSize)) { // Add cross broweser compatibility for unitless line hieght and 'normal' returned
                lineH = theFontSize * lineH;
            } else if ($.isNumeric(theFontSize)) {
                lineH = 1.43 * theFontSize; // 1.43 is the approximate line-height ratio at the moment
            } else {
                lineH = 19; // All else failed so give use something
            }
        }

        dotdotdotJQObj.dotdotdot({
            "ellipsis": '',
            "watch": true,
            "height": 4.3 * parseInt(lineH, 10),
            "after": jQuery(dotdotdotJQObj).parent().find('.more'),
            "callback": helpDotDotDot
        });
        
    }

    
        

    /********************************************************************************************************************
    VIDEO RIGHT RAIL FUNCTIONS
    ********************************************************************************************************************/
    // Designed where there's only one div.page-series-info element
    

    // the embed 360 player page has the same right rail and we do not want this to happen on that page
    if (pageId === 'page-video' && page.find('aside.in-player-tray').length > 0) {
        var dotdotdotJQObjVideo = $(".in-player-tray #pane-info p.desc").trigger("destroy.dot"); // Dispose of other dotdotdot instances in all cases
        if ($('#pane-info p.desc').length > 0) {
            var lineHVideo = dotdotdotJQObjVideo.css('line-height'),
                theFontSizeVideo = parseInt(dotdotdotJQObjVideo.css('font-size'), 10);

            if (!lineHVideo.match('px')) {
                if ($.isNumeric(parseFloat(lineHVideo)) && parseFloat(lineHVideo) < 2 && $.isNumeric(theFontSizeVideo)) { // Add cross broweser compatibility for unitless line hieght and 'normal' returned
                    lineHVideo = theFontSizeVideo * lineHVideo;
                } else if ($.isNumeric(theFontSizeVideo)) {
                    lineHVideo = 1.43 * theFontSizeVideo; // 1.43 is the approximate line-height ratio at the moment
                } else {
                    lineHVideo = 19; // All else failed so give use something
                }
            }

            dotdotdotJQObjVideo.dotdotdot({
                "ellipsis": '',
                "watch": true,
                "height": 4.3 * parseInt(lineHVideo, 10),
                "after": jQuery(".in-player-tray #pane-info p.desc .more"),
                "callback": helpDotDotDotVideo
            });
        }
        //item = page.find('.accordionContent.extras');
        //window.tnOverlays.init(item);
    }

    page.find('[data-id="nielsen_ri_episode_meta"]').each(function() {
        // we want this to track each time an episode page for r&i episodes from season 5 on
        // #nielsen_ri_episode_meta is being set on the episode detail page
        if (page.find('[data-id="rinielsontracker"]').length > 0) {
            page.find('[data-id="rinielsontracker"]').remove();
        }
        var riSeason = $(this).attr('season');
        if (riSeason.length > 0 && riSeason > 4) {
            var now = new Date();
            var time = now.getTime();
            page.append('<img data-id="rinielsontracker" src="https://web.archive.org/web/20141231172917/http://secure-us.imrworldwide.com/cgi-bin/m?ci=ade2013-ca&at=view&rt=banner&st=image&ca=rizzoliandisles&cr=overall&pc=TVE_Episode&ce=overall&r=' + time + '" />');
        }

    });
    page.find('[data-id="nielsen_ri_show_meta"]').each(function() {
        // #nielsen_ri_show_meta is being set on the show page
        if (page.find('[data-id="rinielsonshowtracker"]').length > 0) {
            page.find('[data-id="rinielsonshowtracker"]').remove();
        }
        var now = new Date();
        var time = now.getTime();
        page.append('<img data-id="rinielsonshowtracker" src="https://web.archive.org/web/20141231172917/http://secure-us.imrworldwide.com/cgi-bin/m?ci=ade2013-ca&at=view&rt=banner&st=image&ca=rizzoliandisles&cr=overall&pc=TVE_Episode&ce=overall&r=' + time + '" />');
    });

});


/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) {}
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function(key, value, options) {

        // Write

        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires,
                    t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function(key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, {
            expires: -1
        }));
        return !$.cookie(key);
    };

}));


/**
 * jQuery plugin to convert a given $.ajax response xml object to json.
 *
 * @example var json = $.xml2json(response);
 */
(function() {

    // default options based on https://github.com/Leonidas-from-XIV/node-xml2js
    var defaultOptions = {
        attrkey: '$',
        charkey: '_',
        normalize: false
    };

    // extracted from jquery
    function parseXML(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }
        try {
            if (window.DOMParser) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml");
            } else { // IE
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(data);
            }
        } catch (e) {
            xml = undefined;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
            throw new Error("Invalid XML: " + data);
        }
        return xml;
    }

    function normalize(value, options) {
        if (!!options.normalize) {
            return (value || '').trim();
        }
        return value;
    }

    function xml2jsonImpl(xml, options) {

        var i, result = {},
            attrs = {},
            node, child, name;
        result[options.attrkey] = attrs;

        if (xml.attributes && xml.attributes.length > 0) {
            for (i = 0; i < xml.attributes.length; i++) {
                var item = xml.attributes.item(i);
                attrs[item.nodeName] = item.value;
            }
        }

        // element content
        if (xml.childElementCount === 0) {
            result[options.charkey] = normalize(xml.textContent, options);
        }

        for (i = 0; i < xml.childNodes.length; i++) {
            node = xml.childNodes[i];
            if (node.nodeType === 1) {

                if (node.attributes.length === 0 && node.childElementCount === 0) {
                    child = normalize(node.textContent, options);
                } else {
                    child = xml2jsonImpl(node, options);
                }

                name = node.nodeName;
                if (result.hasOwnProperty(name)) {
                    // For repeating elements, cast/promote the node to array
                    var val = result[name];
                    if (!Array.isArray(val)) {
                        val = [val];
                        result[name] = val;
                    }
                    val.push(child);
                } else {
                    result[name] = child;
                }
            }
        }

        return result;
    }

    /**w
     * Converts an xml document or string to a JSON object.
     *
     * @param xml
     */
    function xml2json(xml, options) {
        if (!xml) {
            return xml;
        }

        options = options || defaultOptions;

        if (typeof xml === 'string') {
            xml = parseXML(xml).documentElement;
        }

        var root = {};

        if (xml.attributes && xml.attributes.length === 0 && xml.childElementCount === 0) {
            root[xml.nodeName] = normalize(xml.textContent, options);
        } else {
            root[xml.nodeName] = xml2jsonImpl(xml, options);
        }

        return root;
    }

    if (typeof jQuery !== 'undefined') {
        jQuery.extend({
            xml2json: xml2json
        });
    } else if (typeof module !== 'undefined') {
        module.exports = xml2json;
    } else if (typeof window !== 'undefined') {
        window.xml2json = xml2json;
    }
})();

/* IE 9 does not recoginize placeholders on form fields so we will display the field labels */
(function($, Modernizr) {
    window.ie8ie9placeholders = function() {
        if (!Modernizr.input.placeholder) {
            $('.gigya-label').css('display', 'inline-block');
            $('.gigya-label-text a.forgotPassword').css('display', 'none');
        }
    };
})(jQuery, window.Modernizr);

/* mousetrap v1.4.6 craig.is/killing/mice */
(function(J, r, f) {
    function s(a, b, d) {
        a.addEventListener ? a.addEventListener(b, d, !1) : a.attachEvent("on" + b, d)
    }

    function A(a) {
        if ("keypress" == a.type) {
            var b = String.fromCharCode(a.which);
            a.shiftKey || (b = b.toLowerCase());
            return b
        }
        return h[a.which] ? h[a.which] : B[a.which] ? B[a.which] : String.fromCharCode(a.which).toLowerCase()
    }

    function t(a) {
        a = a || {};
        var b = !1,
            d;
        for (d in n) a[d] ? b = !0 : n[d] = 0;
        b || (u = !1)
    }

    function C(a, b, d, c, e, v) {
        var g, k, f = [],
            h = d.type;
        if (!l[a]) return [];
        "keyup" == h && w(a) && (b = [a]);
        for (g = 0; g < l[a].length; ++g)
            if (k =
                l[a][g], !(!c && k.seq && n[k.seq] != k.level || h != k.action || ("keypress" != h || d.metaKey || d.ctrlKey) && b.sort().join(",") !== k.modifiers.sort().join(","))) {
                var m = c && k.seq == c && k.level == v;
                (!c && k.combo == e || m) && l[a].splice(g, 1);
                f.push(k)
            }
        return f
    }

    function K(a) {
        var b = [];
        a.shiftKey && b.push("shift");
        a.altKey && b.push("alt");
        a.ctrlKey && b.push("ctrl");
        a.metaKey && b.push("meta");
        return b
    }

    function x(a, b, d, c) {
        m.stopCallback(b, b.target || b.srcElement, d, c) || !1 !== a(b, d) || (b.preventDefault ? b.preventDefault() : b.returnValue = !1, b.stopPropagation ?
            b.stopPropagation() : b.cancelBubble = !0)
    }

    function y(a) {
        "number" !== typeof a.which && (a.which = a.keyCode);
        var b = A(a);
        b && ("keyup" == a.type && z === b ? z = !1 : m.handleKey(b, K(a), a))
    }

    function w(a) {
        return "shift" == a || "ctrl" == a || "alt" == a || "meta" == a
    }

    function L(a, b, d, c) {
        function e(b) {
            return function() {
                u = b;
                ++n[a];
                clearTimeout(D);
                D = setTimeout(t, 1E3)
            }
        }

        function v(b) {
            x(d, b, a);
            "keyup" !== c && (z = A(b));
            setTimeout(t, 10)
        }
        for (var g = n[a] = 0; g < b.length; ++g) {
            var f = g + 1 === b.length ? v : e(c || E(b[g + 1]).action);
            F(b[g], f, c, a, g)
        }
    }

    function E(a, b) {
        var d,
            c, e, f = [];
        d = "+" === a ? ["+"] : a.split("+");
        for (e = 0; e < d.length; ++e) c = d[e], G[c] && (c = G[c]), b && "keypress" != b && H[c] && (c = H[c], f.push("shift")), w(c) && f.push(c);
        d = c;
        e = b;
        if (!e) {
            if (!p) {
                p = {};
                for (var g in h) 95 < g && 112 > g || h.hasOwnProperty(g) && (p[h[g]] = g)
            }
            e = p[d] ? "keydown" : "keypress"
        }
        "keypress" == e && f.length && (e = "keydown");
        return {
            key: c,
            modifiers: f,
            action: e
        }
    }

    function F(a, b, d, c, e) {
        q[a + ":" + d] = b;
        a = a.replace(/\s+/g, " ");
        var f = a.split(" ");
        1 < f.length ? L(a, f, b, d) : (d = E(a, d), l[d.key] = l[d.key] || [], C(d.key, d.modifiers, {
                type: d.action
            },
            c, a, e), l[d.key][c ? "unshift" : "push"]({
            callback: b,
            modifiers: d.modifiers,
            action: d.action,
            seq: c,
            level: e,
            combo: a
        }))
    }
    var h = {
            8: "backspace",
            9: "tab",
            13: "enter",
            16: "shift",
            17: "ctrl",
            18: "alt",
            20: "capslock",
            27: "esc",
            32: "space",
            33: "pageup",
            34: "pagedown",
            35: "end",
            36: "home",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            45: "ins",
            46: "del",
            91: "meta",
            93: "meta",
            224: "meta"
        },
        B = {
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        },
        H = {
            "~": "`",
            "!": "1",
            "@": "2",
            "#": "3",
            $: "4",
            "%": "5",
            "^": "6",
            "&": "7",
            "*": "8",
            "(": "9",
            ")": "0",
            _: "-",
            "+": "=",
            ":": ";",
            '"': "'",
            "<": ",",
            ">": ".",
            "?": "/",
            "|": "\\"
        },
        G = {
            option: "alt",
            command: "meta",
            "return": "enter",
            escape: "esc",
            mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
        },
        p, l = {},
        q = {},
        n = {},
        D, z = !1,
        I = !1,
        u = !1;
    for (f = 1; 20 > f; ++f) h[111 + f] = "f" + f;
    for (f = 0; 9 >= f; ++f) h[f + 96] = f;
    s(r, "keypress", y);
    s(r, "keydown", y);
    s(r, "keyup", y);
    var m = {
        bind: function(a, b, d) {
            a = a instanceof Array ? a : [a];
            for (var c = 0; c < a.length; ++c) F(a[c], b, d);
            return this
        },
        unbind: function(a, b) {
            return m.bind(a, function() {}, b)
        },
        trigger: function(a, b) {
            if (q[a + ":" + b]) q[a + ":" + b]({}, a);
            return this
        },
        reset: function() {
            l = {};
            q = {};
            return this
        },
        stopCallback: function(a, b) {
            return -1 < (" " + b.className + " ").indexOf(" mousetrap ") ? !1 : "INPUT" == b.tagName || "SELECT" == b.tagName || "TEXTAREA" == b.tagName || b.isContentEditable
        },
        handleKey: function(a, b, d) {
            var c = C(a, b, d),
                e;
            b = {};
            var f = 0,
                g = !1;
            for (e = 0; e < c.length; ++e) c[e].seq && (f = Math.max(f, c[e].level));
            for (e = 0; e < c.length; ++e) c[e].seq ? c[e].level == f && (g = !0,
                b[c[e].seq] = 1, x(c[e].callback, d, c[e].combo, c[e].seq)) : g || x(c[e].callback, d, c[e].combo);
            c = "keypress" == d.type && I;
            d.type != u || w(a) || c || t(b);
            I = g && "keydown" == d.type
        }
    };
    J.Mousetrap = m;
    "function" === typeof define && define.amd && define(m)
})(window, document);
}

/*
     FILE ARCHIVED ON 17:29:17 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:43 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.467
  load_resource: 21.406
  PetaboxLoader3.datanode: 15.166
*/