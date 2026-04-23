var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

(function($, imPlayer, undefined) {
    var embed360Video = window.embed360Video = {},
        page = null,
   	    playerWrapper = null,
        rr = null,
   	    playerDiv = null;
        
        

    var isTrayOpen = false;

    function updateSize() {
        //var page = $('#page-embed-video');
        var dim = [0, 0, 0, 0];

        var lastDim = embed360Video.lastDim;
        if (lastDim && lastDim[0] === dim[0] && lastDim[1] === dim[1] && lastDim[2] === dim[2] && lastDim[3] === dim[3]) {
            return;
        }
        embed360Video.lastDim = dim;

        playerWrapper.css({
            left: dim[0],
            right: dim[1],
            top: dim[2],
            bottom: dim[3]
        });
        embed360Video.watchResize(1500);
    }

    

    $.extend(embed360Video, {
        processedPage: false,
        visible: true,
        playList: [],
        playListInd: 0,
        videoSkinSelector: '.player-wrapper .videoSkinArea',
        playerAreaWidthToSmallForSkin: 900,
        maxSizeOfVideoWithSkin: 720,
        maxSizeOfRightRail: 390,
        maxTopMargin: 40,
        maxLeftMargin: 96,
        rrTimeout: 15000,
        videoSkinPatchSelector: '.player-wrapper .videoSkinAreaIconTransparencyPatch',
        curVidData: {},
        redirectTimer: 0,

        init: function(){
            // we will init the first time to grab the data from the page, then we will go 
            var that = this;
            document.domain = document.domain;
            if(that.processedPage === false){
                page = $('#page-embed360-video');
                page.find('.videoSkinArea').removeClass('test1').removeClass('test2');
                var testval = getParameterByName('test');
                testval = typeof(testval) === 'undefined' ? '' : testval;
                if(testval === '1'){
                    page.find('.videoSkinArea').addClass('test1');
                } else if(testval === '2'){
                    page.find('.videoSkinArea').addClass('test2');
                }
                
                playerWrapper = page.find('.player-wrapper');
                rr = page.find('aside.in-player-tray');
                playerDiv = page.find('.embedPlayerDiv');
                that.getDataFromPage();

                // test stuff

                
                

                // end test stuff
            }
            if(!window.tnVars.isMobile()){
                that.initAside();
                that.initVideoPageObj();
            }
            //embed360Video.resize();
            //that.watchResize(400);
            setTimeout(function(){
               embed360Video.playerOrRedirect();
            }, 500);
            
        },
        initAside: function() {
            var that = this;
            if(!window.tnVars.isMobile()){
                rr.addClass('open');
                rr.find('a[paneid="pane-info"]').addClass('active');
                rr.find('#pane-info').show(100);
                playerWrapper.addClass('railopen');
                isTrayOpen = true;
                that.watchResize(200);
                //window.embed360Video.startAdInTrayReloader();
                // it is requested that we close the right rail after 15 seconds since it covers the video skin
                setTimeout(function(){
                   $('#page-embed360-video aside a[paneid]').click();
                }, embed360Video.rrTimeout);
            }
            
        },
        loadNewVideo: function(obj){
            var that = this;
            var contentId = typeof(obj.dataid) !== 'undefined' ? obj.dataid : '';
            if(contentId !== ''){
                $.each(that.playList, function(index, item){
                    if(item.contentId === contentId){
                        $('#page-embed360-video #iframe360')[0].contentWindow.playNewVid(index);
                        that.populateInfoRR(index);
                    }
                    return;
                });
            }
        },
        initVideoPageObj: function(){
            //var page = $('#page-embed360-video');
            //
            if($.cookie('devCVP') === "1"){
                //context = context + '_dev';
                $('.player-wrapper .videoSkinArea').parent().bind('DOMNodeInserted DOMNodeRemoved', function(event) {
                    if (event.type === 'DOMNodeInserted') {
                        console.log('Content added! Current content:' + '\n\n' + $(this).find('.videoSkinArea').html());
                    } else {
                        console.log('Content removed! Current content:' + '\n\n' + $(this).find('.videoSkinArea').html());
                    }
                });
            }

            $('#page-embed360-video aside').find('.extras .playbut').on('click', function(){
                console.log('load new 360 video');
                var mc = $(this).parent();
                var obj = {};
                obj.dataid = mc.attr('data-id');
                //obj.vidUrl = mc.attr('data-videohref');
                embed360Video.loadNewVideo(obj);
            });

            $('#page-embed360-video aside a[paneid]').on('click', function() {
                //console.log("page-video aside a[paneid] clicked");
                var page = $('#page-embed360-video');
                var $panel = page.find('aside');
                var paneId = $(this).attr('paneid');
                var $thisPane = $panel.find('#' + paneId);
                var $butts = page.find('aside a[paneid]');
                var $panes = $panel.find('.pane');
                //var vidDiv = page.find('.embedPlayerDiv').get(0);
                //var resizeDivFn = function() {
                    //embed360Video.watchResize(1000);
                //};
               // window.tnVars.addResizeListener(vidDiv, resizeDivFn);

                window.embed360Video.stopAdInTrayReloader(); // Stop here since with closing or opening the tray, we at least need to start over.

                // this means you have clicked on the one that is open
                // so it should close and button loses highlight
                if ($(this).hasClass('active')) {
                    //close panel
                    $panel.removeClass('open');
                    //page.find('.player-wrapper').removeClass('railopen');
                    //deactivate link
                    $(this).removeClass('active');
                    // setting timeout so the pane does not hide while it is still visible
                    // transition in css is set to .5
                    window.setTimeout(function() {
                        // hide pane
                        $panes.hide();
                    }, 600);
                    //embed360Video.watchResize(500);
                    /*
                    if(cvpInAds){
                        // Turn off all cvp sync ads in the tray but only in preroll/midroll.  
                        // Need the first ad to run so later ones can come into view later.  Need the instationation when first ad starts.
                        // Rules are such that, the tray will open if closed on preroll start so only turn off ads if ads are running and user closed tray
                        window.adHelper.manageSyncAds([], $('#page-embed360-video aside .syncAdWrapper'));
                    }
                    */
                    return;
                } else {
                    $panel.addClass('open');
                    //page.find('.player-wrapper').addClass('railopen');
                    embed360Video.currentTrayPaneId = paneId;
                    window.turnerVideoPageObj.startAdInTrayReloader();
                    //if(!vidObject.paused && !cvpInAds){
                    /*
                    if(!cvpInAds){
                        window.turnerVideoPageObj.startAdInTrayReloader();
                    }
                    */
                    // Turn on sync ads
                    //window.adHelper.manageSyncAds($('#page-video aside .syncAdWrapper'), []);
                    //window.turnerVideoPageObj.startScroller();
                    //var rrSlider = window.turnerVideoPageObj.rrSlider;
                    //rrSlider.setup();
                }
                $butts.removeClass('active');
                $butts.each(function() {
                    var $item = $(this);
                    if ($item.attr('paneid') === paneId) {
                        $item.addClass('active');
                        return false;
                    }
                });
                $panes.hide();
                $thisPane.show();
                //if(!cvpInAds){
                    //window.turnerVideoPageObj.hideSyncAdInTray(); // We can hide because we can assume we have DE ads
                embed360Video.showReloadingAds();
                //embed360Video.resetBackGroundSkin();
                //window.adHelper.loadAds2($thisPane, 'onShow');
                //}
                //Turn on 
                //embed360Video.watchResize(500);

                //window.turnerVideoPageObj.locateFreewheelSyncAd();
            });
        },
        getDataFromPage: function(){
            var that = this;
            that.curVidData.contentId = page.attr('data-contentid');
            that.curVidData.showName = page.attr('data-showname');
            that.curVidData.returnUrl = '/shows/' + that.curVidData.showName + '.html';
            console.log(that.curVidData);
            var spans = page.find('.videodata span');
            
            $.each(spans, function(i, vid){
                var vObj = {};
                var $vid = $(vid);
                var fileUrl = $vid.attr('videoSource');
                var mobileFileUrl = fileUrl.replace('_2200x1100_','_1920x1080_');
                vObj.fileUrl = fileUrl;
                vObj.mobileFileUrl = mobileFileUrl;
                vObj.showName = that.curVidData.showName;
                vObj.desc = $vid.attr('description');
                vObj.title = $vid.attr('title');
                vObj.imgStillUrl = $vid.attr('imageStillUrl');
                vObj.contentId = $vid.attr('contentId');
                if(vObj.contentId === that.curVidData.contentId){
                    that.playList.unshift(vObj);
                } else {
                    that.playList.push(vObj);
                }
            });
            console.log('playList');
            console.log(that.playList);
            that.processedPage = true;
        },
        removePlayer: function(){
            var that = this;
            $('#page-embed360-video').remove();
            that.processedPage = false;
            that.playList = [];
            that.playListInd = 0;
        },
        playerOrRedirect: function(){
            var that = this;
            var cont;
            if (navigator.userAgent.match(/ip(hone|ad)|(A|a)ndroid|mobile/i)){
                that.initMobileIntercept();
                // build the mobile iframe that contains the app redirect code
                cont = '<iframe width="100%" id="iframe360" height="100%" src="/360/player.sdk/mobile360iframe.html" frameborder="0" allowfullscreen></iframe>';
                $('#page-embed360-video').find('.embedPlayerDiv').append(cont);
                $('#mobile-360video-dialog').modal('show');

            } else {
                // build the iframe
                cont = '<iframe width="100%" id="iframe360" height="100%" src="/360/player.sdk/360iframe.html" frameborder="0" allowfullscreen></iframe>';
                $('#page-embed360-video').find('.embedPlayerDiv').append(cont);
                that.initVideoEvents();
            }
        },
        
        initMobileIntercept: function(){
            var dialog = $('#mobile-360video-dialog');
            var that = this;
            var clickevent = window.tnVars.hasTouchStart ? 'touchstart' : 'click';
            dialog.find('button.close').on(clickevent, function(){
                event.preventDefault();
                dialog.modal('hide');
                Tn.setUrl(that.curVidData.returnUrl, false, 'page-generic');
            });
            dialog.find('.download').on(clickevent, function(){
                event.preventDefault();
                $('#page-embed360-video #iframe360')[0].contentWindow.directUser();
                //that.directUser();

            });

        },
        /*
        directUser: function (){
            var that = this;
            var isIos = window.tnVars.isIOS();
            var isAndroid = window.tnVars.isAndroid;
            var currentVid = that.playList[0];

            if (isAndroid || isIos ){
                console.log('is android or ios');
                var returnUrl = 'http://' + window.location.host + '/shows/' + currentVid.showName + '.html';
               // var videoUrl = embed360Video.playList[0].fileUrl;
               var videoUrl = currentVid.mobileFileUrl;

                var d = new Date();
                that.redirectTimer = d.getTime();
                setTimeout(that.redirectTimeout, 1000);
                
                if(isIos){
                    var iosAppUrl = "im360://?open=" + videoUrl + "&returnUrl=" + returnUrl;
                    //var iosAppUrl = 'im360://?open=http://i.cdn.turner.com/v5cache/TNT/Flash/im360/librarians/randall_1930x1080_fps15_3M.mp4&returnUrl=' + returnUrl;
                    window.location.href = iosAppUrl;
                } else {
                    var androidQueryString = "open=" + videoUrl + "&returnUrl=" + returnUrl;
                    var androidAppUrl = "intent://?" + androidQueryString + "#Intent;scheme=im360;package=com.immersivemedia.android;end";
                    top.location = androidAppUrl;
                }
            } else {
                // Fallback message if we don't handle this mobile platform
                parent.Tn.alert("Your platform is currently not supported.");
            }

        },
        redirectTimeout: function () {
            //if we get here the app was not installed;
            var d = new Date();
            var currentTime = d.getTime();
            console.log("its been:" + (currentTime-embed360Video.redirectTimer));
            if (currentTime - embed360Video.redirectTimer < 4000){
            
                if(window.tnVars.isIOS() ){
                    window.location = "https://web.archive.org/web/20141231173000/https://itunes.apple.com/us/app/im360/id437314677?mt=8";
                } else if(window.tnVars.isAndroid){
                    window.location.href = "https://web.archive.org/web/20141231173000/https://play.google.com/store/apps/details?id=com.immersivemedia.android";
                } else {
                    window.Tn.alert("Your platform is currently not supported.");
                }

            }
        },
        */
        getNextVideo: function(){
            var that = this;
            that.playListInd++;
            
            var nVid = that.playList[that.playListInd];
            if(typeof(nVid) === 'undefined'){
                Tn.setUrl(that.curVidData.returnUrl, false, 'page-generic');
            } else {
                that.populateInfoRR();
            }
            return nVid;

        },
        populateInfoRR: function(i){
            var that = this;
            var nextVidInd = typeof(i) !== 'undefined' ? i : that.playListInd;
            var nextVid = that.playList[nextVidInd];
            if(typeof(nextVid) !== 'undefined'){
                var info = rr.find('#pane-info');
                info.find('h2.title').text(nextVid.title);
                //console.log("desc node");
                //console.log(info.find('p.desc > span[itemprop="description"]'));
                //console.log('next video desc: ' + nextVid.desc);
                info.find('span[itemprop="description"]').text(nextVid.desc);
            }
        },
        
        initVideoEvents: function() {
            $('body').on('pageresize', function() {
                embed360Video.watchResize(500);
            });
            
        },

    	watchResize: function(timeToWatch) {
            var that = this;
	        that.endTime = new Date().getTime() + timeToWatch;
	        that.onResizeTimer();
	    },
	    onResizeTimer: function() {
            var that = this;
	        if (that.videoTimer) {
	            clearTimeout(that.videoTimer);
	            delete that.videoTimer;
	        }

	        that.resize();
	        if (new Date().getTime() > that.endTime) {
	            return;
	        }
	        that.videoTimer = setTimeout($.proxy(that.onResizeTimer, that), 10);
	    },
	    resize: function() {
            // Always updated the splash size even if CVP is not ready
            //embed360Video.updateSplashSize();

            //updateSize();
            /*
            playerAreaWidthToSmallForSkin: 900,
            maxSizeOfVideoWithSkin: 740,
            maxTopMargin: 40,
            maxLeftMargin: 96,
             */
            //var w = playerDiv.width();
            //var h = playerDiv.height();
            //
            var w = playerWrapper.width();
            var h = parseInt(w * 360 / 640, 10);
            var videoWidth = w;
            var videoHeight = h;
            var ww = w;
            var hh = h;
            var scale = 1;

            // these are used for the margins
            var top = 0;
            var left = 0;
            // if the playerwrapper is greater than max video width + max left margin
            if(w > (embed360Video.maxSizeOfVideoWithSkin + embed360Video.maxLeftMargin)){
                w = embed360Video.maxSizeOfVideoWithSkin + embed360Video.maxLeftMargin;
                videoWidth = embed360Video.maxSizeOfVideoWithSkin;
                //videoHeight = videoWidth * 0.562;
                top = embed360Video.maxTopMargin;
                left = embed360Video.maxLeftMargin;
                $('#embed360-video-page').find('.shadow-top.shadowbox').removeClass('tn-hidden');
            } else if( w > embed360Video.maxSizeOfVideoWithSkin){
                w = embed360Video.maxSizeOfVideoWithSkin;
                $('#embed360-video-page').find('.shadow-top.shadowbox').addClass('tn-hidden');
            } else {
                videoWidth = w;
                $('#embed360-video-page').find('.shadow-top.shadowbox').addClass('tn-hidden');
            }
            videoHeight = videoWidth * 0.562;
            
           
            var videoSkinDiv = $(embed360Video.videoSkinSelector);
            //var videoSkinPatchDiv = $(embed360Video.videoSkinPatchSelector);
            /*if (videoWidth === 0 || videoHeight === 0) { //assume 16:9
                videoWidth = 640;
                videoHeight = 360;
            }
            */
           
            var topString = top.toString() + "px";
            var leftString = left.toString() + "px";
            ww = videoWidth * scale;
            hh = videoHeight * scale;

            videoSkinDiv.show();
            
            playerDiv.css("margin-top", topString);
            playerDiv.css("margin-left", leftString);
            playerDiv.width(ww).height(hh);
            //pausedAreaDiv.height(hh);
        },
        resizeOld: function() {
            // Always updated the splash size even if CVP is not ready
            //embed360Video.updateSplashSize();

            updateSize();

            //var w = playerDiv.width();
            //var h = playerDiv.height();
            //
            var w = playerWrapper.width();
            var h = parseInt(w * 360 / 640, 10);
            var ww = w;
            var hh = h;
            var top = 0;
            var left = 0;
            var videoWidth = w;
            var videoHeight = h;
            var videoSkinDiv = $(embed360Video.videoSkinSelector);
            var videoSkinPatchDiv = $(embed360Video.videoSkinPatchSelector);
            if (videoWidth === 0 || videoHeight === 0) { //assume 16:9
                videoWidth = 640;
                videoHeight = 360;
            }

            //var scale = Math.min(ww / videoWidth, hh / videoHeight);
            var scale = Math.min(ww / videoWidth, hh / videoHeight);
            ww = videoWidth * scale;
            hh = videoHeight * scale;
            top = (h - hh) / 2;
            left = (w - ww) / 2;
            ww = Math.floor(ww);
            hh = Math.floor(hh);
            top = Math.floor(top);
            left = Math.floor(left);
            var topString = top.toString() + "px";
            var leftString = left.toString() + "px";
            //console.log("ww: " + ww + " hh: " + hh);
            if (ww < 160) {
                ww = 160;
            }
            if (hh < 160) {
                hh = 160;
            }

            var videoW = ww, videoH = hh;
            if(ww > embed360Video.playerAreaWidthToSmallForSkin){

                videoW = 0.75 * ww;
                videoH = 0.75 * hh;
                if(videoW > embed360Video.maxSizeOfVideoWithSkin){
                    videoH = Math.round(( embed360Video.maxSizeOfVideoWithSkin * videoH ) / videoW);
                    videoW = embed360Video.maxSizeOfVideoWithSkin;
                }
                //pausedAreaDiv.width(cvpWidth);
                //pausedAreaDiv.height(cvpHeight);
                playerDiv.addClass('hasSkin');
                // Had to put the div containing the video skin outside the div with the cvp because the cvp was getting corrupted
                // and the next video would not play
                videoSkinDiv.show();
                videoSkinDiv.width(ww).height(hh);
                videoSkinDiv.css("margin-top", topString);
                videoSkinDiv.css("margin-left", leftString);
                
                videoSkinPatchDiv.show();
                videoSkinPatchDiv.css("margin-top", topString);
                videoSkinPatchDiv.css("margin-left", leftString);
                videoSkinPatchDiv.css("max-height", videoH.toString() + "px");
            } else {
               // pausedAreaDiv.width('auto');
                //pausedAreaDiv.height('auto');
                //playerDiv.removeClass('hasSkin');
                videoSkinDiv.hide();
                videoSkinPatchDiv.hide();
            }

            //turnerVideo.player.resize(cvpWidth, cvpHeight, 0);
            playerDiv.width(videoW).height(videoH);
            var pwh = playerWrapper.height();
            var marginTop = (pwh-hh)/2;
            
            playerDiv.css({
                "margin-top": marginTop,
                "margin-left": leftString
            });
            //playerDiv.css("margin-top", topString);
            //playerDiv.css("margin-left", leftString);
            playerDiv.width(ww).height(hh);
            //pausedAreaDiv.height(hh);
        },
        stopAdInTrayReloader: function() {
            if( window.embed360Video.adInTrayTimerId){
                clearInterval( window.embed360Video.adInTrayTimerId);
                delete window.embed360Video.adInTrayTimerId;
            }
        },
        startAdInTrayReloader: function() {
            //Load ad right away when there is no preroll ad in tray's selected pane
            //if(that.isTrayOpen() && that.firstSyncAdShown !== true){
            if(window.embed360Video.isTrayOpen()){
                window.embed360Video.adInTrayReloader();
            }
            if(window.embed360Video.isTrayOpen() && typeof(window.embed360Video.adInTrayTimerId) === "undefined"){
                window.embed360Video.adInTrayTimerId = setInterval(function(){
                    if(embed360Video.visible){
                       window.embed360Video.adInTrayReloader();
                    }
                }, 120000); // Every two minutes
            }

        },
        adInTrayReloader: function(){
            var $panel = $('#page-embed360-video aside'),
                $thisPane = $panel.find('#' + this.currentTrayPaneId);
            this.showReloadingAds();
            window.adHelper.loadAds2($thisPane.find("." + window.adHelper.reloadingAdClass), 'onPoll', '&pageload=sync_ref');
        },
        isTrayOpen: function(){
            return $('#page-embed360-video .player-wrapper').hasClass('railopen');
            //return playerWrapper.hasClass('railopen');
        },
        showReloadingAds: function(){
            $('#page-embed360-video aside .' + window.adHelper.reloadingAdClass).show();
        },
        hideReloadingAds: function(){
            $('#page-embed360-video aside .' + window.adHelper.reloadingAdClass).hide();
        },
        hasBackgroundImage: function(videoSkinSelector){
            var bg_url = $(videoSkinSelector).css('background-image'),
                itHasBackgroundImage;
            // ^ Either "none" or url("...urlhere..")
            bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url);
            itHasBackgroundImage = bg_url && bg_url[2].length > 5 ? true : false; // If matched and url has length, true, otherwise false
            return itHasBackgroundImage;
        },
        resetBackGroundSkin: function(){
            $(embed360Video.videoSkinSelector).css("background-image", "none");
            $('#leftclick, #rightclick').html('');
        }
    
	});

    
}(jQuery, window.imPlayer));

$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-embed360-video') {
        return;
    }
    window.embed360Video.init();
    setTimeout(window.embed360Video.startAdInTrayReloader, 10000);


});








}

/*
     FILE ARCHIVED ON 17:30:00 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.412
  load_resource: 59.174
  PetaboxLoader3.datanode: 14.43
*/