var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
window.currentPageUrl = window.location.href;


//for video player, flag live tv player so that data can be changed when show changes
var refreshLiveStreamData = false;

// These global variable are required for backwards compatibility with the existing auth and analytics system
window.logAdobe = false;
window.fw_ae = '';
window.hasSetFirstMetric = false;

//These global variable are intended to prevent over-reporting of analytics data
window.hasReportedPickerOpen = false;
window.hasReportedPickerList = false;
window.hasReportedPickerNoProvider = false;


//set auth vendorEnv to staging if not in production
if (window.location.hostname !== 'www.tntdrama.com' && window.location.hostname !== 'tntdrama.com' && window.location.hostname !== 'tbs.com' && window.location.hostname !== 'www.tbs.com') {
    var authVendorEnvId = 'staging';
    var authConfigEnvId = 'preprod';
} else {
    var authVendorEnvId = 'prod';
    var authConfigEnvId = 'prod';
}

// Used to track issues on startup
Tn.startupLog = '\n';

var Mousetrap = window.Mousetrap;

function logStartup(msg) {
    Tn.startupLog += msg + '\n';
}

// Hide the splash after 20 seconds if an error occured and output the startup log
setTimeout(function() {
    if (Tn.splashHidden) {
        return;
    }
    Tn.splashHidden = true;
    $('#screen-splash').fadeOut(1000);
    console.error("Splash took too long", Tn.startupLog);
}, 20000);

(function($, window, undefined) {
    var HistoryHelper = window.HistoryHelper,
        History = window.History,
        tnVars = window.tnVars,
        isMobile = tnVars.isMobile();

    // Set up the moment variables for displaying nice user date names
    moment.lang('en', {
        calendar: {
            lastDay: '[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            lastWeek: '[last] dddd',
            nextWeek: 'dddd',
            sameElse: 'L'
        }
    });

    $.extend(Tn, {
        firstAuth: true,
        volumeLevel: 0.5,
        defaultVolumeLevel: 0.5,
        //savedVolumeLevel: 1,
        stateFrozen: false,
        maxVideoHistory: 50,
        upNextTimeInSeconds: 10,
        titles: {},
        brandImage: '',

        onVideoBackButton: function() {
            var historyJS_Obj_data = History.getState().data;
            //console.log('history data=' +historyJS_Obj_data);
            //console.log('onVideoBackButton history History.getCurrentIndex()=' + History.getCurrentIndex());
            if (typeof(historyJS_Obj_data) === 'object' && historyJS_Obj_data.index === 0) {
                //Since we don't want to loose them ( history index == 0 means a back button is another site or sessionStorage had problems ) 
                // send them to info page if we know about it
                var videosAssociatedInfoPage = '/index.html'; // When we don't have a associated info page like clips.  See showPlayerInternal
                if (Tn.videosAssociatedInfoPage) {
                    videosAssociatedInfoPage = Tn.videosAssociatedInfoPage;
                }
                if (videosAssociatedInfoPage.toLowerCase().indexOf('/watch') >= 0) {
                    Tn.setUrl(videosAssociatedInfoPage, false, 'page-livetv');
                } else if (videosAssociatedInfoPage === '/index.html') {
                    Tn.setUrl(videosAssociatedInfoPage, false, 'page-landing');
                } else {
                    Tn.setUrl(videosAssociatedInfoPage, true, 'page-generic');
                }
            } else {
                History.back();
            }
        },

        onHDToggleVisible: function(enabled) {
            Tn.Users.setPref('hd', enabled ? false : true);
            setTimeout(function() {
                window.turnerVideo.updateHdStatus();
            }, 100);
        },

        updateActiveNavLink: function(pageId) {

            $('#mainnav').find('a').each(function() {
                var pid = $(this).attr('pageId');
                if (!pid) {
                    return;
                }
                if (pid !== pageId || ($(this).attr('modal') === '1') && pid !== 'page-search' && pid !== 'page-landing' ) {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }
            });
            
            // we added the schedule link as a div since its destination is dynamic based on device
            $('#mainnav').find('li > div').each(function() {
                var pid = $(this).attr('pageId');
                if (!pid) {
                    return;
                }
                if (pid !== pageId || ($(this).attr('modal') === '1') && pid !== 'page-search' && pid !== 'page-landing' ) {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }
                // the schedule tile and list views are 2 different page nodes
                if(pageId === 'page-schedule-list' && pid === 'page-schedule'){
                    $(this).addClass('active');
                }
            });


        },

        updateBrandImage: function() {
            if (Tn.brandImage.length > 0) {
                $(".att").css('background-image', 'url(' + Tn.brandImage + ')');
                $(".mvpd-logged-out").addClass('tn-hidden');
                $(".mvpd-logged-in").removeClass('tn-hidden');
                $(".mvpdoverlay").addClass('mvpdactive');
                return;
            }

            $(".att").css('background-image', '');
            $(".mvpd-logged-out").removeClass('tn-hidden');
            $(".mvpd-logged-in").addClass('tn-hidden');
            $(".mvpdoverlay").removeClass('mvpdactive');
        },

        closeMenu: function() {
            if ($('#navmain').hasClass('in')) {
                $('#navmain').collapse('hide');
                window.tnVars.enableWindowScroll();
            }
        },
        loadImages: function(pageId){
            // we need to pull the correct image standard/retina
            // this is for pages that are not build by javascript like the sport detail page
            // i wanted it to be asap so put it here instead of after the pageshown event is triggered
            var useRetinaImg = window.tnVars.isRetinaScreen &&
                !( (window.tnVars.isAndroid && !window.tnVars.isAndroidTablet() ) ||
                window.tnVars.isIPhone ||
                window.tnVars.isIPod) ? true : false;

            if($('#'+pageId).find('img.loadimage').length !== 0){

                $.each($('#'+pageId).find('img.loadimage'), function(index, img){
                    var $img = $(img);
                    var imgSrc = img.src = $img.attr('data-standard');
                    if(useRetinaImg && $img.attr('data-retina') !== ''){
                        imgSrc = $img.attr('data-retina');
                    }
                    img.src = imgSrc;
                    // we only want the image to load 1 time
                    $img.removeClass('loadimage');
                });
            }
        },
        finalizePage: function(pageId, url) {
            // if there are any .loadimage images on the page, loadImages() will decide to pull standard or retina
            Tn.loadImages(pageId);

            if (isMobile || !$('body').hasClass('page-modal')) {
                // Hide any pages that aren't visible
                $('.page').each(function() {
                    var page = $(this),
                        id = page.attr('id');
                    if (id !== 'page-video' && id !== pageId) {
                        if (!page.is(":hidden")) {
                            // we are working with opacity here to try to avoid the carousel pages on ipad showing the new page
                            // before the old page is full hidden
                            if(isMobile){
                                $('#' + id).css('opacity', 0);
                            }
                            
                            $('#' + id).hide();
                        }
                    }
                    page.removeClass('modal');
                });
            } else {
                // Hide other modals that should not be seen
                $('.page.modal').each(function() {
                    var page = $(this),
                        id = page.attr('id');
                    if (id !== pageId) {
                        if (!page.is(":hidden")) {
                            $('#' + id).hide();
                        }
                    }
                });
                $('#' + pageId).addClass('modal');
            }

            // can we remove the whole page from here??
            if(pageId !== 'page-embed360-video' && $('#page-embed360-video').length !== 0){
                //$('#page-embed360-video.embed360').find('.embedPlayerDiv').empty();
                window.embed360Video.removePlayer();
                
            }

            if (Tn.arkTanId && pageId === 'page-video') {
                Tn.showComments(Tn.arkTanId);
            } else {
                Tn.showComments();
            }

            Tn.currentPage = pageId;
            Tn.updateActiveNavLink(pageId);

            // we are working with opacity here to try to avoid the carousel pages on ipad showing the new page
            // before the old page is full hidden
            if (isMobile) {
                $('#' + pageId).css('opacity', 1);
            }

            var viewport_width = window.innerWidth || document.documentElement.offsetWidth  || document.documentElement.clientWidth || document.body.clientWidth;
            window.ad_page_mode = "TABLET_OR_DESKTOP"; // Also seen in head.jsp
            if (viewport_width < 601){ 
                window.ad_page_mode = "MOBILE"
            }
            $('#headerAds').find('.banner_ad').addClass('tn-hidden');
            var goodAdInfoObj = window.adHelper.specialAdsInfoPerURL(url);
            if(goodAdInfoObj.theClass && ad_page_mode === "MOBILE"){
                $('#headerAds').find('.banner_ad.' + goodAdInfoObj.theClass ).removeClass('tn-hidden');
                $(window.adHelper.mobileAdWrapperSelector).show();
                $('#' + pageId).addClass('hasMobileAd');
            } else {
                $(window.adHelper.mobileAdWrapperSelector).hide();
                $('#' + pageId).removeClass('hasMobileAd');
            }

            $('#' + pageId).show().trigger('pageshow');
            $('body').trigger('pageshown', pageId);

            // Check to see if we're on the video player page
            if (pageId === 'page-video') {
                $('#page-video').addClass('shown');
            } else if ($('#page-video').hasClass('shown')) {
                // Hide the video player if we're not on the video page
                $('#page-video').removeClass('shown');
                $('body').removeClass('video-page');
                if (window.turnerVideo) {
                    try {
                        // console.log(window.turnerVideo.player.isPaused());
                        // if the player is already paused we do not want/need to pause it again
                        // and send the analytics event
                        if(!window.turnerVideo.player.isPaused()){
                            window.turnerVideo.pause();
                        }
                    } catch (e) {
                        console.error("Error pausing video", e.message);
                    }
                }
            }

            if (pageId === 'page-video') {
                $('body').attr('id', 'video-page');
            } else if (pageId === 'page-shows') {
                $('body').attr('id', 'shows-page');
            } else if (pageId === 'page-schedule') {
                $('body').attr('id', 'schedule-page');
            } else if (pageId === 'page-schedule-list') {
                $('body').attr('id', 'schedule-page-list');
            } else if (pageId === 'page-livetv') {
                $('body').attr('id', 'livetv-page');
            } else if (pageId === 'page-movies') {
                $('body').attr('id', 'movies-page');
            } else if (pageId === 'page-landing') {
                $('body').attr('id', 'landing-page');
            } else if (pageId === 'page-search') {
                $('body').attr('id', 'search-page');
            } else if (pageId === 'page-embed360-video') {
                $('body').attr('id', 'embed360-video-page');
            }else {
                $('body').attr('id', '');
            }
        },

        profileerror: function(msg, skipClear) {
            console.log(msg);
            if( !skipClear ){
                window.toastr.clear();
            }

            msg = ( typeof(msg) === 'string' && msg.length > 1 )?msg:"We experienced a problem with your profile. Please try again.";

            window.toastr.options.onclick = undefined;
            $.extend(window.toastr.options, {
                "closeButton": true,
                "timeOut": "5000",
                "extendedTimeOut": "5000"
            });
            window.toastr.warning(msg);
        },

        success: function(msg) {
            console.log(msg);
            window.toastr.clear();

            window.toastr.options.onclick = undefined;
            $.extend(window.toastr.options, {
                "closeButton": true,
                "timeOut": "5000",
                "extendedTimeOut": "5000"
            });

            window.toastr.success(msg);
        },

        confirm: function(msg, callback) {
            console.log(msg);
            window.toastr.clear();

            window.toastr.options.onclick = callback;
            $.extend(window.toastr.options, {
                "closeButton": true,
                "timeOut": "15000",
                "extendedTimeOut": "5000"
            });

            window.toastr.info(msg);
        },

        legalMessage: function(msg, options) {
            console.error(msg);
            window.toastr.clear();

            window.toastr.options = {
                "closeButton": true,
                "timeOut": "3000000",
                "extendedTimeOut": "3000000"
            };
            $.extend(window.toastr.options, options || {});

            window.toastr.error(msg);
        },

        tvealert: function(msg) {
            console.error(msg);
            msg = "We experienced a problem with your TV Provider information. Please refresh or try again.";
            window.toastr.clear();

            window.toastr.options = {
                "closeButton": true,
                "timeOut": "3000000",
                "extendedTimeOut": "3000000"
            };

            window.toastr.options.onclick = function() {
                window.location.reload();
            };

            window.toastr.error(msg);
        },

        authalert: function(msg) {
            console.error(msg);
            window.toastr.clear();

            window.toastr.options = {
                "closeButton": true,
                "timeOut": "5000",
                "extendedTimeOut": "5000"
            };

            window.toastr.error(msg);
        },


        alert: function(msg, doReload) {
            console.error(msg);

            if(msg ==='blackoutMsg'){
                msg = "This game is not available in your area.";
            } else if(msg === 'blackoutTechIssue') {
                msg = "We are experiencing technical difficulties. Please try again later.";
            } else {
                msg = "We experienced a problem loading your content. Please refresh or try again.";
            }
            
            window.toastr.clear();

            window.toastr.options = {
                "closeButton": true,
                "timeOut": "3000000",
                "extendedTimeOut": "3000000"
            };

            if (doReload) {
                window.toastr.options.onclick = function() {
                    window.location.reload();
                };
            } else {
                window.toastr.options.onclick = undefined;
                $.extend(window.toastr.options, {
                    "closeButton": true,
                    "timeOut": "5000",
                    "extendedTimeOut": "5000"
                });
                window.toastr.warning(msg);
                return;
            }

            window.toastr.error(msg);
        },

        showPjaxSplash: function(shown) {
            var splash = $('#pjax-splash');
            if (shown) {
                // if (Tn.currentPage === 'page-video' || Tn.startedOnVideoPage) {
                //     return;
                // }
                if (splash.length === 0) {
                    splash = $('<div id="pjax-splash"></div>');
                    splash.insertBefore('footer');
                }
                splash.show();
                return;
            }
            splash.hide();
        },

        launchProtocol: function(url) {
            var launcher = $('#protocol-launcher');
            if (launcher.length === 0) {
                launcher = $('body').append('<iframe src="' + url + '" style="position: fixed; margin-left: -100000px;"></iframe>');
            } else {
                launcher.attr('src', url);
            }
        },

        parseHistoryPage: function(url, data) {

            // Hide our dialogs if page changes
            $('#profile-dialog').modal('hide');
            Tn.Users.cancelLogin();

            //console.error("SETTING URL:", url);
            window.currentPageUrl = url;
            var pageId = data.pageId;
            $('body').toggleClass('page-modal', data.isModal ? true : false);
            if (pageId === 'page-video') {
                if (Tn.firstAuth) {
                    Tn.firstAuthVideoUrl = url;
                } else {
                    Tn.showPlayerInternal(url);
                }
            } else {
                window.turnerVideoPageObj.stopAdInTrayReloader();
                if (data.isModal) {
                    Tn.showInfoPage(url, pageId || "page-unknown");
                } else {
                    Tn.showPage(pageId || "page-unknown", url);
                }
            }
            //console.error("isModal", data.isModal);
        },

        getPageTitleFromData: function(data) {
            var title = "Shows";
            try {
                title = data.match(/<title[^>]*>([\s\S.]*)<\/title>/i)[1];
            } catch (e) {

                // In case we get a rare page without a title
                console.error("getPageTitleFromData", e.message);
            }
            return title;
        },

        // Temporarily grab the shows carousel and pull the first video from there
        showDefaultVideo: function() {
            if (window.turnerVideo.savedState && window.turnerVideo.savedState.url) {
                var index = window.turnerVideo.savedState.url.indexOf('/videos');

                // For dev purposes, strip out the hosts so that the videos can be shared across domains
                if (index >= 0) {
                    Tn.showPlayer(window.turnerVideo.savedState.url.substring(index));
                } else {
                    Tn.showPlayer(window.turnerVideo.savedState.url);
                }
                return;
            }

            // Use a featured video if no video found in user profile
            Tn.getFeaturedVideos(function(videos) {
                if (videos.length > 0) {
                    console.error("Playing default video", videos[0]);
                    Tn.showPlayer(videos[0].prettyVideoUrl);
                    return;
                }

                // If no featured videos found, then pull from the shows page
                Tn.showPjaxSplash(true);
                $.ajax({
                    url: "/shows/",
                    dataType: 'text'
                }).always(function(data) {
                    Tn.showPjaxSplash(false);
                    if (typeof data === 'string') {
                        data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
                        var url = '';
                        $(data).find('.item').each(function() {
                            var $el = $(this);
                            if ($el.find('span').attr('isPlayable') === 'true') {
                                url = $el.find('a[data-id="video-href"]').attr('href');
                                return false;
                            }
                        });
                        if (url.length > 0) {
                            Tn.showPlayer(url);
                        } else {
                            Tn.alert("No valid video found");
                        }
                    } else {
                        Tn.alert("No default video available");
                    }
                });
            });
        },

        parseAnalytics: function(meta, isModal) {
            if (!meta) {
                return;
            }

            // If analytics didn't get initialized properly, then skip
            if (!window._jsmd) {
                return;
            }
            //console.error("Sending analytics", window.currentPageUrl, meta);
            window.turner_metadata = meta;
            if (isModal) {
                window.turner_metadata.content_type = "other:overlay";
            }

            var pageURL = window.currentPageUrl;
            // Don't send() if we are 'History.back' here because of a authentication fail
            if (pageURL.indexOf("/.element/ssi/ads.iframes/") === -1 && pageURL.indexOf("/doubleclick/dartiframe.html") === -1 && (!window.pageStateChanges || !window.pageStateChanges.authFail)) {
                //var jsmd = window._jsmd.init();
                //jsmd.send();
                try {
                    var jsmd = window._jsmd.init();
                    jsmd.send();
                } catch (e) {
                    console.log("jsmd did not init or send correctly");
                    console.log(e);
                }
            }
        },

        parseRawAnalytics: function(data, isModal, defer) {
            var match = data.match(/var turner_metadata = {([\s\S.]*?)}/i);
            if (!match || match.length !== 2) {
                return;
            }
            var meta = $.parseJSON('{' + match[1] + '}');
            if (!defer) {
                Tn.parseAnalytics(meta, isModal);
            }
            return $.extend({}, meta);
        },

        setFallbackPage: function() {
            if (!Tn.fallbackInfoPage) {
                return;
            }
            setTimeout(function() {
                if (!Tn.fallbackInfoPage) {
                    return;
                }
                // Special case for live TV
                // TODO : Pick a generic method which will work for TBS and other sites
                if (Tn.fallbackInfoPage.toLowerCase().indexOf('/watch') >= 0) {
                    Tn.setUrl(Tn.fallbackInfoPage, false, 'page-livetv');
                } else {
                    Tn.setUrl(Tn.fallbackInfoPage, true, 'page-generic');
                }
                delete Tn.fallbackInfoPage;
            }, 100);
        },

        showPage: function(pageId, url) {
            if ($('#' + pageId).length === 0 && url) {
                Tn.showPjaxSplash(true);
                $.ajax({
                    url: url,
                    dataType: 'text'
                }).done(function(data) {
                    var meta = Tn.parseRawAnalytics(data);

                    if (!Tn.titles[pageId]) {
                        Tn.titles[pageId] = {
                            title: Tn.getPageTitleFromData(data),
                            meta: meta
                        };
                    }
                    window.document.title = Tn.titles[pageId].title;

                    data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
                    //console.error(video.length, $(data).find('#page-video'));
                    var page = $(data).find('#' + pageId);
                    if (page.length === 0) {
                        Tn.alert("Page not found<br>" + url);
                    } else {
                        //Tn.setUrl(url, false, pageId);
                        page.insertAfter('header');
                        Tn.finalizePage(pageId, url);
                    }
                }).fail(function() {
                    Tn.alert("Failed to load page<br>" + url);
                }).always(function() {
                    Tn.showPjaxSplash(false);
                });
            } else {
                // if (url) {
                //     Tn.setUrl(url, false, pageId);
                // }
                if (Tn.titles[pageId] && pageId !== 'page-video') {
                    window.document.title = Tn.titles[pageId].title;
                    Tn.parseAnalytics(Tn.titles[pageId].meta, false);
                } else if (pageId !== 'page-generic' && window.turner_metadata) {
                    Tn.titles[pageId] = {
                        title: window.document.title,
                        meta: $.extend({}, window.turner_metadata)
                    };
                }
                Tn.finalizePage(pageId, url);
            }
        },

        showPlayer: function(url) {
            //Tn.showPage('page-video');
            //Tn.updateActiveNavLink('page-video');
            this.lastPageUrl = window.currentPageUrl;
            var pageId = 'page-video';
            var pattern360 = new RegExp('\/videos\/.*/360\/.*');
            if (pattern360.test(url)) {
                // match found
                pageId = 'page-embed360-video';
            }
            Tn.setUrl(url, false, pageId);
        },

        showPlayerInternal: function(url) {
            if (!url || url.length === 0) {
                Tn.alert("No video url specified");
                return;
            }
            
            if (Tn.lastVideoUrl && (Tn.lastVideoUrl.indexOf(url) > -1 || url.indexOf(Tn.lastVideoUrl) > -1)) {
                Tn.showPage('page-video');
                $('#page-video').addClass('shown');
                $('body').addClass('video-page');
                Tn.updateActiveNavLink('page-video');
                window.turnerVideo.play();
                if (Tn.lastVideoAnalytics) {
                    window.turner_metadata = Tn.lastVideoAnalytics;
                }
                if(refreshLiveStreamData !== true){
                    return;
                }
            }
            Tn.series4VideoPlaying = false;
            Tn.sponsoredNextSeries4VideoPlaying = false;
            Tn.videoPlayingIsSponsored = false;

            window.turnerVideo.showSplash();
            if (Tn.currentPage.length !== 0 && Tn.currentPage !== "page-video") {
                Tn.showPjaxSplash(true);
            }
            $.ajax({
                url: url,
                dataType: 'text'
            }).always(function(data) {
                Tn.showPjaxSplash(false);

                if (typeof data === 'string') {
                    var noAuth, titleId, clipId, dataType, vidpage, aPlaylistSeriesMatch,
                        video = $('#page-video'), 
                        dataAsString = data;
                    data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
                    vidpage = $(data).find('#page-video');
                    Tn.fallbackInfoPage = vidpage.attr("infopage");
                    Tn.videosAssociatedInfoPage = Tn.fallbackInfoPage;
                    Tn.sponsoredNextSeries4VideoPlaying = vidpage.attr("sponsoredNext");
                    if(typeof(Tn.sponsoredNextSeries4VideoPlaying) == 'string'){
                        Tn.sponsoredNextSeries4VideoPlaying = Tn.sponsoredNextSeries4VideoPlaying.toLowerCase();
                    }
                    Tn.videoPlayingIsSponsored = (Tn.sponsoredNextSeries4VideoPlaying && Tn.sponsoredNextSeries4VideoPlaying.length > 0)?true:false;

                    aPlaylistSeriesMatch = url.match('/videos/([^/]*)/');
                    if(aPlaylistSeriesMatch && typeof(aPlaylistSeriesMatch) === 'object' && aPlaylistSeriesMatch.length > 0 ){
                        playlistSeriesName = aPlaylistSeriesMatch[1];
                        Tn.series4VideoPlaying = playlistSeriesName;
                    } else {
                        Tn.series4VideoPlaying = false;
                    }
                    //turner_metadata.series_name

                    // No auth will only get set if we explicitly say it is false.
                    noAuth = vidpage.attr("isAuthRequired") === "false" ? true : false;

                    //Return/go back portion for unauthenticated users
                    if (!noAuth && !Tn.Auth.authenticated) {
                        Tn.Auth.getAuthentication(url);
                        if (Tn.lastPageUrl) {
                            delete Tn.fallbackInfoPage;
                            setTimeout(function() {
                                window.pageStateChanges = (window.pageStateChanges) ? window.pageStateChanges : {};
                                window.pageStateChanges['authFail'] = true;
                                History.back();
                                //Tn.setUrl(this.lastPageUrl);
                                delete Tn.lastPageUrl;
                            }, 100);
                        }
                        return;
                    }

                    Tn.lastVideoAnalytics = Tn.parseRawAnalytics(dataAsString, false);
                    if (Tn.lastVideoAnalytics) {
                        window.turner_metadata = Tn.lastVideoAnalytics;
                    }
                    window.document.title = Tn.getPageTitleFromData(dataAsString);

                    // Copy the new pages attribute over onto out existing page
                    var attributes = vidpage.prop("attributes");
                    $.each(attributes, function() {
                        // We don't care about resetting the class or the mode
                        if (this.name === 'class' || this.name === 'mode') {
                            return;
                        }
                        video.attr(this.name, this.value);
                    });
                    
                    //Need to replace the ad tag on the video page
                    if(refreshLiveStreamData !== true){
                        if (window.adHelper && video.length) {
                            //window.adHelper.replaceAdTag(video, vidpage);
                        }
                    }

                    // Set the arktanid before the page gets shown
                    Tn.arkTanId = vidpage.attr("arktanStreamId");
                    Tn.lastVideoUrl = url;
                    titleId = vidpage.attr("titleid");
                    clipId = vidpage.attr("clipId");
                    Tn.videoType = vidpage.attr("type");
                    dataType = $(vidpage).find('#pane-info > div[data-type]').data('type');
                    if (video.length === 0) {
                        vidpage.insertAfter('header');

                        // Initialize the resizers if this is the first time the video is added to the page
                        window.turnerVideoPageObj.init();
                        video = $('#page-video');
                    } else {
                        video.find('#pane-info').html(vidpage.find('#pane-info').html());
                        video.find('#paused-sharebar').html(vidpage.find('#paused-sharebar').html());
                        video.find('#pane-share').html(vidpage.find('#pane-share').html());
                    }
                    // episode and clips have arktan id's and social tabs.
                    if (Tn.arkTanId) {
                        video.find('aside #arktan-comments').show();
                        //video.find('#pane-share').show();

                    } else {
                        video.find('aside #arktan-comments').hide();
                        //video.find('#pane-share').hide();
                    }
                    
                    Tn.showPage('page-video');

                    // Update the server generated hours:min:sec to say minutes
                    $('#pane-info .metainfo .duration, #pane-info .metainfo .movieduration').each(function() {
                        var hms = $(this).text().split(':');
                        var duration = 0;
                        // this converts the duration to seconds
                        if (hms.length === 1) {
                            duration = parseFloat(hms[0]);
                        } else if (hms.length === 2) {
                            duration = parseInt(hms[0], 10) * 60 + parseFloat(hms[1]);
                        } else if (hms.length === 3) {
                            duration = parseInt(hms[0], 10) * 60 * 60 + parseInt(hms[1], 10) * 60 + parseFloat(hms[2]);
                        }
                        
                        //duration = window.turnerVideo.toHHMMSS(duration, true);
                        //all the duration display is now going through Tn.formatDuration excpet durations within turnerVideo
                        duration = Tn.formatDuration(duration);
                        $(this).text(duration);
                        
                    });
					if(refreshLiveStreamData !== true){
						if ((typeof(titleId) === 'undefined' || titleId.length === 0) && (typeof(clipId) === 'undefined' || clipId.length === 0)) {
							Tn.alert("Video not found on server page<br>" + url);
						} else {
							window.turnerVideo.load({
								// 'site': 'tnt',
								// 'profile': '0',
								// 'context': 'main',
								// 'fullEpId': parseInt(titleId, 10),

								'site': window.siteDefaults.name.toLowerCase(),
								'profile': '0',
								'context': 'fw_watchlive',
								//'fullEpId': 523704
								'fullEpId': parseInt(titleId, 10),
								'clipId': parseInt(clipId, 10)
							});
						}
                    }
                } else {
                    Tn.showPage('page-video');
                    Tn.lastVideoUrl = url;
                    Tn.alert("Video not found on server<br>" + url);
                }

                $('#page-video').addClass('shown');
                $('body').addClass('video-page');
                Tn.updateActiveNavLink('page-video');

                $('#page-video').show().trigger('pageshow');
                $('body').trigger('pageshown', 'page-video');

                window.refreshLiveStreamData = false;
            });
        },

        showInfoPage: function(url, pageId) {
            // Search is a special case where we want the data to remain, but still keep the modal state
            if (pageId === 'page-search' && $('#page-search').length > 0) {
                Tn.showPage(pageId);
                return;
            }

            Tn.showPjaxSplash(true);
            $.ajax({
                url: url,
                dataType: 'text'
            }).always(function() {
                Tn.showPjaxSplash(false);
            }).fail(function() {
                Tn.alert("Page not found<br>" + url);
            }).success(function(data) {
                Tn.parseRawAnalytics(data, true);
                window.document.title = Tn.getPageTitleFromData(data);

                var newData, page = $('#' + pageId);
                data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);

                if (page.length === 0) {
                    page = $('<div class="page" id="' + pageId + '"></div>');
                    page.insertAfter($('header').parent().children(':last'));
                }

                // Check to see if we have a DIV with out page ID
                newData = $(data).find('#' + pageId);

                // If no DIV found, then look for the first page we can find
                if (newData.length === 0) {
                    newData = $(data).find('.page');
                }

                // We have to have a page
                if (newData.length === 0) {
                    Tn.alert("No page pulled in<br>" + url);
                } else {
                    // Update the new content for this page
                    page.html(newData.html());
                }

                Tn.showPage(pageId);
            });
        },

        setUrl: function(url, isModal, pageId) {
            Tn.stateFrozen = true;
            // from the search results, the sport pages have a url of /shows/sportname.html
            // redir.conf has been updated for outside urls, but we need to 'fix' the url within the webapp as well
            // without this check, the correct page was pulling up (due to the redir.conf rule); but the url was not displaying
            // correctly in the location bar
            if(url === '/shows/mlb.html' ||
                url === '/shows/nba-on-tnt.html' ||
                url === '/shows/pga-on-tnt.html'){
                url = url.replace('/shows/','/sports/');
            }
            //History.pushState(null, null, url);
            HistoryHelper.changeStateHelper({
                "nextPageUrl": url,
                "isModalLinkClick": isModal,
                "pageId": pageId
            });
            Tn.stateFrozen = false;
        },

        /**
         * Returns the featured videos JSON object
         */
        getFeaturedVideos: function(cb, showSplash) {
            if (Tn.featuredVideosData) {
                cb(Tn.featuredVideosData);
            }

            if (showSplash) {
                Tn.showPjaxSplash(true);
            }

            $.getJSON('/service/featureVideos.json').done(function(data) {
                if (!data || !data.featuredItems || data.featuredItems.length <= 0) {
                    Tn.featuredVideosData = [];
                } else {
                    Tn.featuredVideosData = data.featuredItems;
                }
                cb(Tn.featuredVideosData);
            }).fail(function() {
                console.error("getFeaturedVideos::failed to load featured videos");
            }).always(function() {
                if (showSplash) {
                    Tn.showPjaxSplash(false);
                }
            });
        },

        getPageCarousel: function() {
            var page = $('#' + Tn.currentPage);
            if (page.hasClass('pagecarousel')) {
                return page;
            }
            return null;
        },

        getVideoInfo: function(id, cb) {
            // Find the current video in the stack and play the next video after that
            Tn.getCarouselData(function(carousels, rows) {

                var lastVideo;
                $.each(rows, function(showIndex) {
                    $.each(carousels[showIndex], function(index, ep) {
                        if (parseInt(ep.titleid, 10) === id) {
                            lastVideo = ep;
                        }
                    });
                });

                cb(lastVideo);
            }, true);
        },

        updateCommentsHeight: function(height) {
            $('#arktan-comments iframe').height(height);
        },

        showComments: function(arktanStreamId) {
            $('#arktan-comments').empty();
            if (!arktanStreamId || arktanStreamId.length === 0) {
                return;
            }
            document.domain = document.domain;
            $('#arktan-comments').append('<iframe src="/includes/comments.html?id=' + arktanStreamId + '&domain=' + document.domain + '" style="width:100%;border:0;"></iframe>');
        }
    });

    /**
     * @class Tn.Auth
     * Takes care of authorization routines
     */

    function createAuth(options) {

        Tn.Auth = {
            clientId: window.siteDefaults.name,
            vendorEnv: authVendorEnvId,
            configEnv: authConfigEnvId,
            authReady: false,
            authBool: false,
            authenticated: false
        };

        window.tntAuth = Tn.Auth;

        $.extend(Tn.Auth, options, {
            /**
             * Gets the authentication for the method
             * @param  {String} redirUrl The URL to redirect to
             */
            getAuthentication: function(redirUrl) {

                if (isMobile) {
                    Tn.mobileAuthShown = true;
                    $('#mobile-app-dialog').modal('show');
                    return;
                }
                Tn.Auth.isChecking = true;

                if (redirUrl && redirUrl.charAt(0) === '/') {
                    redirUrl = window.location.protocol + "//" + window.location.host + redirUrl;
                }
                if (Tn.Auth.authReady) {
                    //console.log('getAuthentication');
                    if (!window.hasReportedPickerOpen){
						Tn.parseAnalytics({
							"url_section": "",
							"section": "profile",
							"subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " login",
							"template_type": "adbp:misc",
							"content_type": "other:layer",
							"search.keyword": "",
							"search.number_results": "",
							"friendly_name": window.siteDefaults.name.toLowerCase() + " tve picker icon",
							"series_name": ""
						}, false);
                    	window.hasReportedPickerOpen = true;
                    }
                    CVP.AuthManager.on('pickerStateChange', function (state){
                    	//console.log(state.state);
                    	if (state.state === "findbyname" && !window.hasReportedPickerList){
						   Tn.parseAnalytics({
							   "url_section": "",
							   "section": "profile",
							   "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " login",
							   "template_type": "adbp:misc",
							   "content_type": "other:layer",
							   "search.keyword": "",
							   "search.number_results": "",
							   "friendly_name": window.siteDefaults.name.toLowerCase() + " tve picker list",
							   "series_name": ""
						   }, false);
						   window.hasReportedPickerList = true;
						   window.hasReportedPickerOpen = false;
						   window.hasReportedPickerNoProvider = false;
                    	} else if (state.state === "noprovider" && !window.hasReportedPickerNoProvider){
						   Tn.parseAnalytics({
							   "url_section": "",
							   "section": "profile",
							   "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " login",
							   "template_type": "adbp:misc",
							   "content_type": "other:layer",
							   "search.keyword": "",
							   "search.number_results": "",
							   "friendly_name": window.siteDefaults.name.toLowerCase() + " tve  provider not available",
							   "series_name": ""
						   }, false);
						   window.hasReportedPickerNoProvider = true;
						   window.hasReportedPickerList = false;
						   window.hasReportedPickerOpen = false;
                    	
                    	}   else if(!window.hasReportedPickerOpen){
						   Tn.parseAnalytics({
							   "url_section": "",
							   "section": "profile",
							   "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " login",
							   "template_type": "adbp:misc",
							   "content_type": "other:layer",
							   "search.keyword": "",
							   "search.number_results": "",
							   "friendly_name": window.siteDefaults.name.toLowerCase() + " tve picker icon",
							   "series_name": ""
						   }, false);
						   window.hasReportedPickerOpen = true;
						   window.hasReportedPickerNoProvider = false;
						   window.hasReportedPickerList = false;
                    	}
                    });
                    Tn.Auth.AUTH.getAuthentication(redirUrl);
                }
            },
            /**
             * Logs out of the current TVE session
             */
            logout: function() {
                if (Tn.Auth.authReady && Tn.Auth.authBool) {
                    // Analytics: Remove user cookies on logout
                    if (typeof(Storage) !== undefined) {
                        if (localStorage.getItem("pickerauth") === "yes") {
                            localStorage.removeItem("pickerauth");
                        }
                    }
                    console.log('logout');
                    Tn.Auth.AUTH.logout();
                }
            },

            /**
             * Starts a check for the authorization of the specified video
             * @param  {String} waitingVideo The video to be authorized
             */
            checkAuthorization: function() {
                if (Tn.Auth.authReady) {
                    if (Tn.Auth.authBool) {
                        //Tn.showPjaxSplash(true);

                        // Allow up to 15 seconds for the authorization to succeed, else reload the page
                        Tn.authorizationTimer = setTimeout(function() {
                            //Tn.showPjaxSplash(false);
                            Tn.tvealert("Authorization has not returned in 15 seconds.<br>It has most likely timed out.", true);
                        }, 15000);

                        Tn.Auth.AUTH.checkAuthorization(Tn.Auth.clientId);
                    } else {
                        Tn.Auth.AUTH.getAuthentication();
                    }
                }
            },

            /**
             * Initializes the auth
             */
            load: function() {
                Tn.Auth.AUTH = CVP.AuthManager.init({
                    clientId: Tn.Auth.clientId,
                    vendorEnv: Tn.Auth.vendorEnv,
                    configEnv: Tn.Auth.configEnv,
                    swfStyleOverride: {
                        height: 5,
                        width: 5,
                        style: "z-index: 500; position: fixed; left: 0px; top: 0px;"
                    },
                    onPickerHelpClicked: function() {
                        window.open('/help.html');
                        //Tn.setUrl('/help.html', true, 'page-generic');
                    },
                    onInitReady: function() {
                        //console.log('auth manager is ready');
                        Tn.Auth.authReady = true;
                        Tn.Auth.AUTH.isAuthenticated();
                    },
                    onAuthenticationPassed: function(mvpdId, mvpdConfig) {
                        Tn.Auth.authenticated = true;
                        Tn.Auth.authBool = true;
                        Tn.brandImage = '';
                        if (mvpdConfig && (typeof mvpdConfig.cobrand !== 'undefined') && (typeof(mvpdConfig.cobrand[0]) !== 'undefined')) {
                            Tn.brandImage = mvpdConfig.cobrand[0].url;
                        }
                        Tn.updateBrandImage();

                        // If we ever get into this bad state, just do a window refresh, which will make it go away.
                        // We risk an infinite refresh issue here, but technically speaking, this should never happen.
                        if (!mvpdConfig) {
                            window.location.reload();
                        }

                        Tn.Auth.authenticated = true;
                        if (Tn.Auth.onAuthorized) {
                            Tn.Auth.onAuthorized();
                        }
                    },
                    onAuthenticationFailed: function(msg) {
                        if (msg === 'Provider not Selected Error') {
                            Tn.Auth.isChecking = false;
                            Tn.setFallbackPage();
                            // else {
                            //     Tn.alert("Please select a provider to watch video.");
                            // }
                        }

                        if (Tn.Auth.isChecking && !Tn.firstAuth) {
                            Tn.setFallbackPage();
                            //Tn.alert("Authentication Failed!<br>" + msg, true);
                            console.error("Error", arguments);
                        }

                        Tn.Auth.isChecking = false;
                        Tn.Auth.authenticated = false;
                        //console.log('authentication failed');
                        Tn.Auth.authBool = false;
                        Tn.brandImage = '';
                        Tn.updateBrandImage();
                        Tn.Auth.authenticated = false;
                        if (Tn.Auth.onFailedAuth) {
                            Tn.Auth.onFailedAuth();
                        }
                    },
                    onAuthorizationPassed: function() {
                        //Tn.showPjaxSplash(false);
                        if (Tn.authorizationTimer) {
                            clearTimeout(Tn.authorizationTimer);
                            delete Tn.authorizationTimer;
                        }
                        window.turnerVideo.playWithToken(Tn.Auth.AUTH.getAccessToken(null, null));
                    },
                    onAuthorizationFailed: function(resource, errorCode, errorString) {
                        //Tn.showPjaxSplash(false);
                        if (Tn.authorizationTimer) {
                            clearTimeout(Tn.authorizationTimer);
                            delete Tn.authorizationTimer;
                        }
                        Tn.authalert(errorString, true);
                    },
                    onTrackingData: function(trackingEventType, trackingData) {
                        switch (trackingEventType) {
                            case "authorizationDetection":
                                /*
                                 * [0] Whether the token request was successful
                                 * [true/false] and if true: [1] MVPD ID [string] [2]
                                 * User ID (md5 hashed) [string] [3] Whether it was
                                 * cached or not [true/false]
                                 */
                                // DEBUG
                                if (window.logAdobe === true) {
                                    console.log("onTrackingData | trackingEventType = " + trackingEventType + "; " + trackingData);
                                }
                                // populate Omniture Metrics
                                if (trackingData[0] === true) {
                                    // if cached == true
                                    if (trackingData[3] === true) {
                                        window.trackAlreadyLoggedInPage(trackingData);
                                    } else {
                                        // else just redirected back from authorization
                                        window.trackAuthenticationComplete(trackingData);
                                    }
                                } else {
                                    if (!window.hasSetFirstMetric) {
                                        // populate Omniture Metrics
                                        window.trackNotLoggedInPage();
                                        window.hasSetFirstMetric = true;
                                    }
                                }
                                break;
                            case "authenticationDetection":
                                /*
                                 * [0] Whether the token request was successful
                                 * [true/false] and if true: [1] MVPD ID [string] [2]
                                 * User ID (md5 hashed) [string] [3] Whether it was
                                 * cached or not [true/false]
                                 */
                                // populate Omniture Metrics
                                if (trackingData[0] === true) {
                                    window.fw_ae = trackingData[1];
                                    window.fw_ae = $.md5(window.fw_ae.toLowerCase());
                                    if (trackingData[3] === true) {
                                        window.trackAlreadyLoggedInPage(trackingData);
                                    } else {
                                        // else just redirected back from authorization
                                        window.trackAuthenticationComplete(trackingData);
                                    }
                                } else {
                                    if (!window.hasSetFirstMetric) {
                                        // populate Omniture Metrics
                                        window.trackNotLoggedInPage();
                                        window.hasSetFirstMetric = true;
                                    }
                                }
                                break;
                            case "mvpdSelection":
                                /* [0] MVPD ID */
                                window.trackAuthenticationStart(trackingData);
                                break;
                            default:
                                if (window.logAdobe === true) {
                                    console.log("trackingEventType = " + trackingEventType + "; " + trackingData);
                                }
                                break;
                        }
                        if (typeof window.onTrackingDataCallback === 'function') {
                            window.onTrackingDataCallback(trackingEventType, trackingData);
                        }
                    }
                });
            }
        });

        Tn.Auth.load();
        return Tn.Auth;
    }


    Tn.onReady(function() {
        logStartup('Creating Auth');
        Tn.Auth = createAuth({
            onAuthorized: function() {
                if (Tn.firstAuth) {
                    Tn.firstAuth = false;

                    if (Tn.firstAuthVideoUrl) {
                        Tn.showPlayerInternal(Tn.firstAuthVideoUrl);
                    }
                    // var curVideo = Tn.gup('video');
                    // if (curVideo.length > 0) {
                    //     Tn.showPlayer();
                    // }
                    //window.turnerVideo.load();

                    // if (Tn.currentPage === 'page-video') {
                    //     Tn.showPlayer(window.location.href);
                    // }
                }
            },
            onFailedAuth: function() {
                if (Tn.firstAuth) {
                    Tn.firstAuth = false;
                    var authVideoId = $('#page-video').attr("titleid");
                    var noAuth = $('#page-video').attr("isAuthRequired") === "false" ? true : false;
                    Tn.fallbackInfoPage = $('#page-video').attr("infopage");
                    if (noAuth && authVideoId) {
                        Tn.showPlayerInternal(Tn.firstAuthVideoUrl);
                    } else if (typeof authVideoId !== "undefined" && authVideoId.length !== 0) {
                        setTimeout(function() {
                            if (isMobile) {
                                Tn.showPlayerInternal(Tn.firstAuthVideoUrl);
                            } else {
                                Tn.Auth.getAuthentication(window.currentPageUrl);
                            }
                        }, 10);
                    } else {
                        var clipId = $('#page-video').attr("clipId");
                        if (typeof clipId !== "undefined" && clipId.length !== 0) {
                            Tn.showPlayerInternal(Tn.firstAuthVideoUrl);
                        }
                    }
                }
            }
        });

        logStartup('Binding click events');
        $(".signin-wrapper .mvpd-logged-out a").on("click", function(event) {
            event.preventDefault();
            Tn.Auth.getAuthentication(window.currentPageUrl);
        });
        $(".mvpd-show-picker").on("click", function(event) {
            event.preventDefault();
            Tn.Auth.getAuthentication(window.currentPageUrl);
        });
        $(".mvpd-sign-out").on("click", function(event) {
            event.preventDefault();
            Tn.Auth.logout();
        });
        $(".signin-wrapper .mvpd-logged-in").on("click", function(event) {
            event.preventDefault();
            Tn.Auth.logout();
        });

        logStartup('Setting initial page');
        // Initialize the default page
        if (isMobile) {
            $('body').addClass('is-mobile');
        }
        Tn.currentPage = $("body").attr('curpage') || '';
        if (Tn.currentPage.length === 0) {
            var pages = $(".page");
            if (pages.length > 0) {
                //var page = pages.get(0).id;
                var page;
                // for schedule there are 2 possible pages, page-schedule and page-schedule-list
                if(window.currentPageUrl.indexOf('/schedule/') !== -1){
                    if (tnVars.isIPhone || tnVars.isIPod || (window.tnVars.getPlatform() === 'mobile tablet android 2.2') || (window.tnVars.getPlatform() === 'mobile android 4.3') || (window.tnVars.getPlatform() === 'mobile android 4.1') || (window.tnVars.getPlatform() === 'mobile android 2.3')) {
                        page = 'page-schedule-list';
                    } else if(window.currentPageUrl.indexOf('/list') !== -1){
                        page = 'page-schedule-list';
                    } else {
                        page = 'page-schedule';
                    }
                } else {
                    page = pages.get(0).id;
                }
                // TODO: The initial page still has an analytics issue
                /*                if (window.turner_metadata) {
                    // If we come onto a modal page, we can't do this otherwise it will find the modal pageId in the object
                    // We probably have to statically define which pages we want to default here
                    Tn.titles[pageId] = {
                        title: window.document.title,
                        meta: $.extend({}, window.turner_metadata);
                    };                    
                }*/
                HistoryHelper.init(false, page);
                Tn.parseHistoryPage(window.currentPageUrl, History.getState().data);
            } else {
                HistoryHelper.init(false, "page-unknown");
            }
        }

        logStartup('Binding page links');

        $('a[pageid], a[data-toggle]').on('click', function(event) {
            event.preventDefault();
            Tn.closeMenu();
            var $this = $(this);
            var pageId = $this.attr('pageId');
            if (!pageId) {
                return;
            }
            Tn.setUrl($(this).attr('href'), $this.attr('modal') === '1' ? true : false, pageId);
            return false;
        });

        //make schedule link default to list view for phones
        $('.navitem-schedule > div').on('click', function(e) {
            e.preventDefault();
            Tn.closeMenu();
            if (tnVars.isIPhone || tnVars.isIPod || tnVars.isWindows || (tnVars.isAndroid && !tnVars.isAndroidTablet())) {
                Tn.setUrl('/schedule/list.html', false, 'page-schedule-list');
            } else {
                 Tn.setUrl('/schedule/', false, 'page-schedule');
            }
            return false;
        });

        //  for touch screens, the click event is too slow on it's own, so we will trigger it at touchstart 
        //  adding time of lastMenuClick for the button; to try to prevent double click events in android
        $('button.navbar-toggle').on('touchstart', function(event){
            event.preventDefault();
            var now = new Date().getTime();
            window.tnVars.lastMenuClick = now;
            if ($('#navmain').hasClass('in')) {
                $('#navmain').collapse('hide');
                window.tnVars.enableWindowScroll();
            } else {
                $('#navmain').collapse('show');
                window.tnVars.disableWindowScroll();
            }
        });
        $('button.navbar-toggle').on('click', function(event){
            event.preventDefault();
            var lastMenuClick = window.tnVars.lastMenuClick;
            var now = new Date().getTime();
            if((now - lastMenuClick) > 300){
                window.tnVars.lastMenuClick = now;
                if ($('#navmain').hasClass('in')) {
                    $('#navmain').collapse('hide');
                    window.tnVars.enableWindowScroll();
                } else {
                    $('#navmain').collapse('show');
                    window.tnVars.disableWindowScroll();
                }
            }
        });

        $('#legal a').on('click', function(event) {
            if (this.id === window.siteDefaults.name.toLowerCase()+'_adchoices') {
                return;
            } else {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-generic');

            }
        });

        $('#modal-back-btn').on('click', function(event) {
            event.preventDefault();
            History.back();
        });

        $('#mobile-app-dialog .download').on("click", function() {
            event.preventDefault();

            if (tnVars.isKindle) {
                window.location.href = window.siteDefaults.feeds.kindle;
                return;
            }

            if (tnVars.isAndroid) {
                if (tnVars.isAndroidTablet()) {
                    window.location.href = window.siteDefaults.feeds.androidTablet;
                } else {
                    window.location.href = window.siteDefaults.feeds.androidPhone;
                }
                return;
            }

            if (tnVars.isIPad) {
                setTimeout(function() {
                    window.location = window.siteDefaults.feeds.ipadStore;
                }, 50);
                window.location.href = window.siteDefaults.feeds.ipadProtocol;
                return;
            }

            if (tnVars.isIPhone) {
                setTimeout(function() {
                    window.location = window.siteDefaults.feeds.iphoneStore;
                }, 50);
                window.location.href = window.siteDefaults.feeds.iphoneProtocol;
                return;
            }

            // Fallback message if we don't handle this mobile platform
            alert("Your platform is currently not supported.");
        });

        $('.hide-watch-later').on({
            click: function() {
                //event.preventDefault();
                var checkbox = $('#hide-watch-later');
                checkbox.prop("checked", !checkbox.prop("checked"));
            }
        });

        $('#continue-watching-dialog').on({
            "hidden.bs.modal": function() {
                var checkbox = $('#hide-watch-later');
                if (checkbox.prop('checked')) {
                    $.cookie('hidewatch', '1', {
                        expires: 365,
                        path: '/'
                    });
                } else {
                    $.removeCookie('hidewatch', {
                        path: '/'
                    });
                }
            }
        });

        $('#mobile-app-dialog .cancel').on({
            "click": function() {
                event.preventDefault();
                $('#mobile-app-dialog').modal('hide');
            }
        });

        $('#mobile-app-dialog').on({
            "shown.bs.modal": function() {
                Tn.mobileAuthShown = true;
            },
            "hidden.bs.modal": function() {
                Tn.mobileAuthShown = false;
                Tn.setFallbackPage();
            }
        });

        $('#welcome-dialog .create').on({
            "click": function(event) {
                event.preventDefault();
                $('#welcome-dialog').modal('hide');
                Tn.Users.logIn();
            }
        });

        $('#welcome-dialog .cancel').on({
            "click": function(event) {
                event.preventDefault();
                $('#welcome-dialog').modal('hide');
            }
        });
        $('#welcome-dialog .termslink').on({
            "click": function(event) {
                event.preventDefault();
                $('#welcome-dialog').modal('hide');
                Tn.setUrl("/terms.html", true, 'page-generic');
            }
        });
        $('#welcome-dialog .privacylink').on({
            "click": function(event) {
                event.preventDefault();
                $('#welcome-dialog').modal('hide');
                Tn.setUrl("/privacy.html", true, 'page-generic');
            }
        });
/*
        $('#welcome-dialog .secondary').on({
            "click": function(event) {
                event.preventDefault();
                $('#welcome-dialog').modal('hide');
                Tn.Users.logIn();
            }
        });
*/
        $('#welcome-dialog').on({
            "hidden.bs.modal": function() {},
            "shown.bs.modal": function() {
                /*$('#welcome-dialog img[data-src]').each(function() {
                    var el = $(this);
                    el.attr("src", el.attr("data-src"));
                    el.removeAttr("data-src");
                });*/
            }
        });

        function registerUIEvents(turnerVideo) {
            var clickEventType = ((document.ontouchstart !== null) ? 'click' : 'touchstart');

            $('.play-but').on("click", function(event) {
                event.preventDefault();
                turnerVideo.play();
            });

            $('#pause-but').on("click", function(event) {
                event.preventDefault();
                turnerVideo.pause();
            });

            $('#time-slider').on(clickEventType, function(e) {
                var pos = e.pageX - $(this).offset().left;
                var fullWidth = $('#time-slider').width();
                if (pos > fullWidth) {
                    pos = fullWidth;
                }
                turnerVideo.seek(pos, fullWidth);
            });

            $('#quickSeekBack').on("click", function(event) {
                event.preventDefault();
                turnerVideo.quickSeekBack();
            });

            // init the volume slider using simple-slider.js
            var volumeSlider = $('input#video-volume-input');
            volumeSlider.val(Tn.volumeLevel);
            console.log(volumeSlider.val());
            volumeSlider.simpleSlider({
                'theme':'volume',
                'highlight': true
            });

           $('input#video-volume-input').on("slider:changed", function (event, data) {
                // The currently selected value of the slider
                // console.log('changed: ' + data.value);
                // set the user volume level
                Tn.volumeLevel = data.value;
                // call the turnerVideo.setVolume which calls player.setVolume()
                turnerVideo.setVolume(Tn.volumeLevel);
                if(Tn.volumeLevel === 0 ){
                    $('#volume-but').html('<span class="glyphicon glyphicon-volume-off"></span>');
                } else {
                    $('#volume-but').html('<span class="glyphicon glyphicon-volume-up"></span>');
                }
                
            });
            if(!window.tnVars.isMobile()){
                $('#video-volume-slider').on("mouseenter", function(event) {
                    event.preventDefault();
                    // show or hide the video toggle
                    $(this).find('.slider-wrapper').fadeIn(200);
                }).on('mouseleave', function(event){
                    event.preventDefault();
                    $(this).find('.slider-wrapper').fadeOut(200);
                });
                $('#volume-but').on("click", function(event) {
                    event.preventDefault();
                    if(Tn.volumeLevel === 0 ){
                        // we will unmute
                        // we used the saved volume
                        volumeSlider.simpleSlider("setValue", Tn.defaultVolumeLevel);
                        $('#volume-but').html('<span class="glyphicon glyphicon-volume-up"></span>');
                    } else {
                        // we will mute
                        // we save the existing volume so if a user unmutes we can go back to it
                        //Tn.savedVolumeLevel = Tn.volumeLevel;
                        Tn.volumeLevel = 0;
                        volumeSlider.simpleSlider("setValue", Tn.volumeLevel);
                        $('#volume-but').html('<span class="glyphicon glyphicon-volume-off"></span>');
                    }
                });
            }
            
            $('#volume-but').on("touchend", function(event) {
                event.preventDefault();
                // show or hide the video toggle
                $('#video-volume-slider > .slider-wrapper').toggle();
            });

            Mousetrap.bind(['up', 'w'], function() {
                var page = Tn.getPageCarousel();
                if (!page) {
                    return;
                }
                page.pageCarousel('up');
            });
            Mousetrap.bind(['down', 's'], function() {
                var page = Tn.getPageCarousel();
                if (!page) {
                    return;
                }
                page.pageCarousel('down');
            });
            Mousetrap.bind(['left', 'a'], function() {
                var page = Tn.getPageCarousel();
                if (!page) {
                    return;
                }
                page.pageCarousel('left');
            });
            Mousetrap.bind(['right', 'd'], function() {
                var page = Tn.getPageCarousel();
                if (!page) {
                    return;
                }
                page.pageCarousel('right');
            });
            Mousetrap.bind('esc', function() {
                if ($('body').hasClass('page-modal')) {
                    History.back();
                }
            });
        }

        function onResizeTimeout() {
            delete Tn.resizeTimer;
            var width = $(window).width();

            if (window.tnVars.isPhone()) {
                $('body').addClass('phone');
            } else {
                $('body').removeClass('phone');
            }

            var timeSliderWidth = width - 200;
            if (timeSliderWidth < 20) {
                timeSliderWidth = 20;
            }
            $('#time-slider').parent().width(timeSliderWidth);
            $('body').trigger('pageresize');
        }

        function onResize() {
            if (Tn.resizeTimer) {
                return;
            }
            Tn.resizeTimer = setTimeout(onResizeTimeout, 250);
        }

        logStartup('Doing initial sizing');
        $(window).resize(onResize);
        onResize();

        logStartup('Registering page events');
        registerUIEvents(window.turnerVideo);

        // In development environments, capture any Gigya login issues that may occur
        try {
            logStartup('Initializing Gigya');
            Tn.Users.initialize({
                onLoginCB: function() {
                    window.turnerVideo.restoreState(Tn.Users.getPref('currentVideo'));
                },

                onStartup: function(userId) {
                    if (!userId) {

                        if (!$.cookie('legalMsg')) {
                            Tn.legalMessage("By using this site, you agree to " + window.siteDefaults.name + "’s <a class='legaltoast' href='/terms.html'>Terms of Use</a> and <a class='legaltoast' href='/privacy.html'>Privacy Policy</a>.", {
                                onHidden: function() {
                                    $.cookie('legalMsg', '1', {
                                        expires: 365,
                                        path: '/'
                                    });
                                }
                            });
                            $('a.legaltoast').on('click', function(event) {
                                event.preventDefault();
                                event.stopPropagation();
                                Tn.setUrl($(this).attr("href"), true, 'page-generic');
                                $('#welcome-dialog').modal('hide');
                            });
                        }

                        if (!$.cookie('welcome')) {

                            $.cookie('welcome', '1', {
                                expires: 365,
                                path: '/'
                            });
                            
                            Tn.loadImages('welcome-dialog');
                            setTimeout(function(){
                                $('#welcome-dialog').modal('show');
                            }, 1000);
                            
							Tn.parseAnalytics({
								"url_section": "/",
								"section": "profile",
								"subsection": "profile:welcome",
								"template_type": "adbp:index",
								"content_type": "other:overlay",
								"search.keyword": "",
								"search.number_results": "",
								"friendly_name": "profile welcome page",
								"series_name": ""
							}, false);
                        }
                       
                        Tn.getFeaturedVideos(function(videos) {
                            try {
                                var ep = videos[0];
                                window.turnerVideo.updateTitle(ep.title, '', '', ep.duration, 'video');
                            } catch(e) {}
                        });


                        
                    }
                }
            });
        } catch (e) {
            logStartup('Gigya Exception');
            console.error("Exception initializing Gigya", e.message);
        }

        logStartup('Removing splash normally');

        // Remove the splash screen
        if (!Tn.splashHidden) {
            Tn.splashHidden = true;
            $('#screen-splash').fadeOut(1000);
        }
    });


}(jQuery, window));

}

/*
     FILE ARCHIVED ON 17:29:26 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:43 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.507
  load_resource: 25.589
  PetaboxLoader3.datanode: 22.821
*/