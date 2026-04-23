var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
window.onShowOverlayError = function(img) {
    if ($(img).attr('invalid') === "1") {
        return;
    }
    $(img).attr('invalid', "1");
    var title = $(img).closest('.carousel-row-item').find('.title span').text();
    if (title === '') {
        title = $(img).closest('.carousel-row-item').find('.text-wrapper .title').text();
    }
    //$(img).attr('src', '../images/no-image.gif');
    $(img).attr('src', 'https://web.archive.org/web/20141231172937/http://placehold.it/640x360/000000&text=' + title);
};


/**
 * @class Tn
 */
$.extend(Tn, {

    playlistsOnShowPage: {},
    showsByNameData: {},
    /* Convert the duration of a video from seconds to a display format or empty if blank or -1 */
    formatDuration: function(durationSecs, type){
        if(durationSecs !== durationSecs){
            return '';
        }
        var durationMins = "";
        var timeStr = "";
        type = typeof(type) === 'undefined' ? '' : type;
        if (durationSecs !== null && durationSecs !== "" && durationSecs !== "-1"){
            if(durationSecs < 30){
                durationMins = durationSecs;
                timeStr = type === 'small' ? 'secs' : 'seconds';
            } else {
                var secsRemaining = durationSecs%60;
                if(secsRemaining < 30){
                    durationMins = Math.floor(durationSecs/60);
                } else {
                    durationMins = Math.ceil(durationSecs/60);
                }
                if(durationMins === 1){
                    timeStr = type === 'small' ? 'min' : 'minute';
                } else {
                    timeStr = type === 'small' ? 'mins' : 'minutes';
                }
            }
        }
        return durationMins + ' ' + timeStr;

    },

    managedAdItems: $('<div id="adManagedItems" class="tn-hidden"></div>'),

    /**
     * When the width is smaller than 900 banner ads will not fit and be shown
     */
    widthToStopShowingAdsOnShowPage: 900,

    /**
     * Updates the progress for all of the buttons in the input jQuery selector
     * @param  {Object} selector The jQuery selector
     */
    updateCanvasProgress: function(selector) {
        selector.each(function() {
            var but = $(this);
            var titleId = but.attr('data-id');

            // Make sure it's a button we're tracking
            if (!titleId || titleId.length === 0) {
                return;
            }

            // Get the progress of this button
            var progress = 0, history = Tn.Users.getPref('videoHistory', {});
            if (history[titleId]) {
                progress = history[titleId].pg || 0;
            }
            progress = parseInt(progress, 10);

            var isSmall = but.hasClass('sm');
            var size = isSmall ? 40 : 74;

            this.width = size;//but.parent().width()*0.3;
            this.height = size;//but.parent().width()*0.3;
            but.width(this.width).height(this.height);
            //but.css('margin', '-' + this.height/2 + 'px 0px 0px -' + this.width/2 + 'px');

            var ctx = this.getContext("2d");
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.webkitImageSmoothingEnabled = true;

            var radius = but.width() / 2;
            var bgcol = '#ffffff';
            var tr = radius * 0.33;

            ctx.shadowBlur = isSmall ? 4 : 8;
            ctx.shadowColor = "black";

            ctx.fillStyle = bgcol;
            ctx.lineWidth = 1;
            ctx.strokeStyle = bgcol;
            ctx.beginPath();
            ctx.moveTo(tr * 0.25 + radius - tr, radius - tr);
            ctx.lineTo(tr * 0.25 + radius + tr, radius);
            ctx.lineTo(tr * 0.25 + radius - tr, radius + tr);
            ctx.closePath();
            ctx.fill();

            var lw = isSmall ? 2 : 4;
            ctx.lineWidth = lw;
            ctx.strokeStyle = bgcol;
            ctx.translate(radius,radius);
            ctx.rotate(-Math.PI/2);
            ctx.beginPath();
            ctx.arc(0, 0, radius - lw - ctx.shadowBlur/2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            ctx.arc(0, 0, radius - lw - ctx.shadowBlur/2, 0, progress * (2 * Math.PI) / 100);
            ctx.stroke();
        });
    },

    /**
     * Does a global update on all play buttons to show their current progress
     * @return {[type]} [description]
     */
    updateAllProgress: function() {

        Tn.updateCanvasProgress($('canvas.playbut'));
        $('div.playbut').each(function() {
            var but = $(this);
            var titleId = but.attr('data-id');

            // Make sure it's a button we're tracking
            if (!titleId || titleId.length === 0) {
                return;
            }

            var small = but.hasClass('sm');
            var style = Tn.buildProgressStylePosition(titleId, small);
            but.css('background-position', style);
        });
    },

    /**
     * Returns the progress offset as a background style to show the right progress string
     * @param  {String} titleId The id of the title in question
     * @param  {boolean} small  If true, will use the 34x34 progress icon sizes
     */
    buildProgressStyle: function(titleId, small) {
        var style = Tn.buildProgressStylePosition(titleId, small);
        return ' style="background-position:' + style + '" ';
    },

    buildProgressStylePosition: function(titleId, small) {
        // Calculate the progress inline, to account for the preference which may come after the page is loaded
        var progress = 0;
        var history = Tn.Users.getPref('videoHistory', {});
        if (history[titleId]) {
            progress = history[titleId].pg || 0;
        } else {
            progress = 0;
        }
        progress = parseInt(progress, 10);

        var bx = progress % 10,
            by = parseInt(progress / 10, 10);

        if (bx === 9 && by === 9 && progress < 100) {
            bx = 8;
        }
        if (progress >= 100) {
            bx = 9;
            by = 9;
        }

        var sz = 66,
            offset = 0;
        if (small) {
            sz = 34;
            offset = 660;
        }
        return Tn.fm('-{0}px -{1}px', bx * sz, offset + by * sz);
    },

    /**
     * Given the page data, will parse the carousel data into carousels and their row headers
     * @param  {Object} pageData  jQuery object containing the DOM
     * @param  {Array} carousels The carousel row of items
     * @param  {Array} rowHdr    The row header result array
     */
    parseShowCarousel: function(pageData, carousels, rowHdr) {
        var w = $(window).width(),
            videoRe = new RegExp("/videos/([^/]*)/");
        // we are passing in the onlyPhones boolean
        var useRetinaImg = window.tnVars.isRetinaScreen &&
            !(window.tnVars.isAndroid ||
            window.tnVars.isIPhone ||
            window.tnVars.isIPod ||
            window.tnVars.isIPad) ? true : false;

        pageData.each(function() {
            var row = [];
            $(this).find('div.row-hdr').each(function() {
                var hdr = $(this);
                var epAvail = hdr.children('p[data-id="num-full-eps-avail"]').attr('data-value');
                var episodeString = (epAvail === '1') ? 'Episode' : 'Episodes';
                var epAvailText = epAvail === '0' ? '' : epAvail + ' ' + episodeString + ' Available';
                var epAvailTextClass = epAvailText === '' ? 'tn-hidden' : '';

                rowHdr.push({
                    showTitle: hdr.children('h2[data-id="show-title"]').text(),
                    showRatings: hdr.children('p[data-id="show-ratings"]').text(),
                    numFullEpsAvail: epAvailText,
                    epAvailTextClass: epAvailTextClass,
                    teaser: hdr.children('p[data-id="teaser"]').text(),

                    learnMoreHref: hdr.children('a[data-id="learn-more"]').attr('href')
                });
            });

            var showTitle;
            $.each(rowHdr, function() {
                showTitle = this.showTitle;
            });

            var sText = w < 500 ? 'S' : 'Season ';
            var eText = w < 500 ? 'E' : 'Episode ';
            var shortsText = 'S';
            var shorteText = 'E';

            $(this).find('div.item').each(function() {
                var item = $(this),
                    itemVars = item.children('span[data-id="vars"]'),
                    isSpotlight = item.hasClass('spotlight') ? true : false,
                    $theAdHTML = item.children('div[data-ad-wrapper]'),
                    theAdHTML = $theAdHTML.length ? $theAdHTML[0].outerHTML : '',
                    theAdParameters = $theAdHTML.length && $theAdHTML.data('ad-parameters') ? $theAdHTML.data('ad-parameters') : {},
                    playable = itemVars.attr('isPlayable') === 'true' ? true : false,
                    //playlistSeriesName = itemVars.attr('playlistSeriesName') ? itemVars.attr('playlistSeriesName') : '', // Available in shows/byName
                    isTileLinkable = itemVars.attr('isTileLinkable') === 'true' ? true : false,
                    devOnlyFromCMA = itemVars.attr('devOnly') === 'yes' ? true : false,
                    //duration = (parseInt(item.children('[data-id="duration"]').text(), 10) / 60),
                    duration = parseInt(item.children('[data-id="duration"]').text(), 10),
                    availExpireHover = itemVars.attr("availExpireHover"),
                    footerClass = availExpireHover.length === 0 ? 'tn-hidden' : '',
                    epinfo = sText + item.children('[data-id="season"]').text() + ' | ' + eText + item.children('[data-id="ep"]').text(),
                    epinfoUPNEXT  = shortsText + item.children('[data-id="season"]').text() + ' | ' + shorteText + item.children('[data-id="ep"]').text(),
                    contentTypeId = parseInt(itemVars.attr('contentTypeId'), 10),
                    contentTypeName = itemVars.attr('contentTypeName'),
                    tvRating = itemVars.attr('showRating'),
                    videoLink = item.children('[data-id="video-href"]').attr("href"),
                    epInfoLink = item.children('[data-id="ep-info-href"]').attr("href"),
                    isInPlaylist = (itemVars.attr('isInPlaylist') === 'true' && videoLink.indexOf('/videos/') > -1)? true : false,
                    playlistSeriesName = '',
                    imgSrc = item.children('[data-id="ep-img"]').attr("data-standard"),
                    hideOverlayClass = '',
                    contentId = itemVars.attr("contentid"),
                    description = item.children('[data-id="ep-descr"]').text();
                
                description = (typeof(description) == 'string')?description.trim():'';
                epInfoLink = (typeof(epInfoLink) == 'string')?epInfoLink.trim():'';

                if(devOnlyFromCMA && !Tn.devOnlyFromBrowser){
                    return true; // skip this one
                }

                if(isInPlaylist){
                    var aPlaylistSeriesMatch = videoLink.match('/videos/([^/]*)/');
                    if(aPlaylistSeriesMatch && typeof(aPlaylistSeriesMatch) === 'object' && aPlaylistSeriesMatch.length > 0 ){
                        playlistSeriesName = aPlaylistSeriesMatch[1];
                    } else {
                        console.log('Error: should not get here');
                    }
                }

                if (useRetinaImg) {
                    if (item.children('[data-id="ep-img"]').attr("data-retina") !== '') {
                        imgSrc = item.children('[data-id="ep-img"]').attr("data-retina");
                    }
                }
                
                var videoContentTypeId = parseInt(item.children('[data-id="videoContentTypeId"]').text(),10);
                //var fullEpisodeContentTypeId = parseInt(item.children('[data-id="fullEpisodeContentTypeId"]').text(),10);
                
                // this is testing to see if it is a clip
                if (contentTypeId === videoContentTypeId) {
                    // currently in the feed for clips the prettyURL and prettyVideoUrl fields have the same value
                    epInfoLink = epInfoLink.replace('/videos/','/shows/');
                    epinfo = item.children('[data-id="title"]').text();
                    epinfoUPNEXT = item.children('[data-id="title"]').text();
                } else if(contentTypeId === 549){
                    // this is external video
                    hideOverlayClass = 'tn-hidden';
                    epinfo = item.children('[data-id="title"]').text();
                    playable = true;
                } else if(contentTypeId === 202){  // this is a teaser
                    if(videoRe.test(videoLink)){ 
                        epinfo = item.children('[data-id="title"]').text();
                        if(!(epInfoLink) || !(description)){
                            hideOverlayClass = 'tn-hidden';
                        }
                    }
                    duration = ''; // Blank out the duration since its not available
                }
                //console.log("contentTypeId: " + contentTypeId);

                if (duration < 0) {
                    duration = 0;
                }
                //var durationTxt = duration.toFixed(2) + " minutes";
                //var durationTxt = Math.ceil(duration) + " minutes";
                var durationTxt = Tn.formatDuration(duration);
                var notPlayableClass = '';
                if (!playable) {
                    durationTxt = "";
                    notPlayableClass = 'tn-hidden';
                }
                if (w > Tn.widthToStopShowingAdsOnShowPage || theAdParameters.tileHeightLimit === undefined) {
                    row.push({
                        isSpotlight: isSpotlight,
                        contentid: contentId,
                        titleid: itemVars.attr("titleid"),
                        playable: playable,
                        isPlayableClass: playable ? '' : 'hide',
                        isInPlaylist: isInPlaylist,
                        playlistSeriesName: playlistSeriesName,
                        isTileLinkableClass: isTileLinkable ? '' : 'hide',
                        contentTypeId: contentTypeId,
                        contentTypeName: contentTypeName,
                        tvRating: tvRating,
                        origPremiereDt: itemVars.attr('origPremiereDt') !== '' ? 'Airs ' + itemVars.attr('origPremiereDt') : itemVars.attr('origPremiereDt'),
                        availExpire: itemVars.attr("availExpire"),
                        availExpireHover: availExpireHover,
                        footerClass: footerClass,
                        airOn: itemVars.attr("airOn"),
                        blurb: description,
                        showTitle: showTitle,
                        alt: showTitle,
                        epinfo: epinfo,
                        epinfoUPNEXT : epinfoUPNEXT,
                        epinfoPLUS: epinfoUPNEXT + " " + '<span class="smallRating">' + " " + tvRating + '</span>',
                        title: item.children('[data-id="title"]').text(),
                        imgSrc: imgSrc,
                        duration: durationTxt,
                        epInfoLink: epInfoLink,
                        videoLink: videoLink,
                        notPlayableClass: notPlayableClass,
                        hideOverlayClass: hideOverlayClass,
                        theAdHTML: theAdHTML,
                        theAdParameters: theAdParameters
                    });
                }
            });
            carousels.push(row);
            $(this).remove();
        });
    },

    /**
     * Fetches the carousel data for shows and returns it back into the callback method
     */
    getCarouselData: function(callback, hideSplash) {
        if (Tn.showData) {
            callback(Tn.showData.carousels, Tn.showData.rowHdr);
            return;
        }
        if (!hideSplash) {
            Tn.showPjaxSplash(true);
        }
        $.ajax({
            url: '/shows/',
            dataType: 'text'
        }).done(function(data) {
            data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
            var page = $(data).find('#page-shows .carousel');
            if (page.length === 0) {
                Tn.alert("Show page not found");
            } else {
                Tn.showData = {
                    carousels: [],
                    rowHdr: []
                };
                Tn.parseShowCarousel(page, Tn.showData.carousels, Tn.showData.rowHdr);
                callback(Tn.showData.carousels, Tn.showData.rowHdr);
            }
        }).fail(function() {
            Tn.alert("Failed to load show page");
        }).always(function() {
            Tn.showPjaxSplash(false);
        });
    },

    /**
     * Given the page data, will parse the carousel data into carousels and their row headers
     * @param  {Object} pageData  jQuery object containing the DOM
     * @param  {Array} carousels The carousel row of items
     * @param  {Array} rowHdr    The row header result array
     */
    parseShowsByNameCarousel: function(pageData, carousels, playlistSeries, isPlaylist) {
        function getAttribute(attributeObj, attributeName){
            var attribute, returnValue = '', attributeArr;
            if(attributeObj && typeof(attributeObj) == 'object'){
                attributeArr = attributeObj.attribute;
            }

            if(attributeArr && $.isArray(attributeArr)){
                for (var i = 0; i < attributeArr.length; i++) {
                    attribute = attributeArr[i];
                    if(typeof(attribute) === 'object' && attribute.name === attributeName){
                        returnValue = attribute.value;
                    }
                }
            }
            return returnValue;
        }
        function getTileItem(pageData, clipObj, playlistSeriesName, isInPlaylist) {
            //console.log('getTileItem');
            //
            var w = $(window).width();

            var sText = w < 500 ? 'S' : 'Season ';
            var eText = w < 500 ? 'E' : 'Episode ';
            var shortsText = 'S';
            var shorteText = 'E';

            var duration = parseInt(clipObj.duration, 10),
                epinfo = '', epinfoS = '', epinfoE = '', epinfoUPNEXTS = '', epinfoUPNEXTE = '', epinfoSubstr = '', epinfoUPNEXT  = '',
                tvRating = (pageData.tvRating)?pageData.tvRating:'',
                sponsoredNext = (typeof(pageData.series) === 'object')?getAttribute(pageData.series.attributes, 'sponsoredNext'):'',
                //isInPlaylist = (sponsoredNext && sponsoredNext.length > 0)?true:false,
                videoLink = clipObj.prettyVideoUrl,
                epInfoLink = clipObj.prettyURL,
                imgSrc,
                imgTmp1 = '', imgTmp2 = '', imgTmp3 = '',
                findImageArr = [];

            if(isInPlaylist){
                var plRegx = new RegExp('\/videos\/[^/]*\/');
                if(plRegx.test(videoLink)){
                    videoLink = videoLink.replace(plRegx, '/videos/' + playlistSeriesName + '/');
                } else {
                    console.log('Error: should not get here');
                    playlistSeriesName = '';
                }
            } else {
                playlistSeriesName = '';
            }

            // Extra work until the feeds are sorted out
            if($.isArray(clipObj.images) && typeof(pageData.series) === 'object' && $.isArray(pageData.series.images)){
                findImageArr = clipObj.images.concat(pageData.series.images);
            } else if($.isArray(clipObj.images)){
                findImageArr = clipObj.images;
            } else if(typeof(pageData.series) === 'object' && $.isArray(pageData.series.images)){
                findImageArr = pageData.series.images;
            }

            var doneHere = false;
            for (var i = 0; i < findImageArr.length && doneHere === false; i++) {
                var imageObj = findImageArr[i];

                if(imageObj.typeName == "445x250"){
                    imgTmp1 = imageObj.srcUrl;
                    doneHere = true;
                } else if(imageObj.typeName == "450x252"){
                    imgTmp2 = imageObj.srcUrl;
                    doneHere = true;
                } else if(typeof(imageObj.typeName) === 'string' && imageObj.typeName.length > 3 ){
                    var xDim = imageObj.typeName.substring(0,imageObj.typeName.indexOf('x'));
                    if(xDim.length === 3 && xDim.charAt(0) =='4'){
                        imgTmp3 = imageObj.srcUrl;
                        doneHere = true;
                    }
                }
            }
            imgSrc = (imgTmp1.length > 0)?imgTmp1:(imgTmp2.length > 0)?imgTmp2:(imgTmp3.length > 0)?imgTmp3:'';
            if(imgSrc.length > 0 && imgSrc.indexOf('http://') !== 0 && imgSrc.indexOf('https://') !== 0){
                var tntHostnameRE =  new RegExp("tntdrama.com"),
                    tbsHostnameRE = new RegExp("tbs.com"),
                    myHostName = window.location.hostname,
                    cdn = '';
            
                if (tntHostnameRE.test(myHostName)) {
                    cdn = 'https://web.archive.org/web/20141231172937/http://i.cdn.turner.com/v5cache/TNT/Images/';
                } else if(tntHostnameRE.test(myHostName)) {
                    cdn = 'https://web.archive.org/web/20141231172937/http://i.cdn.turner.com/v5cache/TBS/Images/';
                }
                imgSrc = cdn + imgSrc;
            
            }
            if(clipObj.seasonNo.length > 0 ){
                epinfoS = sText + clipObj.seasonNo;
                epinfoUPNEXTS  = shortsText + clipObj.seasonNo;
            }
            if(clipObj.episodeNo.length > 0 ){
                epinfoE = eText + clipObj.episodeNo;
                epinfoUPNEXTE = shorteText + clipObj.episodeNo;
            }
            if(clipObj.seasonNo.length > 0 && clipObj.episodeNo.length > 0){
                epinfoSubstr = ' | ';
            }
            epinfo = epinfoS + epinfoSubstr + epinfoE;
            epinfoUPNEXT = epinfoUPNEXTS + epinfoSubstr + epinfoUPNEXTE;
            

            // currently in the feed for clips the prettyURL and prettyVideoUrl fields have the same value
            epInfoLink = epInfoLink.replace('/videos/','/shows/');
            epinfo = ''; // clipObj.showTitle; blank it out.  showTitle appears twice on up next
            epinfoUPNEXT = clipObj.showTitle;
            //console.log("contentTypeId: " + contentTypeId);

            if (duration < 0) {
                duration = 0;
            }
            //var durationTxt = duration.toFixed(2) + " minutes";
            //var durationTxt = Math.ceil(duration) + " minutes";
            var durationTxt = Tn.formatDuration(duration);
            
            return {
                isSpotlight: false,
                contentid: clipObj.contentId,
                titleid: -1,
                playable: true,
                isPlayableClass: '',
                isInPlaylist: isInPlaylist,
                playlistSeriesName: playlistSeriesName,
                isTileLinkableClass: 'hide',
                contentTypeId: 200,
                contentTypeName: 'Video',
                tvRating: tvRating,
                origPremiereDt: '',
                availExpire: '',
                availExpireHover: '',
                footerClass: 'tn-hidden',
                nextUpPlaylist: sponsoredNext,
                airOn: '',
                blurb: clipObj.clipBlurbShort,
                showTitle: clipObj.showTitle,
                alt: clipObj.showTitle,
                epinfo: epinfo,
                epinfoUPNEXT : epinfoUPNEXT,
                epinfoPLUS: '', // epinfoUPNEXT + " " + '<span class="smallRating">' + " " + tvRating + '</span>', // blank it out.  showTitle appears twice on up next
                title: clipObj.showTitle,
                imgSrc: imgSrc,
                duration: durationTxt,
                epInfoLink: epInfoLink,
                videoLink: videoLink,
                notPlayableClass: '',
                hideOverlayClass: '',
                theAdHTML: '',
                theAdParameters: {}
            };
        }





        var w = $(window).width();
        // we are passing in the onlyPhones boolean
        var useRetinaImg = window.tnVars.isRetinaScreen &&
            !(window.tnVars.isAndroid ||
            window.tnVars.isIPhone ||
            window.tnVars.isIPod ||
            window.tnVars.isIPad) ? true : false;


        if(typeof(pageData) == 'object' && pageData.clips && pageData.clips.length > 0) {
            for (var i = 0; i < pageData.clips.length; i++) {
                carousels.push(getTileItem(pageData, pageData.clips[i], playlistSeries, isPlaylist));
            }
        }
    },

    /**
     * Fetches the carousel data for movies and returns it back into the callback method
     */
    getShowsByNameCarouselData: function(callback, series4VideoPlaying, isPlaylist) {
        if (Tn.showsByNameData[series4VideoPlaying]) {
            callback(Tn.showsByNameData[series4VideoPlaying].carousels, []);
            return;
        }
        // Fetch the show via a JSON call
        $.getJSON('/service/shows/byName/' + series4VideoPlaying + '.json').done(function(show) {
        //$.getJSON('/sponsored-playlist.json').done(function(show) {
                Tn.showsByNameData[series4VideoPlaying] = {
                    carousels: [],
                    rowHdr: []
                };
                Tn.parseShowsByNameCarousel(show, Tn.showsByNameData[series4VideoPlaying].carousels, series4VideoPlaying, isPlaylist);
                callback(Tn.showsByNameData[series4VideoPlaying].carousels, []);
            }
        ).fail(function() {
            Tn.alert("Failed to load showbyname page");
            Tn.showsByNameData[series4VideoPlaying] = {};
        });
    },
    getPlaylistExpandedCarouselData: function(callback) {
        //Tn.showData must be defined
        if (Tn.showDataWithPlaylists) {
            callback(Tn.showDataWithPlaylists.carousels, Tn.showData.rowHdr);
            return;
        }
        var dataCarouselsWithPlaylists = [];
        //Tn.showData must be defined
        if(Tn.showData && Tn.showData.carousels){
            dataCarouselsWithPlaylists = Tn.showData.carousels.slice(0);
        }
        if(dataCarouselsWithPlaylists.length > 0){
            for (var i = 0; i < dataCarouselsWithPlaylists.length; i++) {
                var theCarousel = dataCarouselsWithPlaylists[i];
                for (var j = 0; j < theCarousel.length; j++) {
                    var theEp = theCarousel[j];
                    if(theEp.isInPlaylist && typeof(theEp.playlistSeriesName) ==='undefined'){
                        console.log('Error: why did we get here?');
                        theEp.playlistSeriesName = '';
                    }
                    if(theEp.isInPlaylist && theEp.playlistSeriesName.length > 0){ //theEp.playlistSeriesName has to be set in the shows/byName service
                        Tn.playlistsOnShowPage[theEp.playlistSeriesName] = 1;
                        if (Tn.showsByNameData[theEp.playlistSeriesName]) {
                            if(Tn.showsByNameData[theEp.playlistSeriesName].carousels && Tn.showsByNameData[theEp.playlistSeriesName].carousels.length > 0){
                                var playlistEp,
                                    showsLandingEpIsInByNameplaylist = false,
                                    playlistCID,
                                    theEpVideoLink = (theEp.videoLink)?theEp.videoLink:'';
                                for (var cIndex = 0, cLength = Tn.showsByNameData[theEp.playlistSeriesName].carousels.length; cIndex < cLength; cIndex++) {
                                    playlistEp = Tn.showsByNameData[theEp.playlistSeriesName].carousels[cIndex];
                                    playlistCID = (playlistEp.contentid)?playlistEp.contentid:'wontmatchjhthis';
                                    if(theEpVideoLink.indexOf(playlistCID) > -1){
                                        showsLandingEpIsInByNameplaylist = true;
                                    }
                                    theCarousel.splice(j, 0, $.extend({}, playlistEp));
                                    j++; //theCarousel is now longer so skip the one added
                                }
                                if(showsLandingEpIsInByNameplaylist){
                                    theCarousel.splice(j,1); // remove theEp since it is in the playlist
                                }
                            } //else {
                            //     console.log('showsByNameData is empty');
                            //     theCarousel.splice(j, 0, $.extend({}, playlistEp));
                            //     j++; //theCarousel is now longer so skip the one added
                            // }
                        } else {

                            Tn.getShowsByNameCarouselData(function(){
                                Tn.getPlaylistExpandedCarouselData(callback);
                            }, theEp.playlistSeriesName, theEp.isInPlaylist);
                            return; // Try again after we have the playlist data
                        }
                    }
                }
            }
        }
        Tn.showDataWithPlaylists  = {
            carousels: Tn.deDupList(dataCarouselsWithPlaylists),
            rowHdr: []
        };
        callback(Tn.showDataWithPlaylists.carousels, Tn.showData.rowHdr);
    },
    deDupList: function(carousels, seenObj) {
        var seen = (seenObj)?seenObj:{}, carousel;
        for (var i = 0; i < carousels.length; i++) {
            carousel = carousels[i];
            for (var j = 0; j < carousel.length; j++) {
                var item = carousel[j], 
                    vidUrl = item.videoLink;
                if(seen[vidUrl] === true){
                    carousel.splice(j, 1);
                    j--; // removed one so decrement the counter
                }
                seen[vidUrl] = true;
            }


            // carousel = carousel.filter(function(item) {
            //     var vidUrl = item.videoLink;
            //     return seen.hasOwnProperty(vidUrl) ? false : (seen[vidUrl] = true);
            // });
        }
        return carousels;
    },
    preloadData: function(){
        if (!Tn.movieData && Tn.videoType =='movie') {
            Tn.getMovieCarouselData(Tn.preloadData, true);
        } else if(!Tn.showData){
            Tn.getCarouselData(Tn.preloadData, true);
        } else if(!Tn.showDataWithPlaylists){ // requires Tn.showData so playlists can be added
            Tn.getPlaylistExpandedCarouselData(Tn.preloadData);
        }else if(Tn.videoPlayingIsSponsored && !Tn.playlistsOnShowPage[Tn.series4VideoPlaying]){ 
            // Requires Tn.showDataWithPlaylists so we know what playlists are on the show page
            // This video might not be on the shows page so we just get the playlist
            if(!Tn.showsByNameData[Tn.series4VideoPlaying] ){
                Tn.getShowsByNameCarouselData(function() {
                    console.log("Carousel data pre-loaded!");
                }, Tn.series4VideoPlaying, true );
            }
        }
    },

    getImageTag: function(){
        return '<img src="{imgSrc}" alt="{alt}" style="width:100%; height:100%;position: relative;"/>';
    },
    /**
     * Initialize a show overlay
     */
    initializeShowOverlay: function(item, data) {
        if (data.isPlaceholder) {
            item.append('<div class="main-content"><img src="https://web.archive.org/web/20141231172937/http://placehold.it/445x250/000000&text=PLACEHOLDER" style="width:100%; height:100%;"></div>');
            return;
        }

        // Update the progress on the play button
        // only clips should use contentId - everyting else uses @titleId or else the save state will not work
        // for clips the titleid in the feed is -1

        //console.log(data.title + ' ' + data.titleid);
        if (data.titleid && (data.titleid === '-1' || data.titleid.length === 0)) {
            data.titleid = data.contentid;
        }
        data.playStyle = Tn.buildProgressStyle(data.titleid, false);

        var htmlTemplate = Tn.getItemHTMLStrHelper(data, {}), 
            text = Tn.fm(htmlTemplate, data);
            
        item.append(text);

        window.tnOverlays.init(item.find('.main-content'));
        Tn.updateCanvasProgress(item.find('canvas.playbut'));
    },
    getItemHTMLStrHelper: function(data, options){
        var htmlTemplate;
        if (data.contentTypeName === 'Ads') {
            htmlTemplate = '<div class="main-content" data-id="{titleid}" data-videohref="">' + 
                '{theAdHTML}' +
            '</div>' +
            '<div class="advertisingimage_top"></div>';
        } else {
            htmlTemplate = '<div class="main-content" data-id="{titleid}" data-videohref="{videoLink}">' +
                '<canvas class="main playbut {isPlayableClass}" data-id="{titleid}" {playStyle}></canvas>';
            if(options.noImage){
                htmlTemplate += '<span class="imgWrapper empty" data-src="{imgSrc}" data-alt="{showTitle} - {title}"></span>';
            } else {
                htmlTemplate += '<span class="imgWrapper" data-src="{imgSrc}" >' + Tn.getImageTag() + '</span>';
            }
            htmlTemplate +=  '{theAdHTML}' + // For 1x1's associate with a tile
                '<div class="caption withleft">' +
                '<div class="showInfoContainer">' +
                    '<span class="showTitle">{showTitle}</span>' +
                    '<span class="epinfo">{epinfo}</span>' +
                '</div>' +
                    '<div class="text-wrapper">' +
                        '<span class="special">{airOn}</span>' +
                        '<span class="availexpire">{availExpire}</span>' +
                    '</div>' +
                '</div>' +
                '<div class="icon-group2 {hideOverlayClass}">' +
                    '<div class="icon plus"></div>' +
                    '<div class="icon info"></div>' +
                '</div>' +
                '<a class="linkable-tile {isTileLinkableClass}" href="{epInfoLink}" target="_blank">&nbsp</a>' +
                '<div class="info-overlay">' +
                    '<div class="icon-group">' +
                        '<div class="icon plus"></div>' +
                        '<div class="icon info" data-href="{epInfoLink}"></div>' +
                        '<div class="icon playbut {isPlayableClass}"></div>' +
                    '</div>' +
                    '<div class="meta">' +
                        '<div class="above-fold">' +
                            '<div class="title">' +
                                '<span>{title}</span>' +
                            '</div>' +
                            '<div class="specs {notPlayableClass}">' +
                                '<div class="season">' +
                                    '<span></span>' +
                                '</div>' +
                                '<div class="ep">' +
                                    '<span></span>' +
                                '</div>' +
                                '<div class="time left">' +
                                    '<span>{duration}</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="below-fold">' +
                            '<div class="ep-title">' +
                                '<span></span>' +
                            '</div>' +
                            '<div class="blurb truncate-h" style="">' +
                                '{blurb}<div class="more" data-href="{epInfoLink}" style="display: inline;">More...</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="footer {footerClass}">' +
                            '<span class="availexpire">{availExpireHover}</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '</div>';
        }
        return htmlTemplate;
    }

});

$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-shows') {
        return;
    }

    // Page was already shown, so just call an update when the page is shown again
    if (Tn.showsPageInitialized) {
        $('#page-shows').find('.carousel-row-item').removeClass('adshown');
        //$('#page-shows').pageCarousel("resize");
        $('#page-shows').pageCarousel("setYPos");
        return;
    }

    Tn.showsPageInitialized = true;
    var carousels = [];
    var rowHdr = [];
    var pixelsOfRowHdrHorizontal = 687;
    var maxImageSize = 445;
    var bigMargins = 62;
    var smMargins = 25;
    var isWindowScroll = false;
    var bufferH = window.tnVars.isMobile() ? 0 : 2;
    var bufferV = window.tnVars.isMobile() ? 1 : 2;

    //if(window.tnVars.isAndroid && !window.tnVars.isAndroidChrome){
    // for Android phones we want vertical buffer of 2
    //if( window.tnVars.isAndroid && !window.tnVars.isAndroidChrome && !window.tnVars.isAndroidTablet() ){
    if( window.tnVars.isAndroid && !window.tnVars.isAndroidTablet() ){
        bufferV = 2;
    }
    // for tablets we want vertical buffer of 1
    if( window.tnVars.isIPad || window.tnVars.isAndroidTablet() ){
        bufferV = 1;
    }

    // for ios and android browser...we make these all window scroll....chrome app can stay in overflow scroll
    //if(window.tnVars.isIOS() || (window.tnVars.isAndroid && !window.tnVars.isAndroidChrome) ){
    if(window.tnVars.isIOS() || window.tnVars.isAndroid ){
        $('#page-shows').addClass('is-window-scroll');
        isWindowScroll = true;
    }


    //TODO: Can we set Tn.showData here as well?
    Tn.parseShowCarousel($('#page-shows .carousel'), carousels, rowHdr);

    $('#page-shows').pageCarousel({
        itemCls: 'content-wrapper',
        removeKeyHTMLOnDestroy: true,
        carousels: carousels,
        rowHdr: rowHdr,
        isWindowScroll: isWindowScroll,
        // These values will be recalculated on screen resize to align everything
        tileWidth: 445,
        tileHeight: 250,
        canHaveCarouselAds: true,
        bufferH: bufferH,
        bufferV: bufferV,
        useVerticalSnap: window.tnVars.isMobile() ? true : false,
        //useVerticalSnap: true,

        // Called whenever the window is resized, to give you a change to position everything
        onResize: function() {
            var width = $(window).width(),
                cWidth = width,
                height,
                items = 1;

            this.windowWidth = width;
            this.rowRightAdjustment = bigMargins;

            if (width > Tn.widthToStopShowingAdsOnShowPage) {
                height = 250;
                width = 445;
                this.canHaveCarouselAds = true;
            } else {
                this.canHaveCarouselAds = false;
                if (width > 770) {
                    items = 1.2;
                } else if (width <= pixelsOfRowHdrHorizontal && width > 570) {
                    // this is where the row header changes
                    items = 1.6;
                } else if (width <= 570 && width > 440) {
                    // this is where the row header changes
                    items = 1.2;
                } else {
                    items = 1;
                }

                if (items === 1) {
                    this.rowRightAdjustment = smMargins;
                }

                // if we're over our media query breakpoint, then subtract the header width
                // we are subtracting some extra width to allow space on the right side for arrows
                if (width > pixelsOfRowHdrHorizontal) {
                    width -= 328;
                }



                // Calculate the width of an item
                // width = parseInt((width - 5) / items, 10);
                // Calculate the width of an item
                //width = parseInt((width - 5) / items, 10);
                // here we are trying to size the images so when the last image is fully visible on the right, the left image is correctly
                // hidden by the arrow on the left
                width = parseInt((width - 5) / items, 10);

                if (cWidth > maxImageSize && cWidth >= (maxImageSize + this.rowRightAdjustment * 2)) {
                    width = width;
                } else if (cWidth > (maxImageSize + smMargins * 2) && cWidth < maxImageSize + bigMargins * 2) {
                    // if screen width is greater that max image plus the small margins and
                    // screen width is less that max image plus big margins
                    //width = maxImageSize;
                    width = cWidth - bigMargins * 2 >= maxImageSize ? maxImageSize : cWidth - bigMargins * 2;
                } else if (cWidth <= maxImageSize + smMargins * 2) {
                    // if the screen width is less= max image plus small margins
                    width = cWidth - smMargins * 2;
                } else if (cWidth <= maxImageSize) {
                    // if the screen width is less than 445, we use the screen width minus the small margins
                    width = cWidth - smMargins * 2;
                }

                // Calculate the height of an item
                height = parseInt(width * 250 / 445, 10);
                if (height < 32) {
                    height = 32;
                }
                if (width < 32) {
                    width = 32;
                }
            }

            // Calculate the tile width and height
            this.tileWidth = width;
            this.tileHeight = height;
            //this.items = items;
        },

        // Called to grab the size of an item in the carousel
        // If you have ads in the carousel, you have to specify the size of the ad, instead of the carousel dimensions
        getItemDimensions: function(carouselIndex, tileIndex, carouselData) { /*carousel, index, data*/
            var tileWidth, tileHeight , tileData , theAdParameters;
            try{
                tileWidth = this.tileWidth;
                tileHeight = this.tileHeight;
                tileData = carouselData[tileIndex];
                theAdParameters = tileData.theAdParameters;
            } catch(e){
                console.log(e);
            }
            if (tileData.contentTypeName === 'Ads') {
                if ((theAdParameters && theAdParameters.tileHeightLimit && theAdParameters.tileHeightLimit > tileHeight) ||
                    (theAdParameters && theAdParameters.tileWidthLimit && theAdParameters.tileWidthLimit > tileWidth) ||
                    (theAdParameters && theAdParameters.iHaveEpicAd != 'true')) { // ROS ads won't work because they have the sam domId.  The flag for a bad ad is caught here
                    tileHeight = 1;
                    tileWidth = 1;
                } else if (theAdParameters && theAdParameters.tileWidth && theAdParameters.tileHeight) {
                    tileHeight = theAdParameters.tileHeight;
                    tileWidth = theAdParameters.tileWidth;
                }
            }
            // Stick an ad at position 6
            /*
            if (index === 6) {
                return {
                    w: 120,
                    h: 100
                };
            }
            */
            // Return the responsive tile width and heights
            return {
                w: tileWidth,
                h: tileHeight
            };
        },
        
        getTileDimensions: function(){
            return {
                w: this.tileWidth,
                h: this.tileHeight
            };
        },
        getImageTag: function(){
            return '<img src="{imgSrc}" alt="{alt}" style="width:100%; height:100%;position: relative;"/>';
        },

        // Called when an item is lazily added
        addItem: function(item, index, data) {
            // TODO: This should give a additional smaller sized image for phones or low bandwidth
            if(item.hasClass('isLightWeight')){
                var $imgWrapper = item.find('span.imgWrapper.empty');
                if($imgWrapper.length > 0){
                    setTimeout(function(){
                            $imgWrapper.html(
                                Tn.fm(Tn.getImageTag(), { imgSrc: $imgWrapper.data('src') })
                            );
                    }, 50);
                }
            } else {
                Tn.initializeShowOverlay(item, data);
            }
        },

        /** Called when an item is lazily removed **/
        removeItem: function(item, itemIndex, data, removeKeyHTMLOnDestroy, removeHTMLOnDestroy) {
            window.tnOverlays.destroyTruncate(item);
            // Need to keep ads so sort removeItems that are memory hogs 
            if(removeKeyHTMLOnDestroy && !removeHTMLOnDestroy){
                    item.find('span.imgWrapper').empty().addClass('empty');
                    item.addClass('isLightWeight');
            } else {
                item.empty();
            }
            
        },

        onArrowClick: function(event) {
            event.preventDefault();
            var widget = this.me;
            widget.scrollToPageOffset(this.index, this.offset);
        },
        rowAddedHelper: function(item){
            item.addClass('hideloader');
        },
        rowAdded: function(item, index, carouselData, row) {
            var me = this,
                hdr = Tn.fm([
                '<div class="carousel-row-header showsmeta">',
                '<div class="title">{showTitle}</div>',
                '<div class="ratings">{showRatings}</div>',
                '<div class="blurb {epAvailTextClass}">{numFullEpsAvail}</div>',
                '<div class="blurb">{teaser}</div>',
                '<div class="button"><a class="learnmore" href="{learnMoreHref}">Learn More</a></div>',
                //'<div class="button"><a class="watchlist" href="#">Watchlist</a></div>                                    ',
                //'</div><div class="rowloader show"></div>'
                '</div>'
            ].join(''), rowHdr[index]);

            item.append(hdr);

            item.append('<div class="nav-left nav-slider"></div><div class="nav-right nav-slider"></div>');
            item.append('<div class="shadowwrapper-left"><div class="shadow-left shadowbox"></div></div><div class="shadowwrapper-right"><div class="shadow-right shadowbox"></div></div>');
            item.find('.nav-left').on({
                click: $.proxy(this.onArrowClick, {
                    me: row.widget,
                    index: index,
                    offset: -1
                })
            });
            item.find('.nav-right').on({
                click: $.proxy(this.onArrowClick, {
                    me: row.widget,
                    index: index,
                    offset: 1
                })
            });

            //item.find('a.learnmore').on('click', function(event) {
            item.find('a.learnmore').on('tap', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-generic');
            }).on('click', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-generic');
            });

            me.rowAddedHelper(item);

            // set margins of row header title to be centered <=600 or to 0 if >600 
            adjustTitle(item);
        },

        addCarousalEvents: function($rowEl, meRow, index){
            // This is part of the old rowAdded function 
            var me = this;
            $rowEl.find('.nav-left').on({
                click: $.proxy(me.onArrowClick, {
                    me: meRow.widget,
                    index: index,
                    offset: -1
                })
            });
            $rowEl.find('.nav-right').on({
                click: $.proxy(me.onArrowClick, {
                    me: meRow.widget,
                    index: index,
                    offset: 1
                })
            });

            //$(row).find('a.learnmore').on('click', function(event) {
            $rowEl.find('a.learnmore').on('tap', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-generic');
            }).on('click', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-generic');
            });
        },

        addExtras4CarousalItem: function($rowItemEl){
            window.tnOverlays.init($rowItemEl.find('.main-content'));
            Tn.updateCanvasProgress($rowItemEl.find('canvas.playbut'));
        },

        getExtraCarouselHTML: function(carouselIndex) {
            // This is the old rowAdded function
            var hdr = Tn.fm(
                '<div class="carousel-row-header showsmeta">' +
                '<div class="title">{showTitle}</div>' +
                '<div class="ratings">{showRatings}</div>' +
                '<div class="blurb {epAvailTextClass}">{numFullEpsAvail}</div>' +
                '<div class="blurb">{teaser}</div>' +
                '<div class="button"><a class="learnmore" href="{learnMoreHref}">Learn More</a></div>' +
                //'<div class="button"><a class="watchlist" href="#">Watchlist</a></div>' +
                //'</div><div class="rowloader show"></div>'
                '</div>', rowHdr[carouselIndex]);

            hdr = hdr + '<div class="nav-left nav-slider"></div><div class="nav-right nav-slider"></div>' +
                '<div class="shadowwrapper-left"><div class="shadow-left shadowbox"></div></div><div class="shadowwrapper-right"><div class="shadow-right shadowbox"></div></div>';
            return hdr;
        },

        rowRemoved: function(item) {
            item.removeClass('hideloader');

        },
        onRowResized: function(index, row) {
            //console.error("Row Resized", arguments);
            if (this.windowWidth <= pixelsOfRowHdrHorizontal) {
                row.addClass('horizontal');
            } else {
                row.removeClass('horizontal');
            }
            //console.log('onRowResized');
            //console.log(row);
            // the timeout is here so the row ahs time to finish writing to the page resized before the resizeOverlay is called
            
           
            //setTimeout(function() {
                row.find('.carousel-row-item.active').find('.main-content').each(function() {
                    var item = $(this);
                    //TODO: Can I move this to getItemHTMLStr ?
                    window.tnOverlays.resizeOverlay(item);
                });

            //}, 100);
            
     

            var rHdr = row.find('.carousel-row-header');
            if ($(window).width() <= pixelsOfRowHdrHorizontal) {
                var ht = row.height() + 50;
                row.height(ht);
                rHdr.width(this.windowWidth);
            } else {
                rHdr.width(186);
            }
            // set margins of row header title to be centered <=600 or to 0 if >600 
            adjustTitle(row);

        },

        onRowVisible: function(index, row) {
            // adding this additional width here was causing a huge flicker on desktop when it was trying to scroll to the spotlight
            // index at the end of the row.  it also was adding too much...we don't need this for desktop
            //var rowslider = row.find('.rowslider');
            //var rWidth = rowslider.width();
            //rowslider.width(rWidth + this.rowRightAdjustment);

            var w = $(window).width();
            var rHdr = row.find('.carousel-row-header');
            if (w <= pixelsOfRowHdrHorizontal) {
                // i am not sure where the extra 20 px comes from
                rHdr.width(w - 20);
            } else {
                rHdr.width(186);
            }

            adjustTitle(row);
        },
        onRowItemsAdded: function(row){
            row.find('.rowloader').removeClass('show');
        },
        getItemHTMLStr: function(data) {

            // Update the progress on the play button
            // only clips should use contentId - everyting else uses @titleId or else the save state will not work
            // for clips the titleid in the feed is -1

            //console.log(data.title + ' ' + data.titleid);
            if (data.titleid && (data.titleid === '-1' || data.titleid.length === 0)) {
                data.titleid = data.contentid;
            }
            data.playStyle = Tn.buildProgressStyle(data.titleid, false);

            var htmlTemplate = Tn.getItemHTMLStrHelper(data, { "noImage": true }), 
                text = Tn.fm(htmlTemplate, data);
            return text;
        }
    });

    /**
     * [adjustTitle - vertically center the title in the <600px view]
     * @param  {[type]} hdr [description]
     * @return {[type]}     [description]
     */

    function adjustTitle(row) {
        var thisHdr = row.find('.carousel-row-header');
        var hdrHt = thisHdr.height();
        var ratingsHt = thisHdr.find('.ratings').outerHeight();
        var title = thisHdr.find('.title');
        var titleHt = title.outerHeight();
        if (thisHdr.length > 0) {
            if ($(window).width() <= pixelsOfRowHdrHorizontal) {
                // we are adjusting the margin on the title to vertically center it
                // there could be multiple lines of title
               //title.css('margin-top', (hdrHt - titleHt) / 2).css('margin-bottom', (hdrHt - titleHt) / 2);
               thisHdr.css('padding-top', (hdrHt - titleHt - ratingsHt) / 2).css('padding-bottom', (hdrHt - titleHt - ratingsHt) / 2);
            } else {
                //thisHdr.find('.title').css('margin-top', '0').css('margin-bottom', '0');
                thisHdr.css('padding-top', '10px').css('padding-bottom', '10px');
            }
        }
    }

});

}

/*
     FILE ARCHIVED ON 17:29:37 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:38 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.576
  load_resource: 117.953
  PetaboxLoader3.resolve: 53.418
  PetaboxLoader3.datanode: 37.057
*/