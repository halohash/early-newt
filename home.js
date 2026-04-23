var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
//helper function to handle episode info formatting in the tile
$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-landing') {
        return;
    }

    // Page was already shown, so just call an update when the page is shown again
    if (Tn.landingPageInitialized) {
    	
    	$('#page-landing').find('.carousel-row-item').removeClass('adshown');
        //$('#page-landing').pageCarousel("resize");
        $('#page-landing').pageCarousel("setYPpos");
        return;
    }

    Tn.landingPageInitialized = true;

    function getFormattedEpisodeInfo(seasonNo, epNo, type) {
        var formattedEpisodeInfo = '';
        var seasonTxt = type === 'large' ? 'Season ' : 'S';
        var epTxt = type === 'large' ? 'Episode ' : 'E';
        if (seasonNo !== '') {
            formattedEpisodeInfo += seasonTxt + seasonNo;
            if (epNo !== '') {
                formattedEpisodeInfo += ' | ' + epTxt + epNo;
            }
        } else if (epNo !== '') {
            formattedEpisodeInfo += epTxt + epNo;
        }
        return formattedEpisodeInfo;
    }
    var w = $(window).width();
/*
    function getDurationText(selector, type) {
        var duration = (parseInt(selector, 10) / 60);
        if (isNaN(duration)) {
            return "";
        }
        if (duration <= 0) {
            return "";
        }
        var timeTxt = 'minutes';
        if(type === 'small' && w < 500 ){
            timeTxt = 'mins';
        }
        return Math.ceil(duration) + " " + timeTxt;
    }
*/
    var useRetinaImg = window.tnVars.isRetinaScreen &&
        !( (window.tnVars.isAndroid && !window.tnVars.isAndroidTablet() ) ||
        window.tnVars.isIPhone ||
        window.tnVars.isIPod) ? true : false;

    var carousels = [];
    
    $('#page-landing .carousel').each(function() {
        var row = [];

        $(this).find('div.item').each(function() {
            var item = $(this);
            var itemMain = item.children('[data-id="main"]');
            var mainVars = itemMain.children('span[data-id="vars"]');
            var seconds = item.children('[data-id="secondaries"]').children();
            var sText = w < 500 ? 'S' : 'Season ';
            var eText = w < 500 ? 'E' : 'Episode ';
            // creating season and episode strings here...the divs need to be present even if data is blank
            var seasonNo = typeof(itemMain.children('p[data-id="season"]').text()) !== 'undefined' ? itemMain.children('p[data-id="season"]').text() : '';
            var seasonStr = seasonNo === '' ? '' : sText + seasonNo;
            var episodeNo = typeof(itemMain.children('p[data-id="ep"]').text()) !== 'undefined' ? itemMain.children('p[data-id="ep"]').text() : '';
            var episodeStr = episodeNo === '' ? '' : eText + episodeNo;
            var timeClass = seasonNo.length === 0 && episodeNo.length === 0 ? 'left' : '';
            var seasonClass = seasonNo.length === 0 ? 'tn-hidden' : '';
            var episodeClass = seasonNo.length === 0 ? 'tn-hidden' : '';
            var imgSrc = itemMain.children('img[data-id="img"]').attr("data-standard");
            var theAdHTML = item.children('div[data-ad-wrapper]').html()?item.children('div[data-ad-wrapper]')[0].outerHTML:'';
            var devOnlyFromCMA = mainVars.attr('devOnly') === 'yes' ? true : false;
            //var epInfoSize = $(window).width() < 500 ? 'small' : 'large';
            
            if(devOnlyFromCMA && !Tn.devOnlyFromBrowser){
                return true; // skip this one
            }
            
            if (useRetinaImg) {
                if (itemMain.children('[data-id="img"]').attr("data-retina") !== '') {
                    imgSrc = itemMain.children('[data-id="img"]').attr("data-retina");
                }
            }
            var main = {
                spotLightInd: mainVars.attr('spotLightInd'),
                titleid: mainVars.attr("titleid"),
                contentTypeId: mainVars.attr("contentTypeId"),
                isLink: mainVars.attr("isLink"),
                isPlayableClass: mainVars.attr('isPlayable') === 'true' ? '' : 'hide',
                special: mainVars.attr('special'),
                avail: mainVars.attr("avail"),
                href: itemMain.children('a[data-id="video-href"]').attr("href"),
                blurb: itemMain.children('p[data-id="descr"]').text(),
                timeClass: timeClass,
                seasonClass: seasonClass,
                episodeClass: episodeClass,
                epinfo: getFormattedEpisodeInfo(itemMain.children('p[data-id="season"]').text(), itemMain.children('p[data-id="ep"]').text(), 'small'),

                seasonStr: seasonStr,
                episodeStr: episodeStr,
                episodeNo: episodeNo,
                seasonNo: seasonNo,
                title: itemMain.children('h2[data-id="title"]').text(),
                img: imgSrc,
                //duration: getDurationText(itemMain.children('p[data-id="duration"]').text()),
                duration: Tn.formatDuration(itemMain.children('p[data-id="duration"]').text()),
                infoLink: itemMain.children('a[data-id="info-href"]').attr("href"),
                tileSubHeader: itemMain.children('[data-id="tile-sub-header"]').text(),
                tileHeader: itemMain.children('[data-id="tile-header"]').text(),
                videoLink: itemMain.children('a[data-id="video-href"]').attr("href"),
                mainTVRating: itemMain.children('[data-id="tv-rating"]').text()
            };

            var secondaries = [];
            seconds.each(function() {
                var s = $(this);
                var vars = s.children('span[data-id="vars"]');
                var seasonNo = typeof(s.children('p[data-id="season"]').text()) !== 'undefined' ? s.children('p[data-id="season"]').text() : '';
                var episodeNo = typeof(s.children('p[data-id="ep"]').text()) !== 'undefined' ? s.children('p[data-id="ep"]').text() : '';
                var timeClass = seasonNo.length === 0 && episodeNo.length === 0 ? 'left' : '';
                //var seasonNo = s.children('p[data-id="season"]').text();
                //var episodeNo = s.children('p[data-id="ep"]').text();
                var seasonClass = seasonNo.length === 0 ? 'tn-hidden' : '';
                var episodeClass = seasonNo.length === 0 ? 'tn-hidden' : '';
                var imgSrc = s.children('img[data-id="img"]').attr("data-retina");

                if (window.tnVars.useRetinaImg) {
                    if (s.children('img[data-id="img"]').attr("data-retina") !== '') {
                        imgSrc = s.children('img[data-id="img"]').attr("data-retina");
                    }
                }

                secondaries.push({
                    spotLightInd: vars.attr('spotLightInd'),
                    contentTypeId: vars.attr("contentTypeId"),
                    isLink: vars.attr("isLink"),
                    titleid: vars.attr("titleid"),
                    isPlayableClass: vars.attr('isPlayable') === 'true' ? '' : 'hide',
                    special: vars.attr('special'),
                    avail: vars.attr("avail"),
                    blurb: s.children('p[data-id="descr"]').text(),
                    href: s.children('a[data-id="video-href"]').attr("href"),
                    timeClass: timeClass,
                    seasonClass: seasonClass,
                    episodeClass: episodeClass,
                    epinfo: getFormattedEpisodeInfo(s.children('p[data-id="season"]').text(), s.children('p[data-id="ep"]').text(), 'small'),
                    episodeNo: episodeNo,
                    seasonNo: seasonNo,
                    title: s.children('h2[data-id="title"]').text(),
                    img: imgSrc,
                    //duration: getDurationText(s.children('p[data-id="duration"]').text(), 'small'),
                    duration: Tn.formatDuration(s.children('p[data-id="duration"]').text(), 'small'),
                    infoLink: s.children('a[data-id="info-href"]').attr("href"),
                    videoLink: s.children('a[data-id="video-href"]').attr("href")
                });
            });

            //console.log(main);
            //console.log(secondaries);

            var rowObj = {};
            rowObj.main = main;
            rowObj.secondaries = secondaries;
            rowObj.theAdHTML = theAdHTML;

            //var showPlayBtn = link.attr('isPlayable') ? '' : hide;
            row.push(rowObj);
        });
        carousels.push(row);
        $(this).remove();
    });

    var smMargins = 20;
    var isWindowScroll = false;
    Tn.wait4AdLoadCountHome = 0;
    if(window.tnVars.isIOS() || window.tnVars.isAndroid ){
        $('#page-landing').addClass('is-window-scroll');
        isWindowScroll = true;
    }

    $('#page-landing').pageCarousel({
        itemCls: 'content-wrapper',

        carousels: carousels,
        useVerticalSnap: false,
        // alwasys refresh horizontal scroll
        alwaysRefreshHScrollOnResize: true,
        // always Refresh vertical scroll
        alwaysRefreshVScrollOnResize: false,
        // These values will be recalculated on screen resize to align everything
        tileWidth: 640,
        tileHeight: 360,
       // defaultTopBannerHeight: 90, // Used because we can get expanded ads on load and don't need that to effect our page dimensions / layout
        defaultTopBannerHeight: 104, // changed to 104 to account for padding;
        bufferH: window.tnVars.isMobile() ? 2 : 2,
        isWindowScroll: isWindowScroll,
        //wait4AdLoadCount: 0,

        // Called whenever the window is resized, to give you a change to position everything
        onResizeSmall: function() {

            var page = $('#page-landing');
            var width = $(window).width(),
                items = 1;
            var height = page.height() - 10;
            var isSmallScreen = false;
            // these match the css media queries
            var smallTitleHeight = 50;
            var lgTitleHt = 200;
            var titleHt = lgTitleHt;

            this.windowHeight = height;
            this.windowWidth = width;

            var maxImageSize = 356;
            var maxSmImageSize = 174;
            var titleH;
            //if((this.windowWidth <= 496 && height <= 569) || (this.windowWidth <= 670 && height <= 320)){
            if ((this.windowWidth <= 496) || (height <= 320)) {
                isSmallScreen = true;
                titleHt = smallTitleHeight;
            }

            // to account for margins with arrows
            if (isSmallScreen) {
                if (height < 320) {
                    height = 320;
                }
                titleH = 50;

            } else {
                width -= 124;
                if (height < 530) {
                    height = 530;
                }
                titleH = 200;
            }


            items = width / maxImageSize;

            /*
                    NOTES - if we assuming we will scroll if the height is super short; things may be easier
                    a wide screen and small height gives much space inbetween - we should just make it scroll
                    design wants a fixed red title height of 250...i made it a little less (200) because i could not
                    see the whole tile in my full open browser window

                    we keep it at 200 until we get a height less that 569, then we drop it to 40px
            */

            // Calculate the width of an item
            // the +10 here is for the margin in between tiles
            width = parseInt(width / items, 10);
            if (width > this.windowWidth) {
                width = this.windowWidth;
            }
            // Calculate the height of an item

            if (height < 32) {
                height = 32;
            }
            if (width < 32) {
                width = 32;
            }

            // allowed height is the allowed maximum height of the main image
            var secondaryTilePercentage = 0.49;


            //var ad = page.find('.ad-wide-banner');

            //356x308 & 356x200
            // 356 + 50 = 406 for small arrow margins
            // 194
            // Calculate the optimal width required to show this image scaled at the allwed height
            //var optimalWidth = (maxImageSize * allowedHeight / 200);
            var optimalWidth = maxImageSize;

            //console.log("optimalWidth based on allowedHeight: " + optimalWidth);

            var hPrimary, hSecondary, wSecondary;

            // If the optimal width is greater than the tile width, then just use the tile width 
            // the -10 here is to keep the 356 image width while keeping the extra 10 for the right margin

            if (optimalWidth > (width)) {
                optimalWidth = (width);
            }


            var titleWidth = optimalWidth;

            var contentMargin = 0;
            var tileW;
            if (isSmallScreen) {
                //titleWidth = this.windowWidth;
                width = this.windowWidth;
                optimalWidth = optimalWidth > width ? optimalWidth - (smMargins * 2) : optimalWidth - smMargins * 2;
                if (this.windowWidth > optimalWidth) {
                    contentMargin = ((this.windowWidth - optimalWidth) / 2) - 20;
                }
                //contentMargin = 8;
                tileW = width - (smMargins * 2);
                titleWidth = tileW;
            } else {
                tileW = width + 10;
            }



            hPrimary = optimalWidth * 200 / maxImageSize;
            wSecondary = optimalWidth * secondaryTilePercentage;
            hSecondary = wSecondary * 102 / maxSmImageSize;

            optimalWidth = parseInt(optimalWidth, 10);
            hPrimary = parseInt(hPrimary, 10);
            hSecondary = parseInt(hSecondary, 10);
            //spacing = parseInt((width - optimalWidth) / 2, 10);
            //
            // height - total height of bottom is 292px so if the total height is less than 292 + 50 (title)
            // we need to do some recalculating of image size
            // 384 + 250=634
            // they do not want the red title to be more than 250px height
            //var titleHeight = 220;

            var totalHeight = hPrimary + hSecondary + titleH + 20;

            // Calculate the tile width and height
            this.tileWidth = tileW;
            this.tileHeight = totalHeight;
            this.tileDefaults = {
                height: height,
                hPrimary: hPrimary,
                hSecondary: hSecondary,
                optimalWidth: optimalWidth,
                titleWidth: titleWidth,
                titleHt: titleHt,
                contentMargin: contentMargin,
                totalHeight: totalHeight
            };
            this.setDefaults(page);

        },

        // Called whenever the window is resized, to give you a change to position everything
        
        //onResize: function(wait4AdLoadCount) {
        onResize: function() {
            var page = $('#page-landing');
            var width = $(window).width(),
                items = 1,
                checkFooter = false;
            //wait4AdLoadCount = (wait4AdLoadCount)?wait4AdLoadCount:0;
            //
            //wait4AdLoadCount = (wait4AdLoadCount)?wait4AdLoadCount:0;
            //var wHeight = $(window).height();
            //var headerHeight = $('header').height();
            //var footerHeight = $('footer').height();

            this.windowWidth = width;
            if (width < 767) {
                return this.onResizeSmall();
            }

            // This is tied to the CSS media query which changes the page layout
            if (width < 600) {
                checkFooter = true;
            }

            // // Two items on medium screens
            // if (width > 768) {
            //     items = 2;
            // }

            // // 3 items on big screens
            // if (width > 1100) {
            //     items = 3;
            // }

            //items = parseInt(width / 716, 10) + 1;
            items = width / 365;

            // Calculate the width of an item
            width = parseInt(width / items, 10);

            // Calculate the height of an item
            // var heightOriginal = page.height() - 10;
            var heightOriginal = page.height();
            // TODO - we need to get the window height minus the header and footer height
            
            //var heightOriginal = wHeight - headerHeight - footerHeight - 10;
            var height = heightOriginal;

            // If we have too much vertical space (portrait mode), correct this behavior by making the tiles larger
            if (heightOriginal>width*1.5) {
                items -= 1;
                if (items<1) {
                    items = 1;
                }
                width = parseInt(this.windowWidth / items, 10);
            }

            var adPage = page.find('.ad-wide-banner');
            var adHeight = adPage.height();
            if (adHeight > 10) {
                adHeight = this.defaultTopBannerHeight; // Used because we can get expanded ads on load and don't need that to effect our page dimensions / layout
                // we are not using height anywhere else, but you would not want to adjust for that becuase the ad is laying over the tiles
                // the tiles are not being pushed down due to the ad height
                height -= adHeight;
                adPage.find('.bg').removeClass('tn-hidden');
                page.addClass('hasBigAdLoaded');
            } else {
                adPage.find('.bg').addClass('tn-hidden');
                page.removeClass('hasBigAdLoaded');
                if(Tn.wait4AdLoadCountHome < 2){
                    //setTimeout($.proxy(this.onResize, this, (wait4AdLoadCount + 1)), 3000);
                    // NOTE - i changed this because the tile widths (.carousel-row-item) were not being resized without going through the carousel resize()
                    // calling this.onResize directly only resizes the internal tile content, thus we see big gaps between the tiles
                    // so i moved wait4AdLoadCount outside of this function to be able to access without passing it through
                    setTimeout(function(){
                        //console.log('wait4AdLoadCountHome: ' + Tn.wait4AdLoadCountHome);
                        Tn.wait4AdLoadCountHome = Tn.wait4AdLoadCountHome + 1;
                        Tn.isWaitingForHomeAd = true;
                        page.pageCarousel("resize");
                    }, 2000);
                    
                } else {
                    // once we have maxed out the ad counts, we reset isWaitingForHomeAdto false
                    // so orientation change will work even if ad count is done
                    Tn.isWaitingForHomeAd = false;
                }
                if(Tn.wait4AdLoadCountHome !== 0 && Tn.isWaitingForHomeAd === true){
                    return; // Only setDefaults() if there is a page change.  Intial load needs this done though.
                }
            }

            if (height < 32) {
                height = 32;
            }
            if (width < 32) {
                width = 32;
            }
            // we are using the .page element height which does not include the footer so we don't need to subtract it
            /*
            if (checkFooter) {
                var footerHeight = $('footer').is(':visible') ? $('footer').height() : 0;
                heightOriginal -= footerHeight;
                height -= footerHeight;
            }
            */

            var thresholdHeight = 0.2 * heightOriginal;
            if (thresholdHeight>180) {
                thresholdHeight = 180;
            }
            if (thresholdHeight<adHeight+15) {
                thresholdHeight = adHeight+15;
            }
            if ((heightOriginal-height)<thresholdHeight) {
                var delta = thresholdHeight - (heightOriginal-height);
                height -= delta;
            }

            // allowed height is the allowed maximum height of the main image
            var secondaryTilePercentage = 0.45,
                allowedHeight = height;

            if (allowedHeight < 100) {
                allowedHeight = 100;
            }
            allowedHeight *= 1.0 - secondaryTilePercentage; // Assume the secondary tiles takes up around 33%

            // Calculate the optimal width required to show this image scaled at the allwed height
            var optimalWidth = 640 * allowedHeight / 360;
            var hPrimary, hSecondary, spacing;

            // If the optimal width is greater than the tile width, then just use the tile width 
            if (optimalWidth > (width - 10)) {
                optimalWidth = (width - 10);
            }
            hPrimary = optimalWidth * 360 / 640;
            hSecondary = hPrimary * secondaryTilePercentage;

            optimalWidth = parseInt(optimalWidth, 10);
            hPrimary = parseInt(hPrimary, 10);
            hSecondary = parseInt(hSecondary, 10);
            spacing = parseInt((width - optimalWidth) / 2, 10);


            //spacing = parseInt((width - optimalWidth) / 2, 10);
            //
            // height - total height of bottom is 292px so if the total height is less than 292 + 50 (title)
            // we need to do some recalculating of image size
            // 384 + 250=634
            // they do not want the red title to be more than 250px height
            //var titleHeight = 220;

            var titleH = heightOriginal - hPrimary - hSecondary;
            var totalHeight = hPrimary + hSecondary + titleH + 20;
            var titleWidth = optimalWidth;
            var titleHt = titleH;
            var contentMargin = 0;

            // Calculate the tile width and height
            this.tileWidth = optimalWidth + 10;
            this.tileHeight = heightOriginal;

            //if(wait4AdLoadCount !== 0){
                //page.pageCarousel("updateSize");
            //}

            // when it is coming back through for the ad call, it is recalculation the tile width but is not applying 
            // that value to the carousel tiles (carousel-row-item)

            this.tileDefaults = {
                height: height,
                hPrimary: hPrimary,
                hSecondary: hSecondary,
                optimalWidth: optimalWidth,
                titleWidth: titleWidth,
                titleHt: titleHt,
                contentMargin: contentMargin,
                totalHeight: totalHeight
            };
            this.setDefaults(page);
        },

        setDefaults: function(item) {
            var hPrimary = this.tileDefaults.hPrimary,
                hSecondary = this.tileDefaults.hSecondary,
                //height = this.tileDefaults.height,
                optimalWidth = this.tileDefaults.optimalWidth,
                titleWidth = this.tileDefaults.titleWidth,
                titleHt = this.tileDefaults.titleHt,
                contentMargin = this.tileDefaults.contentMargin;

            item.find('.single .maintitle').width(titleWidth).height(titleHt);
            // for single we need to add 6 to account for no margin between images
            item.find('.single .main-content').height(hPrimary + hSecondary + 6).width(optimalWidth).css('margin-left', contentMargin);
            item.find('.single .secondary-content').height(0);

            item.find('.triple .maintitle').width(titleWidth).height(titleHt);
            item.find('.triple .main-content').height(hPrimary).width(optimalWidth).css('margin-left', contentMargin);
            item.find('.triple .secondary-content').height(hSecondary).width(optimalWidth).css('margin-left', contentMargin);
            //item.find('.triple .secondary-content').width(optimalWidth).css('margin-left',contentMargin);

        },

        // Called to grab the size of an item in the carousel
        // If you have ads in the carousel, you have to specify the size of the ad, instead of the carousel dimensions
        getItemDimensions: function() {
            // Return the responsive tile width and heights
            return {
                w: this.tileWidth,
                h: this.tileHeight
            };
        },

        // Called when an item is lazily added
        addItem: function(item, index, data) {
            var main = data.main;
            var seconds = data.secondaries;
            var theAdHTML = data.theAdHTML;
            main.secondsclass = seconds.length === 0 ? 'single' : 'triple';
            main.playStyle = Tn.buildProgressStyle(main.titleid, false);
            if (main.contentTypeId === "200" || main.isLink === "true") {
                main.hideOverlayClass = "tn-hidden";
                if (main.isLink === "true") {
                    main.mainDataHref = 'data-href="' + main.infoLink + '"';
                } else {
                    main.mainDataHref = '';
                }
            } else {
                main.hideOverlayClass = "";
            }
            var text = Tn.fm([
                '<div class="content-wrapper {secondsclass}">',
                '<div class="maintitle">',
                '<div class="bottom"><h2>{tileHeader}</h2><div><span class="tv-rating">{mainTVRating}</span><br/>{tileSubHeader}</div></div>',
                '</div>',

                '<div class="main-content" data-id="{titleid}" data-videohref="{videoLink}" {mainDataHref}>',
                '<canvas class="main playbut {isPlayableClass}" data-id="{titleid}" {playStyle}></canvas>',
                '<img src="{img}" style="width:100%; height:100%;">',
                '<div class="caption withleft">',
                '    <div class="text-wrapper">',
                '        <span class="title">{title}</span>',


                '        <span class="subtitle">{epinfo}</span>',
                '    </div>',
                '</div>',
                '<div class="icon-group2  {hideOverlayClass}">',
                '    <div class="icon plus"></div>',
                '    <div class="icon info"></div>',
                '</div>',
                '<div class="info-overlay">',
                '    <div class="icon-group">',
                '        <div class="icon plus">',
                '            <div class="glyphicon glyphicon-plus"></div>',
                '        </div>',
                '        <div class="icon info" data-href="{infoLink}"></div>',
                '        <div class="icon playbut {isPlayableClass}"></div>',
                '    </div>',
                '    <div class="meta">',
                '        <div class="above-fold">',
                '            <div class="title">',
                '                <span>{title}</span>',
                '            </div>',
                '            <div class="specs">',
                '                <div class="season">',
                '                    <span>{seasonStr}</span>',
                '                </div>',
                '                <div class="ep">',
                '                    <span>{episodeStr}</span>',
                '                </div>',
                '                <div class="time {timeClass}">',
                '                    <span>{duration}</span>',
                '                </div>',
                '            </div>',
                '        </div>',
                '        <div class="below-fold">',
                '            <div class="ep-title">',
                '                <span></span>',
                '            </div>',
                '            <div class="blurb truncate-h" style="word-wrap: break-word;">',
                '                {blurb}<div class="more" data-href="{infoLink}" style="display: inline;">More...</div>',
                '            </div>',
                '        </div>',
                '    </div>',
                '    </div>',
                '</div>'
            ].join(''), main) + theAdHTML;
            var sText = '<div class="secondary-content">';
            for (var i = 0; i < seconds.length; i++) {
                var sData = seconds[i];
                sData.playStyle = Tn.buildProgressStyle(sData.titleid, true);
                // adding ids to secondary items to help preserve unique context when init'ing the overlays
                sText += Tn.fm([
                    '<div class="secondary-item" id="id-{titleid}" data-id="{titleid}" data-videohref="{videoLink}">',
                    '<div class="overlay"></div>',
                    '<canvas class="main playbut sm {isPlayableClass}" data-id="{titleid}" {playStyle}></canvas>',
                    '<img src="{img}">',
                    '<div class="caption withleft">',
                    '    <div class="text-wrapper">',
                    '        <span class="title">{title}</span>',
                    '        <span class="subtitle">{epinfo}</span>',
                    '    </div>',
                    '</div>',
                    '    <div class="icon-group2">',
                    '    <div class="icon plus"></div>',
                    '    <div class="icon info"></div>',
                    '</div>',
                    '<div class="info-overlay sm">',
                    '    <div class="icon-group">',
                    '        <div class="icon plus"></div>',
                    '        <div class="icon info" data-href="{infoLink}"></div>',
                    '        <div class="icon playbut {isPlayableClass}"></div>',
                    '    </div>',
                    '    <div class="meta">',
                    '        <div class="above-fold">',
                    '            <div class="title">',
                    '                <span>{title}</span>',
                    '            </div>',
                    '            <div class="specs">',
                    '                <div class="season {seasonClass}">',
                    '                    <span>S{seasonNo}</span>',
                    '                </div>',
                    '                <div class="ep {episodeClass}">',
                    '                    <span>E{episodeNo}</span>',
                    '                </div>',
                    '                <div class="time {timeClass}">',
                    '                    <span>{duration}</span>',
                    '                </div>',
                    '            </div>',
                    '        </div>',
                    '        <div class="below-fold">',
                    '            <div class="ep-title">',
                    '                <span></span>',
                    '            </div>',
                    '            <div class="blurb" style="word-wrap: break-word;">',
                    //'                <span>{blurb}<a class="more" href="{infoLink}" style="display: inline;">More...</a></span>',
                    '                <div class="more" data-href="{infoLink}" style="display: inline;">More...</div>',
                    '            </div>',
                    '        </div>',
                    '    </div>',
                    '    </div>',
                    '</div>'
                ].join(''), sData);
            }
            sText += '</div>'; // end of secondary-content
            text += sText;
            text += '</div>'; // end of slide-wrapper

            item.append(text);
            // adding a setTimeout because it was hitting the truncate script before the boxes were ready
            // to have their height determined; the descriptions were getting completely truncated on page load with cleared cache
            setTimeout(function(){
                 window.tnOverlays.init(item.find('.main-content'));
            }, 100);

             setTimeout(function(){
                item.find('.secondary-item').each(function() {
                    window.tnOverlays.init( $(this) );
                });
            }, 100);

            this.setDefaults(item);
            if (main.isLink === "true") {
                item.find('.main-content').click(function(event) {
                    event.preventDefault();
                    var url = $(this).attr("data-href");
                    window.open(url, "turnerExternal");
                });
                item.find('.main-content').mouseenter(function() {
                    $(this).css("cursor", "pointer");
                }).mouseleave(function() {
                    $(this).css("cursor", "default");
                });
            }

            Tn.updateCanvasProgress(item.find('canvas.playbut'));
        },

        // Called when an item is lazily removed
        // Called when an item is lazily removed
        removeItem: function(item) {
            window.tnOverlays.destroyTruncate(item);
            item.empty();
        },

        onArrowClick: function(event) {
            event.preventDefault();
            var widget = this.me;
            widget.scrollToPageOffset(this.index, this.offset);
        },

        rowAdded: function(item, index, carouselData, row) {
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
        },

        onRowResized: function(index, row) {
            // the timeout is here so the row ahs time to finish writing to the page resized before the resizeOverlay is called
           // setTimeout(function() {
                row.find('.carousel-row-item.active').each(function() {
                    var mainItem = $(this).find('.main-content');
                    window.tnOverlays.resizeOverlay(mainItem);
                    $(this).find('.secondary-item').each(function() {
                        window.tnOverlays.resizeOverlay($(this));
                    });
                });

            //}, 0);

        }

    });


});

}

/*
     FILE ARCHIVED ON 17:29:42 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 2.609
  load_resource: 37.645
  PetaboxLoader3.datanode: 18.988
*/