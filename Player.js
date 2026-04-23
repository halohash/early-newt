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
 * @class turnerVideo
 *
 * Takes care of displaying the video id found in the string url
 *
 * For example : page.html?titleId=123456
 *
 */
(function($, undefined) {
    var turnerVideo = window.turnerVideo = {},
        sendVideoEvent = window.sendVideoEvent,
        TVE_VideoEvent = window.TVE_VideoEvent,
        tnVars = window.tnVars,
        isMobile = tnVars.isMobile(),
        //jsmd = window._jsmd_default,
        site = "",
        profile = "",
        context = "",
        fullEpId,
        clipId,
        playerLoaded = false,
        cvpReady = false,
        cvpPlayStarted = false,
        cvpInAds = false,
        vidObject = null,
        playButton = null,
        pauseButton = null,
        timeSlider = null,
        timeSliderBut = null,
        timeSliderHandle = null,
        playtimeDone = null,
        playtimeTogo = null,
        playtimeLeftMin = 0,
        playtimeLeftSec = 0,
        pausedEpisodeTitle = null,
        pausedSeriesTitle = null,
        cvpDiv = null,
        // playerWrapper is the left side video container
        playerWrapper = null,
        // playerDiv contains the video object, pause div, control divs
        // this should be the same size as player so the control icons and pause screen lay over top of video
        playerDiv = null,
        pausedAreaDiv = null,
        isPaused = false,
        doHideSplash = true,
        tveModeGlobal = '',
        ssidEast = window.siteDefaults.liveTV.ssidEast,
        ssidWest = window.siteDefaults.liveTV.ssidWest,
        videoFeedEast = window.siteDefaults.liveTV.videoFeedEast,
        videoFeedWest = window.siteDefaults.liveTV.videoFeedWest,
        ssid = ssidEast,
        lastVideoId,
        videoState = {},
        showProgress = false,
        removeAdDiv = false,
        usingAuthentication = true,
        doVideoCompleteEvent = true,
        splashData, splashImage,
        splashPlaying = false,
        pausedInSplash = false,
        splashDataLoading = true,
        standardBitrateId,
        hqBitrateId,
        lastSavedInitOptions,
        doInitializeVideoEvents = true,
        setVideoCountdownCalledCount = 0;

    // Always available in UI
    playButton = $('#play-but');
    pauseButton = $('#pause-but');
    timeSlider = $('#time-slider');
    timeSliderBut = $("#time-slider-but");
    timeSliderHandle = $("#time-slider .time-slider-handle");
    playtimeDone = $(".playtime #done");
    playtimeTogo = $(".playtime #togo");

    function hideSplash() {
        doHideSplash = false;
        $('#loading-splash').hide();
        $('body').addClass('vid-loaded');
        turnerVideo.setVolume(Tn.volumeLevel);
    }

    function updateSplash() {
        var delta = new Date().getTime() - Tn.videoSplashStart;
        if (!splashData || delta > 5000) {
            splashPlaying = false;
            turnerVideo.watchResize(1000);
            $('#page-video').removeClass('splash-loading');
            if (pausedInSplash) {
                pausedAreaDiv.hide();
                turnerVideo.player.resume();
                turnerVideo.setVolume(Tn.volumeLevel);
            }

            // If we're on mobile, automatically hide splash so user has the opportunity to click the play button
            if (isMobile) {
                hideSplash();
            }
            return;
        }

        var imageLoading = splashImage ? !splashImage.prop('complete') : false;
        if (!imageLoading && splashData.length > 0) {
            if (!splashImage) {
                splashImage = $('#loading-splash-image');
            }

            var frame = parseInt(delta * splashData.length / 5000.0, 10);
            if (frame < 0) {
                frame = 0;
            }
            if (frame >= splashData.length - 1) {
                frame = splashData.length - 1;
            }
            if (splashDataLoading) {
                $("#loading-splash").removeClass('loading');
            }
            splashImage.attr('src', 'data:image/jpeg;base64,' + splashData[frame]);
        }

        setTimeout(updateSplash, 50);
    }

    // Attempts to load the splash data, which should only need to get loaded once

    function loadSplashData(dontPlay) {
        showMode('full');
        // If the splash is already playing, don't bother updating
        if (splashPlaying) {
            return;
        }

        Tn.videoSplashStart = new Date().getTime();
        if (!splashData) {
            splashData = [];
            $.getJSON(window.siteDefaults.splash[isMobile ? 'mobile' : 'web']).success(function(data) {
                splashData = data;
                //console.error("found splash", data);
            }).fail(function() {
                splashData = undefined;
                splashDataLoading = false;
                //console.error("Failed to load splash data");
            });
        }
        if (dontPlay !== true) {
            pausedInSplash = false;
            splashPlaying = true;
            $('#page-video').addClass('splash-loading');
            updateSplash();
        }
    }

    function addLiveStat(videoId) {
        var airingId = $('#page-video').attr("airingid");
        if (!airingId) {
            return;
        }

        var liveHistory = Tn.Users.getPref('liveHistory', []);
        var liveDate = new Date().getTime();
        liveHistory.push({
            dt: liveDate,
            ai: airingId,
            fd: parseInt(videoId, 10) === parseInt(videoFeedEast, 10) ? 'e' : 'w',
            os: tnVars.getPlatform()
        });

        while (liveHistory > 50) {
            liveHistory.shift();
        }
        Tn.Users.setPref("liveHistory", liveHistory);
    }

    function addStat(videoId) {
        var history = Tn.Users.getPref('videoHistory', {});
        var vid = history[videoId];
        if (!vid) {
            vid = {
                cnt: 0
            };
        }
        vid.cnt = vid.cnt + 1;
        vid.dt = new Date().getTime();
        history[videoId] = vid;

        // Trim list to contain a limited set of history
        var results = [];
        $.each(history, function(key, val) {
            results.push({
                key: key,
                dt: val.dt
            });
        });
        results.sort(function(b, a) {
            if (a.dt > b.dt) {
                return 1;
            }
            if (a.dt < b.dt) {
                return -1;
            }
            return 0;
        });
        for (var i = Tn.maxVideoHistory; i < results.length; i++) {
            delete history[results[i].key];
        }

        // Save the updated history
        Tn.Users.setPref('videoHistory', history);
    }

    function updateState(o, force) {
        if (force) {
            videoState = o;
        } else {
            $.extend(videoState, o);
        }

        var history = Tn.Users.getPref('videoHistory', {});
        if (lastVideoId && history[lastVideoId]) {
            var vid = history[lastVideoId];
            if (videoState.playing && o.playhead !== undefined && o.duration !== undefined) {
                vid.pg = (videoState.playhead || 0) * 100 / (videoState.duration || 1);
            }
            if (o.pg !== undefined) {
                vid.pg = o.pg;
            }
            history[lastVideoId] = vid;
            Tn.Users.setPref('videoHistory', history);
        }

        Tn.Users.setPref('currentVideo', videoState);
    }

    function openRail(reset) {
        if (turnerVideo.currentMode !== "full") {
            return;
        }
        var infoPane = $('#page-video aside a[paneid="pane-info"]'),
            sharePane = $('#page-video aside a[paneid="pane-share"]');
        if ((!infoPane.hasClass('active') && !sharePane.hasClass('active')) || (!infoPane.hasClass('active') && reset)) {
            infoPane.trigger('click');
        }
        turnerVideo.watchResize(1000);
    }

    function closeRail() {
        $('.in-player-tray').removeClass('open');
        $('#page-video aside a[paneid]').removeClass('active');
        $('#page-video .player-wrapper').removeClass('railopen');
        turnerVideo.watchResize(1000);
    }

    function updateSize() {
        var page = $('#page-video');
        var dim;
        switch (turnerVideo.currentMode) {
            case 'upnext':
                dim = [20, page.width() - 356 - 20, 20, page.height() - 200 - 20];
                break;
            default:
                dim = [0, 0, 0, 0];
        }

        var lastDim = turnerVideo.lastDim;
        if (lastDim && lastDim[0] === dim[0] && lastDim[1] === dim[1] && lastDim[2] === dim[2] && lastDim[3] === dim[3]) {
            return;
        }
        turnerVideo.lastDim = dim;

        $('#page-video .player-wrapper').css({
            left: dim[0],
            right: dim[1],
            top: dim[2],
            bottom: dim[3]
        });
        turnerVideo.watchResize(1500);
    }

    function doVideoCountdown() {
        if (turnerVideo.countdownTimer) {
            clearTimeout(turnerVideo.countdownTimer);
        }

        // If the video has finished playing, then play the next video
        if (!videoState.playing) {
            if (turnerVideo.upNextUrl) {
                Tn.showPlayer(turnerVideo.upNextUrl);
                Tn.autoPlaying = true;
                delete turnerVideo.upNextUrl;

            }
            return;
        }

        var timeRemaining = turnerVideo.player.getDuration() - turnerVideo.player.getPlayhead();
        timeRemaining = parseInt(timeRemaining, 10) + 1;

        // If the user seeked backwards, then get rid of upnext
        if (timeRemaining > (Tn.upNextTimeInSeconds + 3)) {
            showMode('full');
            return;
        }

        // Clamp the upnext value
        if (timeRemaining > Tn.upNextTimeInSeconds) {
            timeRemaining = Tn.upNextTimeInSeconds;
        }

        $('#page-video .countdown').text(timeRemaining);

        turnerVideo.countdownTimer = setTimeout(doVideoCountdown, 500);
    }

    function setVideoCountdown() {
        setVideoCountdownCalledCount++;
        var setUpStatusObj,
            thisVideo,
            matchingPlaylistVideo,
            wasVideoFoundOnShowsPage = false,
            wasVideoFoundOnShowsByName = false,
            rows,
            thePlaylist4VideoPlaying = [],
            nextPlaylistVideos = [],
            movieCarousels = [],
            nextCarouselVideos = [],
            firstVideosFirstCarousel = [],
            sameTypeVideos = [],
            videosFromRelatedSeries = [],
            finalNextVideos,
            carousels,
            upnextEp;
        if(setVideoCountdownCalledCount > 4){
            console.log("There's a problem with setVideoCountdown so stopping up next ");
            setVideoCountdownCalledCount = 0;
            return;
        }
        if (!Tn.movieData && Tn.videoType =='movie') {
            Tn.getMovieCarouselData(setVideoCountdown, true);
            return;
        } else if(!Tn.showData){
            Tn.getCarouselData(setVideoCountdown, true);
            return;
        } else if(!Tn.showDataWithPlaylists){ // requires Tn.showData so playlists can be added
            Tn.getPlaylistExpandedCarouselData(setVideoCountdown);
            return;
        } else if(Tn.videoPlayingIsSponsored && Tn.series4VideoPlaying && !Tn.playlistsOnShowPage[Tn.series4VideoPlaying]){ 
        //} else if(true && Tn.series4VideoPlaying && !Tn.playlistsOnShowPage[Tn.series4VideoPlaying]){ 
            // Requires Tn.showDataWithPlaylists so we know what playlists are on the show page
            // This video might not be on the shows page so we just get the playlist
            if(!Tn.showsByNameData[Tn.series4VideoPlaying] ){
                Tn.getShowsByNameCarouselData(setVideoCountdown, Tn.series4VideoPlaying, true );
                return;
            } else if(Tn.showsByNameData[Tn.series4VideoPlaying].carousels){
                thePlaylist4VideoPlaying = Tn.showsByNameData[Tn.series4VideoPlaying].carousels;
                setUpStatusObj = setUpNextVideosHelper(thePlaylist4VideoPlaying, nextPlaylistVideos, false, false, false, wasVideoFoundOnShowsPage);
                matchingPlaylistVideo = setUpStatusObj.thisVideo;
                wasVideoFoundOnShowsByName = setUpStatusObj.wasVideoFoundOnShowsPage; 
            }
        }
        setVideoCountdownCalledCount = 0;
        doVideoCountdown();

        // Find the current video in the stack and play the next video after that

        carousels = (Tn.showDataWithPlaylists.carousels)?Tn.showDataWithPlaylists.carousels:[];
        rows = (Tn.showData.rowHdr)?Tn.showData.rowHdr:[];
        for (var showIndex = 0; showIndex < rows.length; showIndex++) {
            if(firstVideosFirstCarousel.length > 3){
                // maintaining value of wasVideoFoundOnShowsPage so we can continue to build the list of nextCarouselVideos
                setUpStatusObj = setUpNextVideosHelper(carousels[showIndex], nextCarouselVideos, false, sameTypeVideos, videosFromRelatedSeries, wasVideoFoundOnShowsPage);
            } else {
                setUpStatusObj = setUpNextVideosHelper(carousels[showIndex], nextCarouselVideos, firstVideosFirstCarousel, sameTypeVideos, videosFromRelatedSeries, wasVideoFoundOnShowsPage);
            }
            if(!wasVideoFoundOnShowsPage){
                thisVideo = setUpStatusObj.thisVideo;
                wasVideoFoundOnShowsPage = setUpStatusObj.wasVideoFoundOnShowsPage;
            }   
        }
        var item;
        
        // In the case where we get the last video of the last carousel, upnext will
        // wasVideoFoundOnShowsPage can be true for the last video on the shows page and nextCarouselVideos empty
        // If nextCarouselVideos is empty then we know this video is not in the carousels we are looking at.  Find like videos and start there next.
        if(nextCarouselVideos.length === 0 && wasVideoFoundOnShowsPage === false && Tn.videoType =='movie'){
            flatten(Tn.movieData.carousels, movieCarousels);
            setUpStatusObj = setUpNextVideosHelper(movieCarousels, nextCarouselVideos, false,  sameTypeVideos, false, wasVideoFoundOnShowsPage);
            thisVideo = setUpStatusObj.thisVideo;
            wasVideoFoundOnShowsPage = setUpStatusObj.wasVideoFoundOnShowsPage;
        }
        // playlist video not in the shows landing page ( playlists expanded ) but found/not found in the byName feed
        if(Tn.videoPlayingIsSponsored && Tn.series4VideoPlaying && nextCarouselVideos.length === 0 && !Tn.playlistsOnShowPage[Tn.series4VideoPlaying]){ 
            if(wasVideoFoundOnShowsByName === true){
                finalNextVideos = nextPlaylistVideos.concat(videosFromRelatedSeries, firstVideosFirstCarousel);
            } else {
                finalNextVideos = thePlaylist4VideoPlaying.concat(videosFromRelatedSeries, firstVideosFirstCarousel);
            }
        } else if(nextCarouselVideos.length === 0 && wasVideoFoundOnShowsPage === false){ // video not on the shows landing page
            // videosFromRelatedSeries will populate if this video is sponsored
            finalNextVideos = sameTypeVideos.concat(videosFromRelatedSeries, firstVideosFirstCarousel);
        } else {
            finalNextVideos = nextCarouselVideos.concat(firstVideosFirstCarousel);
        }
        thisVideo = (matchingPlaylistVideo)?matchingPlaylistVideo:(thisVideo)?thisVideo:false;
        if(finalNextVideos.length > 0){
            finalNextVideos.splice(10);
            var seenObj = {};
            if(thisVideo && typeof(thisVideo) == 'object' && thisVideo.videoLink && typeof(thisVideo.videoLink) == 'string' && thisVideo.videoLink > 0 ){
                seenObj[thisVideo.videoLink] = true;
            }
            Tn.deDupList(finalNextVideos, seenObj);
            upnextEp = finalNextVideos[0];
            item = $('<div></div>');
            $('#page-video .countdown-video').empty().append(item);
            initializeUpNextOverlay(item, upnextEp);
            $('#page-video').find('.upnext-bg').css({
                'background-image': 'url("' + upnextEp.imgSrc + '")'
            });
            turnerVideo.upNextUrl = upnextEp.videoLink;
            if(finalNextVideos.length > 1){
                item = $('<div></div>');
                $('#page-video .recommend-video').empty().append(item);
                initializeUpNextOverlay(item, finalNextVideos[1]);
                if(finalNextVideos.length > 2){
                    item = $('<div></div>');
                    $('#page-video .recommend-video2').empty().append(item);
                    initializeUpNextOverlay(item, finalNextVideos[2]);
                }
            }
        }
        
        // if (!$('body').hasClass('adPlaying')) {
        //     turnerVideo.showMode('upnext');
        // }

        if (thisVideo && thisVideo.imgSrc) {
            $('#page-video .pausedArea').css('backgroundImage', 'url(/images/play.png), url("' + thisVideo.imgSrc + '")');
        }
        //console.error("Found last video", thisVideo);
    }
    function initializeUpNextOverlay(item, data){
        if (data.videoType == 'movie') {
            Tn.initializeMovieOverlay(item, data, true);
        } else {
            Tn.initializeShowOverlay(item, data);
        }   
    }
    /** Reuse for show, sponsored, and movie carousels.  Pass in pointer to the arrays you want populated. */
    function setUpNextVideosHelper(carousel, nextCarouselVideos, firstVideosFirstCarousel, sameTypeVideos, videosFromRelatedSeries, wasVideoFoundOnShowsPageTmp){
        var videoCounter = 0,
            // maintaining value of wasVideoFoundOnShowsPage so we can continue to build the list of nextCarouselVideos
            wasVideoFoundOnShowsPage = (wasVideoFoundOnShowsPageTmp)?wasVideoFoundOnShowsPageTmp:false,
            playListVideos = [], setUpStatusObj,
            thisVideo,
            thisLinkSubstr = (Tn.videoType =='movie')?'videos/movies':window.turner_metadata.series_name;
        $.each(carousel, function(tileIndex, ep) {
            ep.epinfo = ep.epinfoPLUS;/*ep.epinfo + " " + ep.tvRating*/
            if (!ep.playable) {
                return;
            }
            videoCounter++;
            
            if(firstVideosFirstCarousel && videoCounter < 4){
                firstVideosFirstCarousel.push($.extend({}, ep));
            }
            if(sameTypeVideos && ep.videoLink && ep.videoLink.length > 0 && ep.videoLink.indexOf(thisLinkSubstr) !== -1 ){
                sameTypeVideos.push($.extend({}, ep));
            }
            // THe sponsored list's series name and the associated series name on the shows page both use the sponsored list's series name.
            var adaptForBadSeriesNameInPath = false; // See http://docs.turner.com/display/TEN/Watch+1.9+Documentation#Watch1.9Documentation-MakingaplaylistandadditsteaserintheCMA
            if(videosFromRelatedSeries && ep.videoLink && ep.videoLink.length > 0 && (
                (Tn.sponsoredNextSeries4VideoPlaying && ep.videoLink.indexOf(Tn.sponsoredNextSeries4VideoPlaying) !== -1 ) ||
                (adaptForBadSeriesNameInPath && Tn.series4VideoPlaying && ep.videoLink.indexOf(Tn.series4VideoPlaying) !== -1 ))){
                    videosFromRelatedSeries.push($.extend({}, ep));
            }
            // episodes match on contentID while clips match on contenid
            // /service/cvpXml?titleId=2012978 vs /service/cvpXml?titleId=&id=924567
            // playlists match on url since a video of the same content id can match but not be in the playlist.  The path for the playlist makes a playlist
            if (!wasVideoFoundOnShowsPage && ( 
                    (!(Tn.videoPlayingIsSponsored) && ( parseInt(ep.contentid, 10) === lastVideoId || parseInt(ep.titleid, 10) === lastVideoId )) ||
                    ( Tn.videoPlayingIsSponsored && Tn.series4VideoPlaying ==  ep.playlistSeriesName && ep.videoLink.indexOf(lastVideoId) > -1)
                )) {
                wasVideoFoundOnShowsPage = true;
                thisVideo = $.extend({}, ep);
                //console.error("Found video", ep);
            } else if(wasVideoFoundOnShowsPage && nextCarouselVideos){
                nextCarouselVideos.push($.extend({}, ep));
            }
        });
        return { "thisVideo": thisVideo, "wasVideoFoundOnShowsPage": wasVideoFoundOnShowsPage} ;
    }
    function flatten(toBeFlattenedArr, resultArr){
        if(typeof toBeFlattenedArr.length != "undefined")
        {
            for (var i=0;i<toBeFlattenedArr.length;i++)
            {
                flatten(toBeFlattenedArr[i],resultArr);
            }
        }
        else
        {
            resultArr.push(toBeFlattenedArr);
        }
    }

    function showMode(mode, force) {
        if (mode !== 'full' && turnerVideo.currentMode === mode) {
            if (!force) {
                return;
            }
        }

        var page = $('#page-video');
        turnerVideo.currentMode = mode;
        page.attr('mode', mode);
        switch (mode) {
            case 'upnext':
                window.turnerVideoPageObj.resetBackGroundSkin();
                // Animate down to the size shown
                $('#page-video .player-wrapper').css({
                    left: 20,
                    top: 20,
                    right: page.width() - 356 - 20,
                    bottom: page.height() - 200 - 20
                });
                closeRail();

                // After animation complete, set the fixed width and height
                setTimeout(function() {
                    $('#page-video .player-wrapper').css({
                        width: 356,
                        height: 200
                    });
                }, 500);
                // Call setVideoCountdown so it is none blocking and let's go of the thread which is onContentPlayhead 
                setTimeout(function() {
                    try{
                        setVideoCountdown(Tn.upNextTimeInSeconds);
                    } catch(e){
                        console.log('setVideoCountdown error', e);
                    }
                }, 0);

                break;

            default:
                $('#page-video .pausedArea').css('backgroundImage', '');
                if (turnerVideo.countdownTimer) {
                    clearTimeout(turnerVideo.countdownTimer);
                    delete turnerVideo.countdownTimer;
                }
                $('#page-video .player-wrapper').css({
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 'auto',
                    height: 'auto'
                });
                break;
        }

        page.attr('mode', mode);

        turnerVideo.watchResize(1500);
    }

    turnerVideo.showMode = showMode;

    function calculateXMLTimeInMS(time) {
        var times = time.split(':');
        return parseInt(times[0], 10) * 60 * 60 * 1000 + parseInt(times[1], 10) * 60 * 1000 + parseInt(times[2], 10) * 1000 + parseInt(times[3], 10) * 1000 / 100;
    }

    function toHHMMSS(txt, round) {
        var sec_num = parseInt(txt, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (round) {
            if (seconds > 29) {
                minutes += 1;
            }
            return hours * 60 + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var time = hours + ':' + minutes;
        if (hours === 0) {
            time = minutes;
        }
        if (!round) {
            time += ':' + seconds;
        }
        return time;
    }
    $.extend(turnerVideo, {
        toHHMMSS: toHHMMSS,
        visible: true,
        videoSkinSelector: '.player-wrapper .videoSkinArea',
        screenWidthTooSmallForSkin: 1023,
        maxSizeOfCVPWithSkin: 740,
        videoSkinPatchSelector: '.player-wrapper .videoSkinAreaIconTransparencyPatch',

        /**
         * Initializs the turnerVideo object
         * @param {[type]} params [description]
         * @return {[type]} [description]
         */
        init: function(params) {
            site = params['site'];
            profile = params['profile'];
            context = params['context'];
            fullEpId = params['fullEpId'];
            clipId = params['clipId'];
            updateState({
                'fullEpId': fullEpId,
                'clipId': clipId,
                'title': $('#pane-info h1.title').text(),
                'url': window.location.href
            }, true);
        },

        /**
         * Toggles the playing of the video
         */
        togglePausePlay: function() {
            if (cvpPlayStarted) {
                if (turnerVideo.player.isPaused()) {
                    turnerVideo.player.resume();
                } else {
                    turnerVideo.player.pause();
                }
            }
        },
        /**
         * Pauses the currently playing video
         * @return {[type]} [description]
         */
        pause: function() {
            if (cvpPlayStarted) {
                turnerVideo.player.pause();

				Tn.parseAnalytics({
				   "url_section": "/",
				   "section": "videos",
				   "subsection": "videos:continue watching",
				   "template_type": "adbp:video",
				   "content_type": "other:overlay",
				   "search.keyword": "",
				   "search.number_results": "",
				   "friendly_name": "video continue watching",
				   "series_name": window.turner_metadata.series_name
				}, false);
            }
            updateState({
                "paused": true,
                "position": turnerVideo.player.getPlayhead()
            });
        },
        setVolume: function(level) {
            if (!cvpPlayStarted || !cvpReady) {
                return;
            }
            if (level > 0) {
                turnerVideo.player.unmute();
                turnerVideo.player.setVolume(level);
            } else {
                turnerVideo.player.mute();
            }
        },

        updateHdStatus: function() {
            var el = document.getElementById('cvp_1'),
                hdEnabled = Tn.Users.getPref("hd", true);

            if (hdEnabled) {
                turnerVideo.player.switchBitrateId(hqBitrateId);
                //turnerVideo.player.setAutoBitrateSwitch(true);
            } else {
                turnerVideo.player.switchBitrateId(standardBitrateId);
                // turnerVideo.player.setAutoBitrateSwitch(false);
                // if (standardBitrateId!==undefined) {
                //     turnerVideo.player.switchBitrateId(standardBitrateId);
                // }
            }

            if (!el) {
                return;
            }

            if (hdEnabled) {
                el.setHDToggled(false);
            } else {
                el.setHDToggled(true);
            }

            if (standardBitrateId === undefined) {
                el.setHDToggleVisible(false);
            } else {
                el.setHDToggleVisible(true);
            }
        },

        showPlayer: function() {
            if (!Tn.lastVideoUrl || $('#page-video').hasClass('shown')) {
                return;
            }
            Tn.setUrl(Tn.lastVideoUrl, false, "page-video");
        },

        cancelUpNext: function() {
            if (turnerVideo.countdownTimer) {
                clearTimeout(turnerVideo.countdownTimer);
            }
            delete turnerVideo.countdownTimer;
        },

        removeMobileControls: function() {
            if (!isMobile) {
                return;
            }
            setTimeout(function() {
                $('#cvp_1').removeAttr('controls');
            }, 1000);
        },

        togglePauseState: function(val) {
            $('body').toggleClass('vid-paused', val).toggleClass('vid-playing', !val);
            isPaused = val;
            if (val) {
                if (vidObject) {
                    //pausedSeriesTitle.html(vidObject.franchise);
                    //pausedEpisodeTitle.html(vidObject.headline);
                    // we are pulling the data control data from the right rail info panel
                    pausedSeriesTitle.html($('#pane-info h1.title').text());
                    pausedEpisodeTitle.html($('#pane-info .vidtitle h2').text());
                    $('#paused-episode-desc').text($('#pane-info .desc').text());
                    $('#paused-season-episode .season span').text($('#pane-info .season span').text());
                    $('#paused-season-episode .ep span').text($('#pane-info .ep span').text());
                    $('#paused-tv-rating .tv-rating span').text($('#pane-info .tv-rating span').text());

                    if (($('#paused-season-episode .season span').text() === '') && $('#paused-season-episode .ep span').text() === '') {
                        $('#paused-season-episode').hide();
                    } else {
                        $('#paused-season-episode').show();
                    }
                    /*
                    $('#paused-episode-desc').text(vidObject.description);

                    if(vidObject.vidType === 'clip'){
                         $('#paused-season-episode .season span').text('Extras');
                    } else {
                        if(vidObject.seasonNumber.length !== 0){
                            $('#paused-season-episode .season span').text('Season ' + vidObject.seasonNumber);
                        } else {
                            $('#paused-season-episode .season span').text('');
                        }
                        if(vidObject.episodeNumber.length !== 0){
                            $('#paused-season-episode .ep span').text('Episode ' + vidObject.episodeNumber);
                        } else {
                            $('#paused-season-episode .ep span').text('');
                        }
                    }
                    */

                    if (playtimeLeftSec >= 60) {
                        $('#paused-remaining-time').text(playtimeLeftMin + ' minute' + (playtimeLeftMin !== 1 ? 's ' : ' ') + 'remaining');
                    } else {
                        $('#paused-remaining-time').text(playtimeLeftSec + ' seconds remaining');
                    }
                }
                pausedAreaDiv.fadeIn();
            } else {
                pausedAreaDiv.fadeOut();
            }
            turnerVideo.watchResize(600);
        },
        /**
         * Plays the currently loaded video
         */
        play: function() {
            if (Tn.mobileAuthShown) {
                showMode('full');
                turnerVideo.togglePauseState(true);
                return;
            }

            if (cvpPlayStarted) {
                turnerVideo.showPlayer();
                turnerVideo.player.resume();
            } else if (fullEpId) {
                turnerVideo.showPlayer();
                turnerVideo.playFullEp(fullEpId);
            } else if (clipId) {
                turnerVideo.showPlayer();
                turnerVideo.playClip(clipId);
            } else {
                Tn.showDefaultVideo();
            }
        },
        /**
         * Seeks the video using the offset and full width
         * The percentage is calculated by pos * 100 / fullWidth.
         */
        seek: function(pos, fullWidth) {
            if (cvpPlayStarted && !cvpInAds) {
                if (tveModeGlobal === 'liveTVE') {
                    return;
                }

                var vidPos = pos * turnerVideo.player.getDuration() / fullWidth;
                turnerVideo.showPlayer();
                turnerVideo.player.seek(vidPos);
            }
        },
        /**
         * Seeks 10 seconds into the past of the currently playing video
         */
        quickSeekBack: function() {
            if (cvpPlayStarted && !cvpInAds) {
                turnerVideo.showPlayer();
                turnerVideo.player.seek(turnerVideo.player.getPlayhead() - 10);
            }
        },
        /**
         * Plays the clip specified by the id
         * @param {String} clipId The clip to be played
         */
        playClip: function(clipId) {
            clipId = parseInt(clipId, 10);
            usingAuthentication = false;
            turnerVideo.player.play("&id=" + clipId, "");
        },
        /**
         * Plays full episode content specified by the id
         * @param {String} titleId The video to be played
         */
        playFullEp: function(titleId) {
            fullEpId = titleId;
            usingAuthentication = true;
            var noAuth = $('#page-video').attr("isAuthRequired") === "false" ? true : false;
            if (noAuth) {
                usingAuthentication = false;
                turnerVideo.player.play(titleId, "");
            } else {
                Tn.Auth.checkAuthorization(titleId);
            }
        },
        /**
         * Plays the queued up full episode with the proper authorization
         * @param {Object} accessToken The authorization token
         */
        playWithToken: function(accessToken) {
            if (fullEpId && typeof accessToken === 'object') {
                console.log("accessToken=" + accessToken);
                fullEpId = parseInt(fullEpId, 10);

                var live = false;
                switch (fullEpId) {
                    case videoFeedWest:
                        live = true;
                        ssid = ssidWest;
                        break;
                    case videoFeedEast:
                        live = true;
                        ssid = ssidEast;
                        break;
                }
                if (live) {
                    fullEpId = "&id=" + fullEpId;
                }
                turnerVideo.player.play(fullEpId, {
                    'accessToken': accessToken.accessToken,
                    'accessTokenType': accessToken.accessTokenType
                });
                fullEpId = null;
            } else if (cvpPlayStarted) {
                turnerVideo.player.resume();
            }
        },
        watchResize: function(timeToWatch) {
            this.endTime = new Date().getTime() + timeToWatch;
            this.onResizeTimer();
        },
        onResizeTimer: function() {
            if (this.videoTimer) {
                clearTimeout(this.videoTimer);
                delete this.videoTimer;
            }

            this.resize();
            if (new Date().getTime() > this.endTime) {
                return;
            }
            this.videoTimer = setTimeout($.proxy(this.onResizeTimer, this), 10);
        },

        updateSplashSize: function() {
            var splash = $('#loading-splash');
            var lw = splash.width();
            var lh = splash.height();
            var nw, nh;
            nw = lw;
            nh = lw * 360 / 640;

            if (nh < lh) {
                nh = lh;
                nw = lh * 640 / 360;
            }
            $('#loading-splash-image').width(nw).height(nh).css({
                'margin-left': -nw / 2,
                'margin-top': -nh / 2
            });
        },
        wait4Skin: function(attempts){
            attempts++;
            if(window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector)){
                turnerVideo.resize();
            } else if(attempts < 20){ // Should be in by 10 seconds
                window.setTimeout(function(){
                    turnerVideo.wait4Skin(attempts);
                }, 500);
            }
        },     
        /**
         * Updates the video to the current dom dimensions
         */
        resize: function() {
            // Always updated the splash size even if CVP is not ready
            turnerVideo.updateSplashSize();

            //console.log("resize");
            if (!cvpReady) {
                return;
            }
            updateSize();

            //var w = playerDiv.width();
            //var h = playerDiv.height();
            //
            var w = playerWrapper.width();
            var h = playerWrapper.height();
            var ww = w;
            var hh = h;
            var top = 0;
            var left = 0;
            var videoWidth = turnerVideo.player.getContentWidth();
            var videoHeight = turnerVideo.player.getContentHeight();
            var videoSkinDiv = $(turnerVideo.videoSkinSelector);
            var videoSkinPatchDiv = $(turnerVideo.videoSkinPatchSelector);
            if (videoWidth === 0 || videoHeight === 0) { //assume 16:9
                videoWidth = 640;
                videoHeight = 360;
            }
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

            var cvpWidth =ww, cvpHeight = hh, skinH,
                    skinW, ww2, hh2,
                    skinRightClickDiv,
                    skinLeftClickDiv,
                    wWidth = $(window).width();
            if(wWidth > turnerVideo.screenWidthTooSmallForSkin && window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector)){
                var backgroundImage = window.turnerVideoPageObj.getBackgroundImage(turnerVideo.videoSkinSelector);
                skinRightClickDiv = $('#rightclick');
                skinLeftClickDiv = $('#leftclick');
                if(backgroundImage.indexOf('?h=1') > 0){
                    skinH = h;
                    skinW = (64/31) * skinH; // Width calculated from aspect ratio of the skin
                } else {
                    skinW = wWidth;
                    skinH = (31/64) * skinW; // Height calculated from aspect ratio of the skin
                }
                scale = Math.min(wWidth / videoWidth, h / videoHeight);
                ww2 = videoWidth * scale;
                hh2 = videoHeight * scale;

                cvpWidth = 0.75 * ww2;
                cvpHeight = 0.75 * hh2;
                if(cvpWidth > ww){
                    cvpHeight = Math.round(( ww * cvpHeight ) / cvpWidth);
                    cvpWidth = ww;
                }
                if(cvpWidth > turnerVideo.maxSizeOfCVPWithSkin){
                    cvpHeight = Math.round(( turnerVideo.maxSizeOfCVPWithSkin * cvpHeight ) / cvpWidth);
                    cvpWidth = turnerVideo.maxSizeOfCVPWithSkin;
                }
                pausedAreaDiv.width(cvpWidth);
                pausedAreaDiv.height(cvpHeight);
                playerWrapper.addClass('hasSkin');
                playerDiv.addClass('hasSkin');
                // Had to put the div containing the video skin outside the div with the cvp because the cvp was getting corrupted
                // and the next video would not play
                videoSkinDiv.show();
                //videoSkinDiv.width(ww).height(hh);
                videoSkinDiv.width(skinW).height(skinH);
                // videoSkinDiv.css("margin-top", topString);
                // videoSkinDiv.css("margin-left", leftString);
                
                videoSkinPatchDiv.show();
                skinRightClickDiv.css("left", (cvpWidth + 10) + 'px');
                skinRightClickDiv.css("height", (cvpHeight + 10) + 'px');
                skinLeftClickDiv.css("top", (cvpHeight + 10) + 'px');
                // videoSkinPatchDiv.css("margin-top", topString);
                // videoSkinPatchDiv.css("margin-left", leftString);
                videoSkinPatchDiv.css("max-height", cvpHeight.toString() + "px");
            } else {
                playerDiv.css("margin-top", topString);
                playerDiv.css("margin-left", leftString);
                pausedAreaDiv.width('auto');
                pausedAreaDiv.height('auto');
                playerWrapper.removeClass('hasSkin');
                playerDiv.removeClass('hasSkin');
                videoSkinDiv.hide();
                videoSkinPatchDiv.hide();
            }

            turnerVideo.player.resize(cvpWidth, cvpHeight, 0);
            cvpDiv.width(cvpWidth).height(cvpHeight);
            //cvpDiv.css("margin-top", topString);
            //cvpDiv.css("margin-left", leftString);
            playerDiv.width(cvpWidth).height(cvpHeight);
            //pausedAreaDiv.height(hh);
        },

        showSplash: function() {
            $('#loading-splash').show();
            doHideSplash = true;
        },

        updateProgress: function(playhead, duration) {
            if (!showProgress) {
                return;
            }
            if (duration === undefined) {
                duration = 1;
            }
            if (playhead === undefined) {
                playhead = 0;
            }
            if (duration < 1) {
                duration = 1;
            }
            var progress = playhead * 100 / duration;
            var progressString = progress.toString() + "%";
            timeSliderBut.css('width', progressString);
            timeSliderHandle.css("left", progressString);
            playtimeDone.text(toHHMMSS(playhead.toString()));
            playtimeTogo.text(toHHMMSS((duration).toString()));
            playtimeLeftMin = toHHMMSS(duration - playhead, true);
            playtimeLeftSec = parseInt(duration - playhead, 10);
        },

        updateTitle: function(title, season, episode, duration, type) {
            // we are pulling the data control data from the right rail info panel
            $(".video-meta .title").text(title);
            $('.video-meta .season span').text(season);
            $('.video-meta .ep span').text(episode);

            if (episode === undefined || episode === null) {
                episode = '';
            }

            if (season === undefined || season === null) {
                season = '';
            }

            if (duration === undefined) {
                duration = 0;
            }

            playtimeDone.text('0:00:00');
            playtimeTogo.text(toHHMMSS(duration));


            if (type === 'liveTVE' || (season.length === 0 && episode.length === 0)) {
                $('.video-meta .wrapper').hide();
            } else {
                $('.video-meta .wrapper').show();
            }

            if (type === 'liveTVE') {
                var upNextTitle = $('#pane-info .upnextvideotitle').text();
                $('.video-meta .playtime').hide();
                $('.video-meta .upnextvideo').html('');
                $('.video-meta .upnextvideo').html('Up Next: ' + upNextTitle);
            } else {
                $('.video-meta .playtime').show();
                $('.video-meta .upnextvideo').text('');
            }
        },

        restoreState: function(prefs) {
            //console.error("Found STATE", prefs);
            if (!prefs) {
                return;
            }
            turnerVideo.savedState = $.extend({}, prefs);

            turnerVideo.updateTitle(prefs.title, prefs.season, prefs.episode, prefs.duration, prefs.tveMode);
            turnerVideo.updateProgress(prefs.playhead || 0, prefs.duration || 0);
        },

        launchClip: function(clip) {
            $.get('/service/cvpXml.xml?titleId=&id=' + clip).success(function(xml) {
                var json = $.xml2json(xml);
                var files = json['#document'].video.files.file;
                var images = json['#document'].video.images.image;
                var file, selectedBitrate, poster, pw;
                $.each(files, function(key, f) {
                    if (!file) {
                        file = f._;
                        selectedBitrate = 'unknown';
                        return;
                    }
                    var bitrate = f.$.bitrate || '';
                    bitrate = bitrate.toLowerCase();
                    if (tnVars.isIPhone && bitrate === 'iphone') {
                        file = f._;
                        selectedBitrate = bitrate;
                    }
                    if (tnVars.isIPad && bitrate === 'ipad') {
                        file = f._;
                        selectedBitrate = bitrate;
                    }
                    if (tnVars.isIPod && bitrate === 'ios') {
                        file = f._;
                        selectedBitrate = bitrate;
                    }
                    if (tnVars.isAndroid && bitrate === 'androidphone') {
                        file = f._;
                        selectedBitrate = bitrate;
                    }
                });
                $.each(images, function(key, f) {
                    if (!poster) {
                        poster = f._;
                        pw = parseInt(f.$.width, 10) || 0;
                        return;
                    }
                    var nw = parseInt(f.$.width, 10) || 0;
                    if (nw > pw) {
                        poster = f._;
                        pw = nw;
                    }
                });

                console.error("Found files", file, poster, json, files, images);
                poster = '/images/no-image.gif';
                var html5 = $('#clip-video');
                if (html5.length === 0) {
                    html5 = $(Tn.fm('<div class="video-container"><video id="clip-video" src="{file}" width=640 height=360 poster="{poster}" webkit-playsinline></video></div>', {
                        file: file,
                        poster: poster
                    }));
                    html5.appendTo($('#playerDiv'));
                    html5.on({
                        touchstart: function(e) {
                            e.preventDefault();
                            this.play();
                        },
                        play: function() {
                            $(this).removeAttr("poster");
                        }
                    });
                } else {
                    html5.attr('src', file).attr('poster', poster);
                }

                //Tn.launchProtocol(file);
                //window.location.href = file;
            }).fail(function() {
                Tn.alert('Failed to load video');
            });
        },

        showClipComments: function() {
            var foundShow = 0,
                paths = window.currentPageUrl.split('/');
            for (var i = 0; i < paths.length - 1; i++) {

                // Locate the show name in the video url and grab the show info
                if (paths[i] === 'videos') {
                    foundShow = i + 1;
                    break;
                }
            }

            // Didn't find the show name
            if (foundShow < 1) {
                return;
            }

            // Fetch the show via a JSON call
            $.getJSON('/service/shows/byName/' + paths[foundShow] + '.json').success(function(show) {
                if (!show.series || !show.series.arktanAll || show.series.arktanAll.length === 0) {
                    return;
                }
                $('#page-video').find('aside .nav a[paneid="pane-share"]').show();
                Tn.showComments(show.series.arktanAll);
            });
        },

        /**
         * Initializes the video player
         */
        load: function(options) {
            lastSavedInitOptions = $.extend({}, options);
            $('body').removeClass('vid-loaded');

            // Delete any upnext video 
            turnerVideo.cancelUpNext();

            // Removed our stored poster image
            delete turnerVideo.posterImage;

            // Only show the splash if the clipId is being loaded
            if (!isMobile || options.clipId) {
                loadSplashData();

            }



            // Toggle whether or not to show the chat pane
            if (options.clipId) {
                turnerVideo.showClipComments(options.clipId);
            }

            if (isMobile) {
                if (!splashPlaying) {
                    $('#loading-splash-image').attr('src', '');
                }

                // we are adding the mobile close button for the right rail
                $('#page-video aside.in-player-tray .mobilecloseRR').remove();
                $('#page-video aside.in-player-tray').append('<div class="mobilecloseRR"></div>');
                $('#page-video .mobilecloseRR').on('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeRail();
                });
                // we will show mobilecloseRR if the screen with is < 370;
                // we check the screen width on orientation changein global.js and
                // set the show class according to the new width
                if (tnVars.windowW < 370) {
                    $('#page-video aside.in-player-tray .mobilecloseRR').addClass('show');
                } else {
                    $('#page-video aside.in-player-tray .mobilecloseRR').removeClass('show');
                }

                Tn.getVideoInfo(options.fullEpId || options.clipId, function(ep) {
                    if (!ep) {
                        return;
                    }
                    if (!splashPlaying) {
                        $('#loading-splash-image').attr('src', ep.imgSrc);
                        $('#loading-splash').removeClass('loading');
                    }
                    turnerVideo.posterImage = ep.imgSrc;
                    $('#cvp_1').attr('poster', turnerVideo.posterImage);
                    turnerVideo.watchResize(250);
                });
                if(window.adHelper){
                    //Turn off video skin sync ad
                    window.window.adHelper.manageSkinSyncAds([], $('#page-video .player-wrapper'));
                }

            }
            standardBitrateId = undefined;
            hqBitrateId = undefined;
            doVideoCompleteEvent = true;
            usingAuthentication = true;
            turnerVideo.useRestore = true;
            // If the profile dialog is shown, then hide it
            $('#profile-dialog').modal('hide');

            doHideSplash = true;
            //$('#loading-splash').toggleClass('mobile', isMobile).show();

            // If we're on mobile, the right rail is too large, so close it automatically
            if (isMobile) {
                setTimeout(function() {
                    closeRail();
                }, 2000);

                if (!options.clipId) {
                    window.pageStateChanges = (window.pageStateChanges) ? window.pageStateChanges : {};
                    window.pageStateChanges['gotoAppModal'] = true;
                    $('#mobile-app-dialog').modal('show');
                    turnerVideo.togglePauseState(true);
                    return;
                }
                // else {
                //     turnerVideo.launchClip(options.clipId);
                // }
            }

            if (options) {
                turnerVideo.init(options);
            }
            if (playerLoaded) {
                showMode('full');
                if (options.clipId) {
                    turnerVideo.playClip(options.clipId);
                } else {
                    turnerVideo.playFullEp(options.fullEpId);
                }
                return;
            }
            playerWrapper = $('#page-video .player-wrapper');
            playerDiv = $('#page-video #playerDiv');
            pausedAreaDiv = $('#pausedAreaDiv');
            pausedSeriesTitle = $('#paused-series-title h1');
            pausedEpisodeTitle = $('#paused-episode-title h2');
            playerLoaded = true;
            // Switch to the testing freewheel suite if cookie is set
            if($.cookie('devCVP') === "1"){
                context = context + '_dev';
                // $('.player-wrapper .videoSkinArea').parent().bind('DOMNodeInserted DOMNodeRemoved', function(event) {
                //     if (event.type == 'DOMNodeInserted') {
                //         console.log('Content added! Current content:' + '\n\n' + $(this).find('.videoSkinArea').html());
                //     } else {
                //         console.log('Content removed! Current content:' + '\n\n' + $(this).find('.videoSkinArea').html());
                //     }
                // });
            }
            turnerVideo.player = new CVP({
                id: 'cvp_1',
                width: 640,
                height: 360,
                flashVars: {
                    context: context,
                    basePath: '/',
                    site: site,
                    profile: profile
                },
                embed: {
                    containerSwf: 'https://web.archive.org/web/20141231172933/http://z.cdn.turner.com/xslo/cvp/assets/container/2.0.5.1/cvp_main_container.swf',
                    expressInstallSwf: 'https://web.archive.org/web/20141231172933/http://z.cdn.turner.com/xslo/cvp/assets/flash/expressInstall.swf',
                    flashVersion: '11.1',
                    options: {
                        quality: 'high',
                        bgcolor: '#000000',
                        allowFullScreen: 'true',
                        allowScriptAccess: 'always',
                        wmode: 'transparent'
                    }
                },
                onPlayerReady: function() {
                    if (!isNaN(fullEpId)) {
                        turnerVideo.playFullEp(fullEpId);
                    } else if (!isNaN(clipId)) {
                        turnerVideo.playClip(clipId);
                    }
                },
                onCVPReady: function() {
                    cvpDiv = $('#cvp_1');
                    cvpReady = true;
                },
                onContentBegin: function() {
                    cvpPlayStarted = true;
                    cvpInAds = false;
                    turnerVideo.watchResize(1000);
                    $(window).resize(turnerVideo.resize);
                    turnerVideo.setVolume(0);
                    $('#page-video').addClass('video-playing').removeClass('video-finished');
                    // Wait 10 seconds for sync ad before starting ad reloader.  This will allow us to put ad in immmediately is there is no preroll
                    window.turnerVideoPageObj.firstSyncAdShown = false;
                    setTimeout(window.turnerVideoPageObj.startAdInTrayReloader, 10000);
                    window.window.adHelper.manageSyncAds($('#page-video aside .syncAdWrapper'), []);
                },
                onContentValidationFailure: function(playerId, contentId, errorType, data) {
                    if (errorType === "blackout") {
                        //document.getElementById("slate").style.visibility = "visible";
                        if (data.code === 0) { //User is in blacked out region
                            Tn.alert('blackoutMsg');
                        } else { //other blackout service error
                            Tn.alert('blackoutTechIssue');
                        }
                        try {
                            vidObject.blackoutType = "regional blackout";
                            TVE_VideoEvent(vidObject, "tve-live_video-blackout");
                        } catch (e) {}
                    }
                },

                onContentEntryLoad: function(playerId, videoId) {
                    openRail(true);
                    showMode('full');
                    $('body').removeClass('adPlaying');
                    var vidObjectJSON = turnerVideo.player.getContentEntry(videoId);
                    //console.log("onContentEntryLoad", arguments);
                    vidObject = $.parseJSON(vidObjectJSON.toString());
                    vidObject.usingAuth = usingAuthentication;
                    lastVideoId = parseInt(videoId, 10);
                    var duration = parseInt(vidObject.trt, 10);
                    playtimeLeftMin = toHHMMSS(vidObject.trt, true);
                    playtimeLeftSec = parseInt(duration, 10);

                    tveModeGlobal = (vidObject.tveMode) ? vidObject.tveMode : "";
                    // jhillmann: moved this tveModeGlobal block from below to try to set the type for clips to pass to updateTitle
                    if (tveModeGlobal === "") {
                        tveModeGlobal = 'clip';
                        vidObject.tveMode = 'clip';
                    }

                    // Clear any current ad breaks
                    timeSlider.find('.time-ad-handle').remove();

                    turnerVideo.updateTitle($('#pane-info h1.title').text(), $('#pane-info .season span').text(), $('#pane-info .ep span').text(), parseInt(vidObject.trt, 10), tveModeGlobal);
                    if (window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector) ){
                        window.turnerVideoPageObj.resetBackGroundSkin();
                        turnerVideo.watchResize(1500);
                    }
                    if (tveModeGlobal === 'liveTVE') {
                        showProgress = false;
                        timeSliderBut.hide();
                        timeSliderHandle.hide();
                        // Switch to the testing freewheel suite if cookie is set
                        if($.cookie('devCVP') === "1"){
                            turnerVideo.player.switchAdContext('watchlivedev');
                        } else {
                            turnerVideo.player.switchAdContext('watchlive');
                        }
                        turnerVideo.player.setAdSection(ssid); //thisSiteSectionId is defined at page level 
                        //turnerVideo.setAdSection(''); 
                        addLiveStat(lastVideoId);
                    } else {
                        // Switch to the testing freewheel suite if cookie is set
                        if($.cookie('devCVP') === "1"){
                            turnerVideo.player.switchAdContext('cvpdev');
                        } else {
                            turnerVideo.player.switchAdContext('default');
                        }
                        timeSliderBut.show();
                        timeSliderHandle.show();
                        showProgress = true;
                        // Update our histor of watched videos
                        addStat(lastVideoId);

                        // Pull out the ad breaks
                        var actions = vidObject.actions || [],
                            breakSpots = [],
                            adBreakTime = 0;
                        $.each(actions, function(key, action) {
                            if (action.action.type !== 'c4') {
                                return;
                            }
                            adBreakTime += calculateXMLTimeInMS(action.action.end.time) - calculateXMLTimeInMS(action.action.start.time);
                            breakSpots.push(adBreakTime * 0.100 / duration);
                        });
                        breakSpots.pop();
                        $.each(breakSpots, function(key, spot) {
                            timeSlider.append('<div class="time-ad-handle" style="left: ' + spot + '%;"></div>');
                        });
                    }
                    /*
                    if (tveModeGlobal === "") {
                        tveModeGlobal = 'clip';
                        vidObject.tveMode = 'clip';
                    }
                    */
                    if (vidObject.tveMode === 'C3' || vidObject.tveMode === 'C4' || vidObject.tveMode === 'liveTVE') {
                        // authenticated video
                        turnerVideo.player.setAdKeyValue('_fw_ar', '1');
                        turnerVideo.player.setAdKeyValue('_fw_ae', window.fw_ae);
                        if (vidObject.tveMode === 'C3') {
                            turnerVideo.player.switchTrackingContext('short_interval_c3');
                        } else if (vidObject.tveMode === 'C4') {
                            turnerVideo.player.switchTrackingContext('short_interval_c4');
                        }
                    } else {
                        // non-authenticated video
                        turnerVideo.player.setAdKeyValue('_fw_ar', '0');
                        turnerVideo.player.switchTrackingContext('clips');
                    }
                    if (window.cnnad_readCookie) {
                        turnerVideo.player.setAdKeyValue("GUID", window.cnnad_readCookie("ug"));
                    }
                    updateState({
                        title: $('#pane-info h1.title').text(),
                        season: $('#pane-info .season span').text(),
                        episode: $('#pane-info .ep span').text(),
                        tveMode: tveModeGlobal,
                        duration: duration
                    });

                    if (turnerVideo.posterImage) {
                        $('#cvp_1').attr('poster', turnerVideo.posterImage);
                        turnerVideo.watchResize(250);
                    }

                    if (isMobile && doInitializeVideoEvents) {
                        doInitializeVideoEvents = false;
                        $('#cvp_1').on("touchstart", function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (videoState.playing) {
                                turnerVideo.pause();
                            } else {
                                // Trigger a native html5 play
                                this.play();
                            }
                        });
                    }

                    // Preload the carousel data for up-next
                    if (!isMobile) {
                        //Wait for the video to load and then prefetch data
                        window.setTimeout(function(){
                            Tn.preloadData()
                        }, 10000); // There should be a preroll
                    }

                    turnerVideo.setVolume(0);
                },

                onContentPlay: function() {
                    if(window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector) ){
                        closeRail(); //Close per TENDP-11822
                    } else if ($(window).width() > 600) {
                        openRail(); //Open per TENONENINE-841
                    }
                    turnerVideo.resize();
                    timeSliderBut.css('width', '0%');
                    playButton.css("display", "none");
                    pauseButton.css("display", "block");
                    turnerVideo.togglePauseState(false);

                    updateState({
                        'playing': true
                    });

                    var bitRateJson = turnerVideo.player.getAvailableBitrates('window');
                    if (bitRateJson) {
                        for (var i = 0; i < bitRateJson.length; i++) {
                            if (bitRateJson[i].label === "standard") {
                                standardBitrateId = bitRateJson[i].id;
                            } else if (bitRateJson[i].label === "hq") {
                                hqBitrateId = bitRateJson[i].id;
                            }
                        }
                    }

                    turnerVideo.updateHdStatus();
                    turnerVideo.removeMobileControls();
                },

                onContentPause: function(playerId, contentId, paused) {
                    vidObject.paused = paused;
                    vidObject.tveMode = tveModeGlobal;
                    if (tveModeGlobal === 'clip') {
                        sendVideoEvent(vidObject, "video-pause");
                    } else {
                        TVE_VideoEvent(vidObject, "video-pause");
                    }

                    updateState({
                        'paused': paused,
                        'playhead': turnerVideo.player.getPlayhead(),
                        'duration': turnerVideo.player.getDuration()
                    });

                    turnerVideo.removeMobileControls();
                    //window.turnerVideoPageObj.stopAdInTrayReloader(); // Stop here since with pause and play, we at least need to start over.
                    if (paused) {
                        playButton.css("display", "block");
                        pauseButton.css("display", "none");
                        turnerVideo.togglePauseState(true);
                    } else {
                        playButton.css("display", "none");
                        pauseButton.css("display", "block");
                        turnerVideo.togglePauseState(false);
                        if(!cvpInAds){
                            //window.turnerVideoPageObj.startAdInTrayReloader();
                        }
                    }
                },
                onContentBuffering: function(playerId, contentId, buffering) {
                    vidObject.buffering = buffering;
                    vidObject.tveMode = tveModeGlobal;
                    if (tveModeGlobal === "clip") {
                        sendVideoEvent(vidObject, "video-buffer");
                    } else {
                        TVE_VideoEvent(vidObject, "video-buffer");
                    }
                },
                onTrackingContentSeek: function() {
                    if (tveModeGlobal === 'clip') {
                        sendVideoEvent(vidObject, "video-scrub");
                    }
                },
                onContentBitrateChangeEnd: function() {
                    // if (Tn.Users.getPref("hd", true)) {
                    //     turnerVideo.player.setAutoBitrateSwitch(true);
                    // }
                },
                onContentPlayhead: function(playerId, contentId, playhead, duration, currentPlayTime) {
                    if (splashPlaying) {
                        turnerVideo.player.pause();
                        pausedInSplash = true;
                        return;
                    }

                    // Ensure we remove the ad playing class if our play head is giving us data once again
                    if (removeAdDiv) {
                        removeAdDiv = false;
                        $('body').removeClass('adPlaying');
                        turnerVideo.removeMobileControls();
                    }
                    // If we're not currently on the video page and it is not the live stream loaded in the player, then pause the video
                    // for live tv, the contentplayhead will still be streaming even if the player is paused
                    if (Tn.currentPage !== "page-video" && tveModeGlobal !== 'liveTVE') {
                        if(!window.turnerVideo.player.isPaused()){
                            turnerVideo.pause();
                        }
                        
                        if (!Tn.currentUser) {
                            if (!$.cookie('hidewatch')) {
                                $('#continue-watching-dialog').modal('show');
                            }
                            //Tn.confirm("Sign in to continue watching <b>" + videoState.title + "</b> later.<br>Tap me to do so now.", function() {
                                //Tn.Users.logIn();
                            //});
                        }
                    }

                    // If we're currently showing the video splash, hide it
                    if (doHideSplash) {
                        hideSplash();
                        turnerVideo.removeMobileControls();
                    }

                    // Check to see if we should restore at our previous location
                    if (turnerVideo.useRestore) {
                        turnerVideo.useRestore = false;

                        var history = Tn.Users.getPref('videoHistory', {});
                        if (history[lastVideoId]) {
                            if (history[lastVideoId].pg && history[lastVideoId].pg > 0 && history[lastVideoId].pg < 99) {
                                var seekToTime = duration * history[lastVideoId].pg / 100.0;

                                // We're not going to seek if we're less than 5 seconds into a video
                                if (seekToTime > 5) {
                                    turnerVideo.player.seek(seekToTime);
                                }
                            }
                        }
                    } else {
                        // We don't want to flood Gigya with requests, so record our play state every 30 seconds
                        if (Math.abs((videoState.playhead || 0) - playhead) > 15) {
                            updateState({
                                'playhead': playhead,
                                'duration': duration
                            });
                        }

                        // Show the up-next screen
                        if (duration - playhead < (Tn.upNextTimeInSeconds + 0.99)) {
                            if (tveModeGlobal !== 'liveTVE') {
                                turnerVideo.showMode('upnext');
                            }
                        }
                    }
                    vidObject.playhead = playhead; 
                    vidObject.currentPlayTime = currentPlayTime; 
                    turnerVideo.updateProgress(playhead, duration);
                },
                onContentEnd: function() {
                    cvpPlayStarted = false;
                    //vidObject = null;

                    playButton.css("display", "block");
                    pauseButton.css("display", "none");
                    //turnerVideo.togglePauseState(true);
                    updateState({
                        'playing': false,
                        'pg': 100
                    });

                    $('#page-video').removeClass('video-playing').addClass('video-finished');
                },
                onLiveShowChange: function(){
                    console.log("onLiveShowChange");
                    // this is where we need to check the airing date and if it is different than the last one
                    // we need to pull the lmdb feed for the right rail data.
                    // i see this event being called at beginning of new show and after ad breaks
                    window.refreshLiveStreamData = true;
                    Tn.showPlayerInternal(window.location.href);
                },
                onAdPlay: function(playerId, token, mode, id, duration, blockId, adType) {
                    cvpInAds = true;
                    window.turnerVideoPageObj.stopAdInTrayReloader();
                    if ($(window).width() > 600) {
                        openRail();
                    }
                    window.turnerVideoPageObj.hideReloadingAds();
                    window.turnerVideoPageObj.showSyncAdInTray();
                    window.turnerVideoPageObj.locateFreewheelSyncAd();
                    window.turnerVideoPageObj.firstSyncAdShown = true;
                    
                    $('body').addClass('adPlaying');

                    turnerVideo.showMode('full');

                    removeAdDiv = true;
                    playButton.css("display", "none");
                    pauseButton.css("display", "block");
                    turnerVideo.togglePauseState(false);
                    vidObject.mode = mode;
                    vidObject.id = id;
                    vidObject.duration = duration;
                    vidObject.videoState = "ad";
                    vidObject.adType = adType;
                    if (tveModeGlobal === 'liveTVE') {
                        TVE_VideoEvent(vidObject, "tve-live_ad-start");
                    } else if (vidObject.tveMode !== "clip") {
                        TVE_VideoEvent(vidObject, "ad-start");
                    } else if (adType !== "postroll") {
                        sendVideoEvent(vidObject, "video-preroll");
                    }
                    turnerVideo.wait4Skin(0);
                },
                onAdPlayhead: function(playerId, playhead, duration) {
                    if (splashPlaying) {
                        turnerVideo.player.pause();
                        pausedInSplash = true;
                        return;
                    }
                    if (Tn.currentPage !== "page-video") {
                        turnerVideo.pause();
                    }
                    if (doHideSplash) {
                        hideSplash();
                    }
                    if (!showProgress) {
                        return;
                    }
                    var progress = playhead * 100 / duration;
                    var progressString = progress.toString() + "%";
                    timeSliderBut.css('width', progressString);
                    timeSliderHandle.css("left", progressString);
                    vidObject.playhead = playhead; 
                },
                onAdEnd: function(playerId, token, mode, id, blockId, adType) {
                    cvpInAds = false;
                    // Rules are such that, the tray will open if closed after preroll/midroll start so only turn off sync ads if video ads are running and 
                    // user closed tray.  Here we are turning sync ads back on ( if closed previously ) in prep for the next pre-roll / midroll
                    window.window.adHelper.manageSyncAds($('#page-video aside .syncAdWrapper'), []);
                    window.turnerVideoPageObj.startAdInTrayReloader();
                    vidObject.adType = adType;
                    vidObject.videoState = "video";
                    if (tveModeGlobal === 'liveTVE') {
                        TVE_VideoEvent(vidObject, "tve-live_ad-complete");
                    } else if (adType === "midroll") {
                        TVE_VideoEvent(vidObject, "ad-complete");
                    }
                    if(window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector) ){
                        closeRail();
                    } else if ($(window).width() > 600) {
                        openRail(true);
                    }
                    //Clear out video skin if there is one.  Let prerool go until the first tray ad refresh or onAdStart
                    // if (((adType === 'midroll') || (adType === 'postroll')) && window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector) ){
                    //     window.turnerVideoPageObj.resetBackGroundSkin();
                    //     turnerVideo.watchResize(1500);
                    // }

                    // if (videoState.playing === false) {
                    //     turnerVideo.showMode('upnext');
                    // }
                },
                onTrackingAdProgress: function(playerId, dataObj) {
                    if (tveModeGlobal && tveModeGlobal !== "clip") {
                        if (dataObj.adType !== "preroll") {
                            TVE_VideoEvent(vidObject, "ad-progress");
                        }
                    }
                },
                onTrackingContentPlay: function(playerId, dataObj) {
                    try {
                        //var isvideoComplete_flg = false;
                        //var video_progressMarkerNum = 0;
                        //var isvidperct100 = false;
                        vidObject.videoState = "video";
                        vidObject.adType = "";
                        if (tveModeGlobal === "liveTVE") {
                            TVE_VideoEvent(vidObject, "tve-live_video-start");
                        } else if (tveModeGlobal !== 'clip') {
                            vidObject.duration = dataObj["length"];
                            if (Tn.autoPlaying) {
                                TVE_VideoEvent(vidObject, "video-autostart");
                                Tn.autoPlaying = false;
                            } else {
                                TVE_VideoEvent(vidObject, "video-start");
                            }
                        } else {
                            if (Tn.autoPlaying) {
                                sendVideoEvent(vidObject, "video-autostart");
                                Tn.autoPlaying = false;
                            } else {
                                sendVideoEvent(vidObject, "video-start");
                            }

                        }
                    } catch (e) {}
                },
                onTrackingContentComplete: function() {
                    if (!doVideoCompleteEvent) {
                        return;
                    }
                    doVideoCompleteEvent = false;
                    if (vidObject.tveMode !== 'clip') {
                        TVE_VideoEvent(vidObject, "video-complete");
                    } else {
                        sendVideoEvent(vidObject, "video-complete");
                    }
                },
                onTrackingContentProgress: function() { },

                onTrackingContentSegmentComplete: function() {
                    console.log('!!!!!!! onTrackingContentSegmentComplete ');
                    if (window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector) ){
                        window.turnerVideoPageObj.resetBackGroundSkin();
                        turnerVideo.watchResize(1500);
                    }
                },

                onTrackingFullscreen: function(playerId, dataObj) {
                    window.turnerVideoPageObj.stopAdInTrayReloader();
                    if (dataObj.fullscreen === false) {
                        //if(!cvpInAds && !vidObject.paused){
                        if(!cvpInAds){
                            window.turnerVideoPageObj.startAdInTrayReloader();
                        }
                    }
                },
                onCVPVisibilityChange : function(playerId, visible){},
 
                onPageVisibilityChange : function(playerId, visible){
                    turnerVideo.visible = visible;
                    window.turnerVideoPageObj.stopAdInTrayReloader();
                    if (visible) {
                        //if(!cvpInAds && !vidObject.paused){
                        if(!cvpInAds){
                            window.turnerVideoPageObj.startAdInTrayReloader();
                        }
                    }
                },
                onViewportVisibilityChange : function(playerId, visible){}
            });
            turnerVideo.player.embed("playerarea");
        }
    });
    var tntDefaultOpenPaneId = 'pane-info';
    window.turnerVideoPageObj = {
        rrSlider: [],
        currentTrayPaneId: tntDefaultOpenPaneId,
        syncAdWrapperSelector: '.syncAdWrapper',

        init: function() {
            this.initVideoEvents();
            this.initAside();
        },
        initVideoEvents: function() {
            if (Tn.gup('pageMode') === 'fullscreen') {
                $('body').addClass('fixed-page');
            }

            $('#pausedAreaDiv').on("click", function(event) {
                event.preventDefault();
                event.stopPropagation();

                // Replay the video if the paused div was clicked in up next mode
                if (lastSavedInitOptions && $('#page-video').attr('mode') !== 'full') {
                    turnerVideo.cancelUpNext();
                    turnerVideo.player.replay();
                    return;
                }

                turnerVideo.player.resume();
            });
            $('#full-screen-btn').on("click", function(event) {
                event.preventDefault();
            });

            $('#page-video .profile-dologin').click(function(event) {
                event.preventDefault();
                event.stopPropagation();
                Tn.Users.logIn();
            });

            if (isMobile) {
                $('#playerarea').on("click", function() {
                    turnerVideo.play();
                });
            }

            $('body').on('pageresize', function() {
                turnerVideo.watchResize(500);
            });

            $('#page-video aside a[paneid]').on('click', function() {
                //console.log("page-video aside a[paneid] clicked");
                var $panel = $('#page-video aside');
                var paneId = $(this).attr('paneid');
                var $thisPane = $panel.find('#' + paneId);
                var $butts = $('#page-video aside a[paneid]');
                var $panes = $panel.find('.pane');
                var vidDiv = document.getElementById('playerDiv');
                var resizeDivFn = function() {
                    turnerVideo.watchResize(1000);
                };
                tnVars.addResizeListener(vidDiv, resizeDivFn);

                window.turnerVideoPageObj.stopAdInTrayReloader(); // Stop here since with closing or opening the tray, we at least need to start over.

                // this means you have clicked on the one that is open
                // so it should close and button loses highlight
                if ($(this).hasClass('active')) {
                    //close panel
                    $panel.removeClass('open');
                    $('#page-video .player-wrapper').removeClass('railopen');
                    //deactivate link
                    $(this).removeClass('active');
                    // setting timeout so the pane does not hide while it is still visible
                    // transition in css is set to .5
                    window.setTimeout(function() {
                        // hide pane
                        $panes.hide();
                    }, 600);
                    turnerVideo.watchResize(1000);
                    if(cvpInAds){
                        // Turn off all cvp sync ads in the tray but only in preroll/midroll.  
                        // Need the first ad to run so later ones can come into view later.  Need the instationation when first ad starts.
                        // Rules are such that, the tray will open if closed on preroll start so only turn off ads if ads are running and user closed tray
                        window.window.adHelper.manageSyncAds([], $('#page-video aside .syncAdWrapper'));
                    }
                    return;
                } else {
                    $panel.addClass('open');
                    $('#page-video .player-wrapper').addClass('railopen');
                    window.turnerVideoPageObj.currentTrayPaneId = paneId;
                    //if(!vidObject.paused && !cvpInAds){
                    if(!cvpInAds){
                        window.turnerVideoPageObj.startAdInTrayReloader();
                    }
                    // Turn on sync ads
                    window.window.adHelper.manageSyncAds($('#page-video aside .syncAdWrapper'), []);
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
                if(!cvpInAds && !window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector)){
                    window.turnerVideoPageObj.hideSyncAdInTray(); // We can hide because we can assume we have DE ads
                    window.turnerVideoPageObj.showReloadingAds();
                    window.turnerVideoPageObj.resetBackGroundSkin();
                    window.window.adHelper.loadAds2($thisPane, 'onShow');
                }
                //Turn on 
                turnerVideo.watchResize(1000);

                window.turnerVideoPageObj.locateFreewheelSyncAd();
            });
        },
        initAside: function() {
            $('#page-video aside').addClass('open');
            $('#page-video aside a[paneid="pane-info"]').addClass('active');
            $('#page-video aside #pane-info').show();
            $('#page-video .player-wrapper').addClass('railopen');
        },
        stopAdInTrayReloader: function() {
            if(window.turnerVideoPageObj.adInTrayTimerId){
                clearInterval(window.turnerVideoPageObj.adInTrayTimerId);
                delete window.turnerVideoPageObj.adInTrayTimerId;
            }
        },
        startAdInTrayReloader: function() {
            //Load ad right away when there is no preroll ad in tray's selected pane
            if(window.turnerVideoPageObj.isTrayOpen() && window.turnerVideoPageObj.firstSyncAdShown !== true){
                window.turnerVideoPageObj.adInTrayReloader();
            }
            if(window.turnerVideoPageObj.isTrayOpen() && !cvpInAds && typeof(window.turnerVideoPageObj.adInTrayTimerId) === "undefined"){
                window.turnerVideoPageObj.adInTrayTimerId = setInterval(function(){
                    if(turnerVideo.visible){
                        window.turnerVideoPageObj.adInTrayReloader();
                    }
                }, 120000); // Every two minutes
            }

        },
        adInTrayReloader: function(){
            var $panel = $('#page-video aside'),
                $thisPane = $panel.find('#' + this.currentTrayPaneId);
            
            if(!window.turnerVideoPageObj.hasBackgroundImage(turnerVideo.videoSkinSelector)){
                this.hideSyncAdInTray();
                this.showReloadingAds();
                window.adHelper.loadAds2($thisPane.find("." + window.adHelper.reloadingAdClass), 'onPoll', '&pageload=sync_ref');
            }
            
        },
        isTrayOpen: function(){
            return $('#page-video .player-wrapper').hasClass('railopen');
        },
        showReloadingAds: function(){
            $('#page-video aside .' + window.adHelper.reloadingAdClass).show();
        },
        hideReloadingAds: function(){
            $('#page-video aside .' + window.adHelper.reloadingAdClass).hide();
        },
        showSyncAdInTray: function(){
            $('#page-video aside .syncAdWrapper').show();
        },
        hideSyncAdInTray: function(){
            $('#page-video aside .syncAdWrapper').hide();
        },
        locateFreewheelSyncAd: function(){
            var $currentTray = $('#page-video aside #' + window.turnerVideoPageObj.currentTrayPaneId),
                freewheelDEAdLocationPosition = $currentTray.find('.freewheelDEAdLocation').position(),
                freewheelYOffset = '88px';
            if(freewheelDEAdLocationPosition){
                freewheelYOffset = freewheelDEAdLocationPosition.top;
            }
            $('#page-video aside .syncAdWrapper').css({ top: freewheelYOffset+'px' });
        },
        getBackgroundImage: function(videoSkinSelector){
            var bg_url = $(videoSkinSelector).css('background-image'),
                backgroundImage = '';
            // ^ Either "none" or url("...urlhere..")
            bg_url = /^url\((['"]?)(.*)\1\)$/.exec(bg_url);
            if(bg_url && bg_url[2].length > 5){
                backgroundImage = bg_url[2];
            }
            return backgroundImage;
        },
        hasBackgroundImage: function(videoSkinSelector){
            var backgroundImage = this.getBackgroundImage(videoSkinSelector),
                itHasBackgroundImage = (backgroundImage)?true:false;
            return itHasBackgroundImage;
        },
        resetBackGroundSkin: function(){
            // turnerVideo.watchResize(1500); need to be called with this function.  Since this function is called already in the places this is called
            // it needs to be called outside this function
            $(turnerVideo.videoSkinSelector).css("background-image", "none");
            $('#leftclick, #rightclick').html('');
        }
    };

    if (!isMobile) {
        setTimeout(function() {
            loadSplashData(true);
        }, 2000);
    }
}(jQuery));
}

/*
     FILE ARCHIVED ON 17:29:33 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.705
  load_resource: 101.898
  PetaboxLoader3.resolve: 49.107
  PetaboxLoader3.datanode: 27.243
*/