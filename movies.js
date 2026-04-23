var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
$.extend(Tn, {
    /**
     * Given the page data, will parse the carousel data into carousels and their row headers
     * @param  {Object} pageData  jQuery object containing the DOM
     * @param  {Array} carousels The carousel row of items
     * @param  {Array} rowHdr    The row header result array
     */
    parseMovieCarousel: function(pageData, carousels, rowHdr) {
        function getTileItem(obj) {
            //console.log('getTileItem');

            var item = $(obj);
            var itemVars = item.find('span[data-id="vars"]'),
                playable = itemVars.attr('isPlayable') === 'true' ? true : false,
                duration = (parseInt(item.children('[data-id="duration"]').text(), 10)),
                availExpireHover = itemVars.attr("availExpireHover"),
                footerClass = availExpireHover.length === 0 ? 'tn-hidden' : '',
                contentTypeId = parseInt(itemVars.attr('contentTypeId'), 10),
                imgSrc = item.children('[data-id="img"]').attr("data-standard"),
                hideSpecsClass = '';

           if (useRetinaImg) {
                if (item.children('[data-id="img"]').attr("data-retina") !== '') {
                    imgSrc = item.children('[data-id="img"]').attr("data-retina");
                }
            }

            if (duration < 0) {
                duration = 0;
                hideSpecsClass = 'tn-hidden';
            }
            //var durationTxt = duration.toFixed(2) + " minutes";
            //var durationTxt = Math.ceil(duration) + " minutes";
            var durationTxt = Tn.formatDuration(duration);
            var notPlayableClass = '';
            if (!playable) {
                durationTxt = "";
                notPlayableClass = 'tn-hidden';
            }

            return {
                videoType: 'movie',
                titleid: itemVars.attr("titleid"),
                hideSpecsClass: hideSpecsClass,
                isPlayableClass: playable ? '' : 'tn-hidden',
                playable: playable ? true : false,
                contentTypeId: contentTypeId,
                availExpire: itemVars.attr("availExpire"),
                availExpireHover: availExpireHover,
                footerClass: footerClass,
                airOn: itemVars.attr("airOn"),
                blurb: item.children('[data-id="descr"]').text(),
                title: item.children('[data-id="title"]').text(),
                fullTitle: itemVars.attr("fullTitle"),
                imgSrc: imgSrc,
                duration: durationTxt,
                infoLink: item.children('[data-id="info-href"]').attr("href"),
                videoLink: item.children('[data-id="video-href"]').attr("href"),
                notPlayableClass: notPlayableClass
            };
        }

        var w = $(window).width();
        // we are passing in the onlyPhones boolean
        var useRetinaImg = window.tnVars.isRetinaScreen &&
            !(window.tnVars.isAndroid ||
            window.tnVars.isIPhone ||
            window.tnVars.isIPod ||
            window.tnVars.isIPad) ? true : false;



        pageData.each(function() {
            var row = [];
            var oddRowItems = $(this).find('div.odd div.item');
            var evenRowItems = $(this).find('div.even div.item');

            var oddLength = oddRowItems.length;
            var evenLength = evenRowItems.length;

            for (var i = 0; i < oddLength; i++) {
                var tile = [];
                tile.push(getTileItem(oddRowItems[i]));
                if (i < evenLength) {
                    tile.push(getTileItem(evenRowItems[i]));
                }
                row.push(tile);

            }

            while (row.length < 3) {
                row.push({
                    isPlaceholder: true
                });
            }
            carousels.push(row);
            $(this).remove();
        });
    },

    /**
     * Fetches the carousel data for movies and returns it back into the callback method
     */
    getMovieCarouselData: function(callback, hideSplash) {
        if (Tn.movieData) {
            callback(Tn.movieData.carousels, Tn.movieData.rowHdr);
            return;
        }
        if (!hideSplash) {
            Tn.showPjaxSplash(true);
        }
        $.ajax({
            url: '/movies/',
            dataType: 'text'
        }).done(function(data) {
            data = $.parseHTML("<div>" + data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0] + "</div>", document, false);
            var page = $(data).find('#page-movies .carousel');
            if (page.length === 0) {
                Tn.alert("Show page not found");
            } else {
                Tn.movieData = {
                    carousels: [],
                    rowHdr: []
                };
                Tn.parseMovieCarousel(page, Tn.movieData.carousels, Tn.movieData.rowHdr);
                callback(Tn.movieData.carousels, Tn.movieData.rowHdr);
            }
        }).fail(function() {
            Tn.alert("Failed to load show page");
        }).always(function() {
            Tn.showPjaxSplash(false);
        });
    },
    initializeMovieOverlay: function(item, data, useAltTemplate) {
        if (data.isPlaceholder) {
            item.append('<div class="main-content"><img src="https://web.archive.org/web/20141231172946/http://placehold.it/445x250/000000&text=PLACEHOLDER" style="width:100%; height:100%;"></div>');
            return;
        }

        var text = '',
            template = (useAltTemplate)?movieItemTemplate:Tn.movieItemTemplate2; 
        // Update the progress on the play button
        data.playStyle = Tn.buildProgressStyle(data.titleid, false);

        text += Tn.fm(template, data);


        if (!data) {
            console.error("data.img");
        }
        item.append(text);
        item.find('.main-content').each(function() {
            window.tnOverlays.init($(this));
        });
    },
    movieItemTemplate2: '<div class="main-content" id="id-{titleid}" data-id="{titleid}" data-videohref="{videoLink}">' +
                    '<div class="main playbut {isPlayableClass}" data-id="{titleid}" {playStyle}></div>' +
                    '<img src="{imgSrc}" onerror="javascript:window.onShowOverlayError(this)" style="width:100%; height:100%;">' +
                    '<div class="caption">' +
                        '<div class="text-wrapper">' +
                            '<span class="title">{title}</span>' +
                            '<span class="availexpire">{availExpire}</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="icon-group2">' +
                        '<div class="icon plus"></div>' +
                        '<div class="icon info"></div>' +
                    '</div>' +
                    '<div class="info-overlay">' +
                        '<div class="icon-group">' +
                            '<div class="icon plus"></div>' +
                            '<div class="icon info" data-href="{infoLink}"></div>' +
                            '<div class="icon playbut {isPlayableClass}"></div>' +
                        '</div>' +
                        '<div class="meta">' +
                            '<div class="above-fold">' +
                                '<div class="title">' +
                                    '<span>{fullTitle}</span>' +
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
                                '<div class="blurb truncate-h" style="">' +
                                    '{blurb}<div class="more" data-href="{infoLink}" style="display: inline;">More...</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="footer {footerClass}">' +
                                '<span class="availexpire">{availExpireHover}</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
});


$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-movies') {
        return;
    }
    // Page was already shown, so just call an update when the page is shown again
    if (Tn.moviesPageInitialized) {
        //$('#page-movies').pageCarousel("resize");
        $('#page-movies').pageCarousel("setYPos");
        return;
    }

    Tn.moviesPageInitialized = true;
    var headerHeight, carousels = [], rowHdr = [];
    var useRetinaImg = window.tnVars.isRetinaScreen &&
            !(window.tnVars.isAndroid ||
            window.tnVars.isIPhone ||
            window.tnVars.isIPod ||
            window.tnVars.isIPad) ? true : false;
    /*
        for movies there is 1 row that has 2 movies stacked in each tile
        the data is coming as odd (toprow) and even (bottom row) so we need to get 1 movie
        from each to make up the tile; the order is specific tile1(odd[0]/even[0]), tile2(odd[1]/even[1])

     */

    Tn.parseMovieCarousel($('#page-movies .carousel'), carousels, rowHdr);

    var isWindowScroll = false;
    if(window.tnVars.isIOS() || window.tnVars.isAndroid ){
        $('#page-movies').addClass('is-window-scroll');
        isWindowScroll = true;
    }

    $('#page-movies').pageCarousel({
        itemCls: 'content-wrapper',

        carousels: carousels,
        useVerticalSnap: false,
        // These values will be recalculated on screen resize to align everything
        tileWidth: 640,
        tileHeight: 360,
        isWindowScroll: isWindowScroll,

        bufferH: window.tnVars.isMobile() ? 2 : 2,

        // Called whenever the window is resized, to give you a change to position everything
        onResize: function() {
            var width = $(window).width(),
                cWidth = width,
                items = 1,
                page = $('#page-movies');

            this.windowWidth = width;
            var maxImageSize = 445;
            var marginDecreaseWidth = 496;


            if (cWidth <= marginDecreaseWidth) {
                this.rowRightAdjustment = 25;
            } else {
                this.rowRightAdjustment = 62;
            }

            // 496 is the width the margins cut to 25px
            // above 496 they are 62 px



            // the rules here are, there are only w items, they should not be bigger than 445px wide
            // when we are displaying 2, they should be horizontally centered in the middle of the view

            // to account for margins with arrows
            items = width / maxImageSize;

            // Calculate the width of an item
            //width = parseInt((width - 5) / items, 10);
            // here we are trying to size the images so when the last image is fully visible on the right, the left image is correctly
            // hidden by the arrow on the left
            width = parseInt((width) / items, 10);
            if (cWidth > maxImageSize && cWidth <= (maxImageSize + this.rowRightAdjustment * 2 - 10)) {
                width = cWidth - 50;
            } else if (cWidth <= maxImageSize) {
                // width = width + 5;
                //width = width + 5;
                // if the screen width is less than 445, we use the screen width
                width = cWidth - 50;
            }

            // Calculate the height of an item
            var height = parseInt((width * 250 / maxImageSize) * 2, 10);
            if (height < 32) {
                height = 32;
            }
            if (width < 32) {
                width = 32;
            }

            // Calculate the tile width and height
            this.tileWidth = width;
            this.tileHeight = height;
            //this.items = items;


            if (!headerHeight) {
                headerHeight = $('header').height();
            }
            //var heightOriginal = $(window).height() - headerHeight - 20;
            // i removed the verticalslider margin so we don't need to subtract the 20 px anymore
            var heightOriginal = $(window).height() - headerHeight;
            if (this.windowWidth > 600) {
                heightOriginal -= $('footer').is(':visible') ? $('footer').height() : 0;
            }

            var topMargin = (heightOriginal - height) / 2;
            if (topMargin < 0) {
                topMargin = 0;
            }
            page.css('margin-top', topMargin);

        },

        // Called to grab the size of an item in the carousel
        // If you have ads in the carousel, you have to specify the size of the ad, instead of the carousel dimensions
        getItemDimensions: function() { /*carousel, index, data*/
            // Return the responsive tile width and heights
            return {
                w: this.tileWidth,
                h: this.tileHeight
            };
        },

        // Called when an item is lazily added
        addItem: function(item, index, data) {
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                Tn.initializeMovieOverlay(item, d);
            }
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
            //adjustTitle(item);
        },

        rowRemoved: function() {},

        onRowResized: function(index, row) {
            //console.error("Row Resized", arguments);


            if (this.windowWidth < 600) {
                row.addClass('horizontal');
            } else {
                row.removeClass('horizontal');
            }

            ///web.archive.org/web/20141231172946/http://console.log('onRowResized');
            //console.log(row);
            // the timeout is here so the row ahs time to finish writing to the page resized before the resizeOverlay is called
            //setTimeout(function() {
                row.find('.carousel-row-item.active').find('.main-content').each(function() {
                    var item = $(this);
                    window.tnOverlays.resizeOverlay(item);
                });

            //}, 0);

            if ($(window).width() <= 600) {
                var ht = row.height();
                row.height(ht);
            }
        },

        onRowVisible: function(index, row) {
            //var rowslider = row.find('.rowslider');
            //var rWidth = rowslider.width();
            //rowslider.width(rWidth + this.rowRightAdjustment);
        }
    });

});
}

/*
     FILE ARCHIVED ON 17:29:46 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:41 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.327
  load_resource: 141.259
  PetaboxLoader3.resolve: 51.634
  PetaboxLoader3.datanode: 67.852
*/