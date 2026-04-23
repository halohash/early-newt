$.extend(Tn, {
    liveTVRefreshInterval: 1000 * 60 * 5, // 5 minute refresh interval
    refreshTVPage: function() {
        if (Tn.liveTVRefreshTimer) {
            clearTimeout(Tn.liveTVRefreshTimer);
            Tn.liveTVRefreshTimer = null;
        }

        var tvpage = $('#page-livetv .carousel-row-item');
        var onNowSections = $('.check-for-on-now');

        // Check to see if the live tv page is loaded
        if (tvpage.length !== 2 && onNowSections.length === 0) {
            Tn.liveTVRefreshTimer = setTimeout(Tn.refreshTVPage, Tn.liveTVRefreshInterval);
            return;
        }

        $.ajax({
            url: '/' + window.siteDefaults.liveLoc + '/',
            dataType: 'text'
        }).done(function(data) {
            data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
            var page = $(data).find('#page-livetv .carousel .item');
            if (page.length !== 2) {
                console.error("live tv page not found");
            } else {
                // console.error("Live TV Page Refresh Success!!!", page.length);
                if(tvpage.length === 2){
                    tvpage.each(function(index, val) {
                        var oldP = $(val);
                        var newP = $(page.get(index));
                        oldP.find('.time').text(newP.find('[data-id="vars"]').attr('upNextStartTime'));
                        oldP.find('.upnext').text(newP.find('[data-id="vars"]').attr('upNext'));
                        oldP.find('.title').text(newP.find('[data-id="title"]').text());
                        oldP.find('.subtitle').text(newP.find('[data-id="vars"]').attr('subText'));
                        oldP.find('.liveimg').attr('src', newP.find('img').attr('data-src'));
                    });
                }
                if(onNowSections.length !== 0){

                    var newpageE = $(page).find('[data-id="vars"][location="eastern"]');
                    var titleE = newpageE.parent().find('[data-id="title"]').text();
                    var newpageW = $(page).find('[data-id="vars"][location="pacific"]');
                    var titleW = newpageW.parent().find('[data-id="title"]').text();
                    //console.log(newpageE);
                    //console.log(newpageW);
                    onNowSections.each(function(i, elem){
                        var $elem = $(elem);
                        var compareKey = $elem.attr('data-key');
                        var compareVal = $elem.attr('data-key-value');
                        var valE = newpageE.attr(compareKey);
                        var valW = newpageW.attr(compareKey);

                        // NOTE - East is the default if it matches both E and W
                        if(valE === compareVal){
                            console.log('it is on now east: ' + titleE);
                            if( $elem.find('.on-now-overlay').length === 0){
                                Tn.writeOnNowOverlay($elem, 'eastern');
                            }
                        } else if(valW === compareVal){
                            console.log('it is on now west: ' + titleW);
                            if( $elem.find('.on-now-overlay').length === 0){
                                Tn.writeOnNowOverlay($elem, 'pacific');
                            }
                        } else {
                            $elem.find('.on-now-overlay').remove();
                        }
                    });

                    
                }
                
            }
        }).fail(function() {
            console.error("Failed to load live tv page");
        }).always(function() {
            Tn.liveTVRefreshTimer = setTimeout(Tn.refreshTVPage, Tn.liveTVRefreshInterval);
        });
    },
    /**
     * [writeOnNowOverlay this can be used by pages to see if the displayed show/sport is playing live now]
     * @return {[type]} [description]
     */
    writeOnNowOverlay: function(elem, loc){
        var videoLinkLive = window.siteDefaults.name === 'TBS' ? Tn.mapLocToLiveTv.tbs[loc] : Tn.mapLocToLiveTv.tnt[loc];
        var parent = elem.find('.epleft2 > .image-wrapper');
        var text = ['<div class="on-now-overlay" data-videohref="' + videoLinkLive + '"><div class="playbut"></div>',
                '<div class="text"><div>This program is on now. Watch it LIVE.</div></div>',
            '</div>'].join('');
        parent.prepend(text);
        parent.find('.on-now-overlay').on('click', Tn.setOnNowPlayBtn);
    },
    setOnNowPlayBtn: function(event){
        event.preventDefault();
        event.stopPropagation();

        var lastClick = $(this).attr('lastclick');
        if (lastClick && (new Date().getTime()-lastClick)<250) {
            return;
        }

        $(this).attr('lastclick', new Date().getTime());

        var href = $(this).attr('data-videohref');
        if (!href || href.length === 0 || href === "undefined") {
            Tn.alert("No video url found");
            return;
        }
        Tn.showPlayer('http://' + $(location).attr('host') + href);
    }
});

$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-livetv') {
        return;
    }

    // Page was already shown, so just call an update when the page is shown again
    if (Tn.livetvPageInitialized) {
        Tn.refreshTVPage();
        //$('#page-livetv').pageCarousel("resize");
        $('#page-livetv').pageCarousel("setYPos");
        return;
    }

    Tn.livetvPageInitialized = true;
    Tn.liveTVRefreshTimer = setTimeout(Tn.refreshTVPage, Tn.liveTVRefreshInterval);
    var carousels = [];
    var useRetinaImg = window.tnVars.isRetinaScreen &&
        !( (window.tnVars.isAndroid && !window.tnVars.isAndroidTablet() ) ||
        window.tnVars.isIPhone ||
        window.tnVars.isIPod) ? true : false;
        
    $('#page-livetv .carousel').each(function() {
        var row = [];

        $(this).find('div.item').each(function() {
            var item = $(this),
                itemVars = item.children('span[data-id="vars"]'),
                imgSrc = item.children('[data-id="img"]').attr("data-standard");


                if (useRetinaImg) {
                    if (item.children('[data-id="img"]').attr("data-retina") !== '') {
                        imgSrc = item.children('[data-id="img"]').attr("data-retina");
                    }
                }

            row.push({
                isNew: itemVars.attr('span[data-id="isNew"]'),
                titleId: itemVars.attr("titleId"),
                subText: itemVars.attr("subText"),
                videoLink: item.children('[data-id="video-href"]').attr("href"),
                upNextTitle: itemVars.attr("upNext"),
                upNextRating: itemVars.attr("upNextRating"),
                upNextStartTime: itemVars.attr("upNextStartTime"),
                img: imgSrc,
                tileHeader: item.children('[data-id="tile-header"]').text(),
                title: item.children('[data-id="title"]').text()

            });
        });

        


        while (row.length < 1) {
            row.push({
                isPlaceholder: true
            });
        }

        carousels.push(row);
        $(this).remove();
    });

    function fm(txt) {
        var i, reg;

        // Check to see if we're using named value pairs
        if (arguments.length === 2 && typeof arguments[1] === 'object') {
            $.each(arguments[1], function(key, value) {
                reg = new RegExp("\\{" + key + "\\}", "gm");
                txt = txt.replace(reg, value);
            });
            return txt;
        }

        // We have a list of parameters, so traverse the list
        for (i = 1; i < arguments.length; i++) {
            reg = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            txt = txt.replace(reg, arguments[i]);
        }
        return txt;
    }

    var isWindowScroll = false;
    if(window.tnVars.isIOS() || window.tnVars.isAndroid ){
        $('#page-livetv').addClass('is-window-scroll');
        isWindowScroll = true;
    }

    $('#page-livetv').pageCarousel({
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

        bufferH: window.tnVars.isMobile() ? 2 : 2,
        bufferV: window.tnVars.isMobile() ? 0 : 0,
        isWindowScroll: isWindowScroll,


        // Called whenever the window is resized, to give you a change to position everything
        // TODO - the image does not have to be so small to leave the margins
        // need to adjut red header to make sure new image sizes have room with the footer
        
        onResizeSmall: function() {
            var page = $('#page-livetv');
            var width = $(window).width(),
                items = 1,
                checkFooter = true;

            this.windowWidth = width;

            items = parseInt(width / 716, 10) + 1;
            if (items > 2) {
                items = 2;
            }

            // Calculate the width of an item
            width = parseInt(width / items, 10);

            // Calculate the height of an item
            var heightOriginal = page.height() - 5;
            var height = heightOriginal;

            // If we have too much vertical space (portrait mode), correct this behavior by making the tiles larger
            if (heightOriginal > width * 1.25) {
                items -= 1;
                if (items < 1) {
                    items = 1;
                }
                width = parseInt(this.windowWidth / items, 10);
            }

            if (height < 32) {
                height = 32;
            }
            if (width < 32) {
                width = 32;
            }
            if (checkFooter) {
                var footerHeight = $('footer').is(':visible') ? $('footer').height() : 0;
                heightOriginal -= footerHeight;
                height -= footerHeight;
            }

            // the red title should always be at least 25% of the height of the page
            var thresholdHeight = 0.25 * heightOriginal;
            if (thresholdHeight > 180) {
                thresholdHeight = 180;
            }
            if ((heightOriginal - height) < thresholdHeight) {
                var delta = thresholdHeight - (heightOriginal - height);
                height -= delta;
            }

            // allowed height is the allowed maximum height of the main image
            var allowedHeight = height;

            if (allowedHeight < 100) {
                allowedHeight = 100;
            }

            // Calculate the optimal width required to show this image scaled at the allwed height
            var optimalWidth = 640 * allowedHeight / 360;
            var hPrimary;

            // If the optimal width is greater than the tile width, then just use the tile width 
            var firstTile =  page.find('.carousel-row-item').first();
            if (optimalWidth > width) {
                optimalWidth = width;
            }
            hPrimary = optimalWidth * 360 / 640;

            optimalWidth = parseInt(optimalWidth, 10);
            hPrimary = parseInt(hPrimary, 10);

            var tileFooterHeight = firstTile.find('.main-footer').outerHeight(true);
            var titleH = heightOriginal - hPrimary - tileFooterHeight;
            var totalHeight = hPrimary + titleH + tileFooterHeight;
            var titleWidth = optimalWidth;
            var titleHt = titleH;
            var contentMargin = 6;
           
            if(optimalWidth === width){
                contentMargin = 0;
            }

            // the iscroll is not sending scrollend events consistently when there are 2 almost full tiles
            // so the classes were not getting set correctly to show the prev/next arrows
            // since on live tv we only have 2 tiles, i am hiding the arrows if this is the case
            if(optimalWidth < width && heightOriginal < 506){
                page.find('.nav-slider').addClass('tn-hidden');
            } else {
                 page.find('.nav-slider').removeClass('tn-hidden');
            }

            // Calculate the tile width and height
            this.tileWidth = optimalWidth;
            this.tileHeight = totalHeight;

            page.find('.maintitle').width(titleWidth - contentMargin).height(titleHt);
            page.find('.main-content').height(hPrimary).width(optimalWidth - contentMargin);
            page.find('.main-footer').width(optimalWidth - contentMargin);

        },


        // Called whenever the window is resized, to give you a change to position everything
        // TODO - we need to account for the red main-footer height on the tiles
        onResize: function() {
            var page = $('#page-livetv');
            var width = $(window).width(),
                items = 1;

            //var wHeight = $(window).height();
            //var headerHeight = $('header').height();
            //var footerHeight = $('footer').height();

            this.windowWidth = width;
            if (width < 767) {
                return this.onResizeSmall();
            }

            items = parseInt(width / 716, 10) + 1;
            if (items > 2) {
                items = 2;
            }

            // Calculate the width of an item
            width = parseInt(width / items, 10);

            // Calculate the height of an item
            var heightOriginal = page.height() - 10;
            //var heightOriginal = wHeight - headerHeight - footerHeight - 10;
            var height = heightOriginal;

            // If we have too much vertical space (portrait mode), correct this behavior by making the tiles larger
            if (heightOriginal > width * 1.25) {
                items -= 1;
                if (items < 1) {
                    items = 1;
                }
                width = parseInt(this.windowWidth / items, 10);
            }

            if (height < 32) {
                height = 32;
            }
            if (width < 32) {
                width = 32;
            }

            // the red title should always be at least 25% of the height of the page
            var thresholdHeight = 0.25 * heightOriginal;
            if (thresholdHeight > 180) {
                thresholdHeight = 180;
            }
            if ((heightOriginal - height) < thresholdHeight) {
                var delta = thresholdHeight - (heightOriginal - height);
                height -= delta;
            }

            // allowed height is the allowed maximum height of the main image
            var allowedHeight = height;

            if (allowedHeight < 100) {
                allowedHeight = 100;
            }

            // Calculate the optimal width required to show this image scaled at the allwed height
            var optimalWidth = 640 * allowedHeight / 360;
            var hPrimary;

            // If the optimal width is greater than the tile width, then just use the tile width 
            //var lastTile =  page.find('.carousel-row-item').last();
            //var lastTileMargin = lastTile.css('marginRight');
            //lastTileMargin = typeof(lastTileMargin) !== 'undefined' ? lastTileMargin.replace('px','').replace('em','') : 0;
            if (optimalWidth > (width - width*0.08)) {
                optimalWidth = (width - width*0.08);
            }
            hPrimary = optimalWidth * 360 / 640;

            optimalWidth = parseInt(optimalWidth, 10);
            hPrimary = parseInt(hPrimary, 10);

            var tileFooterHeight = page.find('.carousel-row-item .main-footer').outerHeight(true);
            var titleH = heightOriginal - hPrimary - tileFooterHeight;
            var totalHeight = hPrimary + titleH + tileFooterHeight;
            var titleWidth = optimalWidth;
            var titleHt = titleH;
            var contentMargin = 6;

            // Calculate the tile width and height
            this.tileWidth = optimalWidth;
            this.tileHeight = totalHeight;

            // we are subtracting the contentMargin because we need to put the in between tile margins inside the tiles instead
            // of at the tile level or else we get scroll issues
            page.find('.maintitle').width(titleWidth - contentMargin).height(titleHt);
            page.find('.main-content').height(hPrimary).width(optimalWidth - contentMargin);
            page.find('.main-footer').width(optimalWidth - contentMargin);

        },

        // Called to grab the size of an item in the carousel
        // If you have ads in the carousel, you have to specify the size of the ad, instead of the carousel dimensions
        getItemDimensions: function() { /*carousel, index, data*/
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
                w: this.tileWidth,
                h: this.tileHeight
            };
        },

        // Called when an item is lazily added
        addItem: function(item, index, data, widget) {
            if (data.isPlaceholder) {
                item.append('<div class="main-content"><img src="https://web.archive.org/web/20141231172948/http://placehold.it/445x250/000000&text=PLACEHOLDER" style="width:100%; height:100%;"></div>');
                return;
            }
            var text = fm([
                '<div class="content-wrapper">',
                '<div class="maintitle">',
                '<div class="bottom"><h3>{tileHeader}</h3></div>',
                '</div>',
                '<div class="main-content" data-id="{titleId}" data-videohref="{videoLink}">',
                '<div class="on-now">On Now</div>',
                '<div class="main playbut"></div>',
                '<img class="liveimg" src="{img}" style="width:100%; height:100%;">',
                '<div class="caption">',
                '    <div class="text-wrapper">',
                '        <h2 class="title">{title}</h2>',
                '        <span class="subtitle">{subText}</span>',
                '    </div>',
                '</div>',

                '</div>',
                '<div class="main-footer">',
                '   <span class="intro">Up Next:</span>',
                '   <span class="time">{upNextStartTime}</span>',
                '   <span class="upnext">{upNextTitle}</span>',
                '   <span class="upnextrating">{upNextRating}</span>',
                '</div>',
                '</div>'
            ].join(''), data);
            if (!data) {
                console.error("data.img");
            }
            item.append(text);

            // NOT OVERLAYS ON LIVE TV - but we need this to set the play button event
            window.tnOverlays.init($(item).find('.main-content'));
            widget.resize();
        },

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

            //item.find('a.learnmore').on('click', function(event) {
            item.find('a.learnmore').on('tap', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-series-info');
            }).on('click', function(event) {
                event.preventDefault();
                Tn.setUrl($(this).attr("href"), true, 'page-series-info');
            });

            // set margins of row header title to be centered <=600 or to 0 if >600 
            adjustTitle(item);
        },

        rowRemoved: function() {},

        onRowResized: function(index, row) {
            //console.error("Row Resized", arguments);
            if (this.windowWidth < 600) {
                row.addClass('horizontal');
            } else {
                row.removeClass('horizontal');
            }

            //console.log('onRowResized');
            //console.log(row);
            if ($(window).width() <= 600) {
                var ht = row.height();
                row.height(ht);
            }
            // set margins of row header title to be centered <=600 or to 0 if >600 
            //adjustTitle(row);
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
        var title = thisHdr.find('.title');
        var titleHt = title.outerHeight();
        if (thisHdr.length > 0) {
            if ($(window).width() <= 600) {
                // we are adjusting the margin on the title to vertically center it
                // there could be multiple lines of title
                title.css('margin-top', (hdrHt - titleHt) / 2).css('margin-bottom', (hdrHt - titleHt) / 2);
            } else {
                thisHdr.find('.title').css('margin-top', '0').css('margin-bottom', '0');
            }
        }
    }

});


/*
     FILE ARCHIVED ON 17:29:48 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.476
  load_resource: 76.766
  PetaboxLoader3.resolve: 45.146
  PetaboxLoader3.datanode: 19.469
*/