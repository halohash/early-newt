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
     * Fetches the carousel data for shows and returns it back into the callback method
     */
    // we are not putting the tz here because it should be normalized at the server date to match the feeds
    normalizedDdateFormat: 'ddd MMM D HH:mm:ss YYYY',
    normalizedDdateZFormat: 'ddd MMM D HH:mm:ss Z YYYY',
    normalizedDateFormat: 'ddd MMM D YYYY',
    mapLocToLiveTv: {
        tnt: {
            'eastern': '/watchtnt/east.html',
            'central': '/watchtnt/east.html',
            'mountain': '/watchtnt/east.html',
            'pacific': '/watchtnt/west.html'
        },
        tbs: {
            'eastern': '/watchtbs/east.html',
            'central': '/watchtbs/east.html',
            'mountain': '/watchtbs/east.html',
            'pacific': '/watchtbs/west.html'
        }

    },
    mapLocToSchedFeed: {
        'eastern': '/schedule/est.json',
        'central': '/schedule/cst.json',
        'mountain': '/schedule/mst.json',
        'pacific': '/schedule/pst.json'
    },
    monthsNumtoTextMap: {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'

    },
    franchiseIdToPrettyUrlMap: {
        '329662': '/sports/mlb.html',
        '353686': '/shows/american-dad.html',
        '370312': '/shows/the-big-bang-theory.html',
        '370974': '/shows/the-cleveland-show.html',
        '369672': '/shows/conan.html',
        '407652': '/shows/conan.html',
        '386736': '/shows/cougar-town.html',
        '389092': '/shows/deal-with-it.html',
        '326836': '/shows/family-guy.html',
        '318003': '/shows/friends.html',
        '404096': '/shows/funniest-wins.html',
        '395712': '/shows/ground-floor.html',
        '385493': '/shows/king-of-the-nerds.html',
        '349405': '/shows/my-name-is-earl.html',
        '346624': '/shows/the-office.html',
        '314580': '/shows/seinfeld.html',
        '384612': '/shows/sullivan-son.html',
        '366554': '/shows/are-we-there-yet.html',
        '316820': '/shows/everybody-loves-raymond.html',
        '304646': '/shows/fresh-prince-of-bel-air.html',
        '304647': '/shows/full-house.html',
        '341564': '/shows/tyler-perrys-house-of-payne.html',
        '324455': '/shows/the-king-of-queens.html',
        '354689': '/shows/married-with-children.html',
        '359149': '/shows/meet-the-browns.html',
        '392273': '/shows/rules-of-engagement.html',
        '409592': '/shows/mom.html',
        '388094': '/shows/the-jeff-foxworthy-show.html',
        '402492': '/shows/americas-funniest-home-videos.html'
    },
    hideClass: 'tn-hidden',
    getScheduleData: function(url, imgPath, schedLoc, schedView, callback) {
        var useRetinaImg = window.tnVars.isRetinaScreen &&
            !(window.tnVars.isAndroid ||
                window.tnVars.isIPhone ||
                window.tnVars.isIPod ||
                window.tnVars.isIPad) ? true : false;

        // Use relative paths in debug environments
        if (url.toLowerCase().indexOf('http') === 0) {
            var tokens = url.split('/').slice(3);
            url = '/' + tokens.join('/');
        }

        // if the data has not changed, we want to update the carousel
        // TODO - relook at this
        if (Tn.scheduleData && !Tn.scheduleDataChanged) {
            callback(Tn.scheduleData.carousels, Tn.scheduleData.rowHdr);
            /*
            if(schedView === 'tile' && !Tn.scheduleViewChanged){
                callback(Tn.scheduleData.carousels, Tn.scheduleData.rowHdr);
            } else {
                callback(Tn.scheduleData.carousels, Tn.scheduleData.rowHdr);
            }
            */
            return;
        }
        var videoLinkLive = window.siteDefaults.name === 'TBS' ? Tn.mapLocToLiveTv.tbs[schedLoc] : Tn.mapLocToLiveTv.tnt[schedLoc];
        Tn.showPjaxSplash(true);
        $.getJSON(url).done(function(data) {

            Tn.scheduleData = {
                location: schedLoc, //dataType,
                carousels: [],
                rowHdr: []
            };

            //var tempHtml = '';
            $.each(data.dailySchedules, function(dayIndex, day) {
                var row = [];
                // tempHtml += Tn.fm('<div class="carousel" dow="{dow}" date="{date}">', {
                //     dow: day.dayOfWeek,
                //     date: day.dayOfMonth
                // });
                $.each(day.scheduleItems, function(showIndex, show) {
                    //var type = "show";
                    var type, hideIconClass = '';
                    if (show.titleType === 'E' || show.titleType === 'EA') {
                        type = 'show';
                    } else if (show.titleType === 'FF') {
                        type = 'movie';
                    } else {
                        type = 'sport';
                        //hideIconClass = Tn.hideClass;
                    }
                    var hideSeasonEpClass = show.seasonNo.length !== 0 ? '' : Tn.hideClass;
                    var epInfo = 'Season ' + show.seasonNo + ' | Episode ' + show.episodeNo + "   " + '<div class="smallRating">' + show.tvRating + '</div>';
                    var displayTitle, overlayTitleStr, overlaySpecs, epTitle = '';
                    var duration = show.duration;
                    var prettyUrl = show.prettyURL;
                    if (prettyUrl === '') {
                        var franchiseId = show.franchiseId;
                        prettyUrl = Tn.franchiseIdToPrettyUrlMap[franchiseId] ? Tn.franchiseIdToPrettyUrlMap[franchiseId] : prettyUrl;
                        //console.log('series level: ' + prettyUrl);
                    }

                    var hasPrettyUrlClass = typeof(prettyUrl) !== 'undefined' && prettyUrl.length !== 0 ? '' : Tn.hideClass;
                    var isPlayableClass = show.isPlayable ? '' : Tn.hideClass;
                    // most items in the schedule feed do not have prettyVideoUrl; so we need to do string replace for 
                    // both shows and movies
                    var videoLink = show.prettyURL.replace('/shows/', '/videos/').replace('/movies/','/videos/movies/');
                    //var videoLink = show.prettyVideoUrl;

                    // there are a few shows missing the tvRAting node
                    var tvRating = typeof(show.tvRating) !== 'undefined' ? show.tvRating : '';
                    var w = $(window).width();
                    if (show.duration === '-1') {
                        duration = '';
                    }
                    var timeStr = w < 480 ? ' mins' : ' minutes';
                    var marRight = w < 480 ? '8px' : '15px';
                    if (duration !== '') {
                        duration = duration + timeStr;
                    }

                    var listSE = '';
                    var listSEClass = 'tn-hidden';
                    if (type === 'show') {

                        //var sText = w < 480 ? 'S' : 'Season ';
                        //var eText = w < 480 ? 'E' : 'Episode ';
                        displayTitle = show.seriesName;
                        overlayTitleStr = '<span class="title">' + show.seriesName + '</span><span class="tv-rating">' + tvRating + '</span>';
                        overlaySpecs = '<div class="season"><span>S' + show.seasonNo + '</span></div><div class="ep"><span>E' + show.episodeNo + '</span></div><div class="time"><span>' + duration + '</span></div>';
                        listSE = 'S' + show.seasonNo + '|E' + show.episodeNo;
                        listSEClass = '';
                        overlaySpecs = show.seasonNo.length !== 0 ? overlaySpecs : '<div class="time" style="margin-left: 0; margin-right:' + marRight + '"><span>' + duration + '</span></div>';
                        epTitle = show.title;
                    } else  if (type === 'sport'){
                        displayTitle = show.title;
                        overlayTitleStr = '<span class="title truncation">' + show.seriesName + '</span>';
                        overlaySpecs = '<div class="time" style="margin-left: 0; margin-right:' + marRight + '"><span>' + duration + '</span></div><div class="tv-rating">' + tvRating + '</div>';
                        epInfo = '';
                        epTitle = show.title;
                        
                    } else  if (type === 'movie'){
                        displayTitle = show.title;
                        overlayTitleStr = '<span class="title">' + show.title + '</span>';
                        overlaySpecs = '<div class="time" style="margin-left: 0; margin-right:' + marRight + '"><span>' + duration + '</span></div><div class="tv-rating">' + tvRating + '</div>';
                    } else {
                        displayTitle = show.title;
                        overlayTitleStr = '<span class="title truncation">' + show.title + '</span>';
                        overlaySpecs = '<div class="time" style="margin-left: 0; margin-right:' + marRight + '"><span>' + duration + '</span></div><div class="tv-rating">' + tvRating + '</div>';
                        epInfo = '';
                        epTitle = '';
                        
                    }

                    // TODO: Pick the correct image from the carousel
                    var imgSrc = '';
                    var imgRetinaSrc = '';
                    if (show.images && show.images.length > 0) {
                        //img = show.images[0].srcUrl;
                        $(show.images).each(function() {
                            if (this.typeName === '445x250') {
                                imgSrc = this.srcUrl;
                            }
                            if (this.typeName === '890x500') {
                                imgRetinaSrc = this.srcUrl;
                            }
                        });
                    }
                    if (imgSrc === '') {
                        if (show.seriesImages && show.seriesImages.length > 0) {
                            //img = show.images[0].srcUrl;
                            $(show.seriesImages).each(function() {
                                if (this.typeName === '445x250') {
                                    imgSrc = this.srcUrl;
                                }
                                if (this.typeName === '890x500') {
                                    imgRetinaSrc = this.srcUrl;
                                }
                            });
                        }
                    }
                    if (useRetinaImg) {
                        if (imgRetinaSrc !== '') {
                            imgSrc = imgRetinaSrc;
                        }
                    }

                    if (imgSrc === '') {
                        imgSrc = Tn.spd.defaultImgPath;
                    } else {
                        imgSrc = Tn.spd.scheduleImagePath + "/" + imgSrc;
                    }
                    var now = moment().format(Tn.normalizedDateFormat);
                    var schedStartDate = moment(show.scheduleDate).format(Tn.normalizedDateFormat);
                    var isToday = false;
                    if (now === schedStartDate) {
                        isToday = true;
                    }

                    var isOnNow = show.whatsOnNowFlag;
                    var isSpotlight = show.spotlightFlag;
                    var onNowClass = isOnNow ? '' : Tn.hideClass;
                    var onNowClassList = isOnNow ? 'onnow' : '';
                    var displayString = isOnNow ? 'On Now' : '';
                    //isSpotlight = isOnNow ? true : false;
                    videoLink = isOnNow ? videoLinkLive : videoLink;


                    // if it is today, we do not want the 8pm slot to have the isSpotlight=true
                    // we want the on Now show to have the spotlight
                    // the isspotlight variable is used by the carousel to scrollto the correct tile at load
                    if (isToday) {
                        isSpotlight = false;
                        if (isOnNow) {
                            isSpotlight = true;
                            isPlayableClass = '';
                        }
                    }
                    if (isOnNow) {
                        console.log("isonnow: " + show.seriesName + " - " + show.title + " at " + show.displayTime);
                    }

                    row.push({
                        hideIconClass: hideIconClass,
                        isSpotlight: isSpotlight,
                        onNowClass: onNowClass, // TODO: Don't add extra dom elements that will just be hidden for all shows
                        onNowClassList: onNowClassList,
                        displayString: displayString,
                        titleid: parseInt(show.titleId, 10),
                        date: new Date(show.scheduleDate),
                        isPlayableClass: isPlayableClass,
                        showtime: show.displayTime,
                        avail: show.availableOn,
                        href: prettyUrl,
                        blurb: show.description.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;").replace(/(\r\n|\n|\r)/gm, "<br>"),
                        epinfo: epInfo,
                        title: show.seriesName.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        //epTitle: show.title.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        epTitle: epTitle.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        type: 'show',
                        seriesName: show.seriesName.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        overlayTitleStr: overlayTitleStr.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        displayTitle: displayTitle.replace(/\&/g, "&amp;").replace(/\'/g, "&#39;"),
                        overlaySpecs: overlaySpecs,
                        imgSrc: imgSrc,
                        duration: show.duration,
                        epInfoLink: prettyUrl,
                        videoLink: videoLink,
                        hasPrettyUrlClass: hasPrettyUrlClass,
                        hideSeasonEpClass: hideSeasonEpClass,
                        isPlayable: show.isPlayable,
                        tvRating: tvRating,
                        listSE: listSE,
                        listSEClass: listSEClass
                    });
                

                });

                // the month was writing correctly locally but incorrect on prod for 8/1...assuming this is a date monipulation issue
                // day.month is in the feed as the actual month number (not index) so i have mapped to that
                Tn.scheduleData.rowHdr.push({
                    dow: day.dayOfWeek,
                    month: Tn.monthsNumtoTextMap[day.month],
                    date: day.dayOfMonth
                });
                Tn.scheduleData.carousels.push(row);
            });

            //console.error(tempHtml);

            //console.error("Found rows", data);
            callback(Tn.scheduleData.carousels, Tn.scheduleData.rowHdr);

        }).fail(function() {
            Tn.alert("Failed to load schedule page");
        }).always(function() {
            Tn.showPjaxSplash(false);
        });
    },

    getTzOffsetForFeedChange: function() {
        var feedLoc = Tn.spd.scheduleLoc;
        var offset = 0;
        if (feedLoc === 'central') {
            offset = 60;
        } else if (feedLoc === 'mountain') {
            offset = 120;
        } else if (feedLoc === 'pacific') {
            offset = 180;
        }
        return offset;
    },

    updateScheduleFilter: function() {
        // set the radio button values
        // on the first page load the lastScheduleLoc/view are not populated before it comes to this
        var loc = typeof(Tn.lastScheduleLoc) !== 'undefined' ? Tn.lastScheduleLoc : Tn.spd.scheduleLoc;
        var view = typeof(Tn.lastScheduleView) !== 'undefined' ? Tn.lastScheduleView : Tn.spd.scheduleView;
        var page = Tn.getSchedulePage();
        page.find('.filter-menu .input-radio').removeClass('checked');
        page.find('.filter-menu .input-radio[data-value="' + loc + '"]').addClass('checked');
        page.find('.filter-menu .input-radio[data-value="' + view + '"]').addClass('checked');
    },

    getSchedulePageData: function(page) {
        var url = page.find('.scheduleFeedPath').text();

        // Grab our image base path
        var scheduleImagePath = page.find('.schedImagePath').text();
        // Grab our feed timezone location (eastern, western, pacific, central, mountain)
        var scheduleLoc = page.find('.scheduleLoc').text().toLowerCase();
        var serviceDomain = page.find('.serviceDomain').text();
        var feedSuffix = page.find('.feedSuffix').text();
        var defaultImgPath = page.find('.defaultEpisodeImagePath').text();
        var scheduleView = page.find('.scheduleView').text();

        // spd = schedule pagedata
        Tn.spd = {
            'scheduleFeedPath': url,
            'scheduleImagePath': scheduleImagePath,
            'scheduleLoc': scheduleLoc,
            'scheduleView': scheduleView,
            'serviceDomain': serviceDomain,
            'feedSuffix': feedSuffix,
            'defaultImgPath': defaultImgPath
        };

        //console.log("Tn.spd");
        //console.log(Tn.spd);
    },
    /**
     * [updateSchedulePageData get this from the page if the rest of the data has already been pulled by a different view]
     * @param  {[type]} page [description]
     * @return {[type]}      [description]
     */
    updateSchedulePageData: function(page) {
        var scheduleView = page.find('.scheduleView').text();
        Tn.spd.scheduleView = scheduleView;
    },
    getScheduleCallback: function(view, isCarouselUpdate) {
        var isUpdate = typeof(isCarouselUpdate) !== 'undefined' ? isCarouselUpdate : false;
        var cb = view === 'tile' ? Tn.carsouselCallback : Tn.listViewCallback;
        if (view === 'tile' && isUpdate) {
            cb = Tn.carsouselUpdateCallback;
        }
        return cb;
    },

    setScheduleFilterEvent: function(event) {
        event.preventDefault();
        // set the url based on the state of the radio buttons

        var thisInput = $(this).find('.input-radio');
        // data-change is either view or loc
        var changeType = thisInput.attr('data-change');
        var loc = changeType === 'loc' ? thisInput.attr('data-value') : Tn.spd.scheduleLoc;
        var view = changeType === 'view' ? thisInput.attr('data-value') : Tn.spd.scheduleView;
        var href, pageId;
        if (view === 'tile') {
            href = '/schedule/' + loc + '.html';
            pageId = 'page-schedule';
        } else {
            href = '/schedule/' + loc + '/list.html';
            pageId = 'page-schedule-list';
        }

        Tn.setUrl(href, false, pageId);
    },
    writeScheduleFilter: function(sel) {
        // TODO - make sure the correct radio buttons are selected
        // //<i class="fa fa-caret-up"></i>
        
        var page = Tn.getSchedulePage();
        if(page.find('.filter').length === 0){


            sel = typeof(sel) === 'undefined' ? page : sel;
            var text = Tn.fm([
                '<div class="filter">',
                '                <div class="hdr1" ><span>View</span><span class="caret"></span></div>',
                '                <ul class="filter-menu">',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="view" data-value="tile" ></div><div role="menuitem">Tile View</div></li>',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="view" data-value="list" ></div><div role="menuitem">List View</div></li>',
                '                    <div class="hdr2" role="menuitem"><span>Time Zone</span></div>',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="loc" data-value="eastern" ></div><div role="menuitem">Eastern</div></li>',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="loc" data-value="central" ></div><div role="menuitem">Central</div> </li>',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="loc" data-value="mountain" ></div><div role="menuitem">Mountain</div> </li>',
                '                    <li role="presentation"><div tabindex="-1" class="input-radio" data-change="loc" data-value="pacific" ></div><div role="menuitem">Pacific</div></li>',
                '                </ul>',
                '            </div>'

            ].join(''), Tn.spd);
           
            var isPhone = window.tnVars.isPhone();
            if(isPhone){
                page.find(sel).prepend(text);
            } else {
                page.append(text);
            }
            var filter = page.find('.filter');
            var arrow = filter.find("i.fa");
            if (!window.tnVars.isMobile()) {
                
                filter.on('mouseenter', function() {
                    $(this).find('.filter-menu').addClass('show');
                    $(arrow).removeClass("fa-caret-up").addClass("fa-caret-down");
                });

                filter.on('mouseleave', function() {
                    $(this).find('.filter-menu').removeClass('show');
                });
            }

            filter.find('.hdr1').on('touchstart', function(e) {
                e.preventDefault();
                filter.find('.filter-menu').toggleClass('show');
            });

            page.find('.filter-menu li[role="presentation"]').on('click', Tn.setScheduleFilterEvent);
            Tn.updateScheduleFilter();
        }
    },

    carsouselCallback: function(carousels, rowHdr) {
        var maxImageSize = 445;
        var bigMargins = 62;
        var smMargins = 25;
        var pixelsOfRowHdrHorizontal = 687;

        var isWindowScroll = false;
        var bufferH = window.tnVars.isMobile() ? 0 : 2;
        var bufferV = window.tnVars.isMobile() ? 1 : 2;

        Tn.writeScheduleFilter();
        //if(window.tnVars.isAndroid && !window.tnVars.isAndroidChrome){
        // for Android phones we want vertical buffer of 2
        //if( window.tnVars.isAndroid && !window.tnVars.isAndroidChrome && !window.tnVars.isAndroidTablet() ){
        if (window.tnVars.isAndroid && !window.tnVars.isAndroidTablet()) {
            bufferV = 2;
        }
        // for tablets we want vertical buffer of 1
        if (window.tnVars.isIPad || window.tnVars.isAndroidTablet()) {
            bufferV = 0;
        }

        // for ios and android browser...we make these all window scroll....chrome app can stay in overflow scroll
        //if(window.tnVars.isIOS() || (window.tnVars.isAndroid && !window.tnVars.isAndroidChrome) ){
        if (window.tnVars.isIOS() || window.tnVars.isAndroid) {
            $('#page-schedule').addClass('is-window-scroll');
            isWindowScroll = true;
        }

        $('#page-schedule').pageCarousel({

            itemCls: 'content-wrapper',

            carousels: carousels,
            rowHdr: rowHdr,

            // These values will be recalculated on screen resize to align everything
            tileWidth: 445,
            tileHeight: 250,

            bufferH: bufferH,
            bufferV: bufferV,
            isWindowScroll: isWindowScroll,
            useVerticalSnap: window.tnVars.isMobile() ? true : false,

            // Called whenever the window is resized, to give you a change to position everything
            onResize: function() {
                var width = $(window).width(),
                    cWidth = width,
                    items = 1;

                this.windowWidth = width;
                this.rowRightAdjustment = bigMargins;

                // Two items on medium screens

                // we need a top rowheader with tiles width around 688
                /* if (width > 687) {
                    items = 1.5;
                }
                */
                if (width > 1600) {
                    items = 4;
                } else if (width > 1400) {
                    items = 3;
                } else if (width > 1280) {
                    items = 2.5;
                } else if (width > 1100) {
                    items = 2;
                } else if (width > 900) {
                    items = 1.6;
                } else if (width > 770) {
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
                // this -328 allows the images to stay under 445px wide at 1280 res.
                if (width > pixelsOfRowHdrHorizontal) {
                    width -= 328;
                }

                // Calculate the width of an item
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
                var height = parseInt(width * 250 / 445, 10);
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

                //console.log(data.title + ' ' + data.titleid);
                // commenting out adding progressInd to schedule page for now...it was not there before
                /*
                if(data.isPlayable){
                    data.playStyle = Tn.buildProgressStyle(data.titleid, false);
                }
                */


                var text = Tn.fm([
                    '<div class="main-content" data-id="{titleid}" data-videohref="{videoLink}">',
                    '<div class="on-now {onNowClass}">{displayString}</div>',
                    '<div class="main playbut {isPlayableClass}"></div>',
                    '<img src="{imgSrc}" onerror="javascript:window.onShowOverlayError(this)" alt="{seriesName} - {title}" style="width:100%; height:100%;">',
                    '<div class="caption withleft">',
                    '    <div class="left-text">{showtime}</div>',
                    '    <div class="text-wrapper">',
                    '        <span class="title">{displayTitle}</span>',
                    '        <span class="subtitle {hideSeasonEpClass}">{epinfo}</span>',
                    '    </div>',
                    '</div>',
                    '<div class="icon-group2 {hideIconClass}">',
                    '    <div class="icon plus"></div>',
                    '    <div class="icon info {hasPrettyUrlClass}"></div>',
                    '</div>',
                    '<div class="info-overlay {type} {hideIconClass}">',
                    '   <div class="icon-group">',
                    '        <div class="icon plus"></div>',
                    '        <div class="icon info" data-href="{epInfoLink}"></div>',
                    '        <div class="icon playbut {isPlayableClass}"></div>',
                    '    </div>',
                    '    <div class="meta">',
                    '        <div class="above-fold">',
                    '           <div class="left-text">{showtime}</div>',
                    '           <div class="right-text">',
                    '            <div>{overlayTitleStr}</div>',
                    '            <div class="specs">{overlaySpecs}</div>',
                    '           </div>',
                    '        </div>',
                    '        <div class="below-fold">',
                    '            <div class="ep-title">',
                    '                <span>{epTitle}</span>',
                    '            </div>',
                    '            <div class="blurb truncate-h" style="word-wrap: break-word;">',
                    '                {blurb}<div class="more" data-href="{epInfoLink}" style="display: inline;">More...</div>',
                    '            </div>',
                    '        </div>',
                    '    </div>',
                    '</div>',
                    '</div>'
                ].join(''), data);
                item.append(text);
                window.tnOverlays.init(item.find('.main-content'));
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
                //rowHdr
                /*
                {
                    showTitle: hdr.children('h2[data-id="show-title"]').text(),
                    teaser: hdr.children('p[data-id="teaser"]').text(),
                    learnMoreHref: hdr.children('a[data-id="learn-more"]').attr('href')
                }
                <div class="timedate">
                <div class="dayname">Sunday</div>
                <div class="daynum">22</div>
                </div>
                */
                var hdr = Tn.fm([
                    '<div class="carousel-row-header timedate">',
                    '<div class="dayname">{dow}</div>',
                    '<div class="daynum">{date}</div>',
                    '</div><div class="rowloader show"></div>'
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

                item.addClass('hideloader');

                //item.find('a.learnmore').on('click', function(event) {
                item.find('a.learnmore').on('tap', function(event) {
                    event.preventDefault();
                    Tn.setUrl($(this).attr("href"), true, 'page-generic');
                }).on('click', function(event) {
                    event.preventDefault();
                    Tn.setUrl($(this).attr("href"), true, 'page-generic');
                });
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
                        window.tnOverlays.resizeOverlay(item);
                    });

                //}, 100);
        


                if ($(window).width() <= pixelsOfRowHdrHorizontal) {
                    var ht = row.height() + 50;
                    row.height(ht);
                    var rHdr = row.find('.carousel-row-header');
                    rHdr.width(this.windowWidth);
                }



                // set margins of row header title to be centered <=600 or to 0 if >600 
                adjustTitle(row);
            },
            onRowVisible: function(index, row) {
                var rowslider = row.find('.rowslider');
                var rWidth = rowslider.width();
                rowslider.width(rWidth + this.rowRightAdjustment);

                var w = $(window).width();
                var rHdr = row.find('.carousel-row-header');
                if (w <= pixelsOfRowHdrHorizontal) {
                    // i am not sure where the extra 20 px comes from
                    rHdr.width(w - 20);
                } else {
                    rHdr.width(186);
                }

            },
            onRowItemsAdded: function(row) {
                row.find('.rowloader').removeClass('show');
            }

        });

        function adjustTitle(row) {
            var thisHdr = row.find('.carousel-row-header');
            var hdrHt = thisHdr.height();
            var title = thisHdr.find('.title');
            var titleHt = title.outerHeight();
            if (thisHdr.length > 0) {
                if ($(window).width() <= pixelsOfRowHdrHorizontal) {
                    // we are adjusting the margin on the title to vertically center it
                    // there could be multiple lines of title
                    title.css('margin-top', (hdrHt - titleHt) / 2).css('margin-bottom', (hdrHt - titleHt) / 2);
                } else {
                    thisHdr.find('.title').css('margin-top', '0').css('margin-bottom', '0');
                }
            }
        }
    },
    carsouselUpdateCallback: function(carousels) {
        var page = $('#page-schedule');
        page.pageCarousel("updateCarousel", carousels);
        setTimeout(function() {
            page.pageCarousel("resize");
        }, 0);

    },

    listViewWriteDays: function(dateIndex) {
        var daysList = '';
        //var uniqueClass = 'row-' + dateIndex;
        var page = $('#page-schedule-list');
        var days = Tn.scheduleData.carousels[dateIndex];

        $(days).each(function(i) {
            daysList += Tn.fm([
                '<li class="{onNowClassList}">',
                '<div>',
                '<div class="theCol1">{showtime}</div>',
                '<div itemprop="name" class="collapseCols">',
                '<span itemprop="name" class="col-xs1-4 col-sm-4 col-md-4 col-lg-4 theCol2">{seriesName}&nbsp;</span>',
                '<span itemprop="name" class="col-xs1-6 col-sm-6 col-md-7 col-lg-7 theCol3">',
                '<span class="theEp {listSEClass}">{listSE}:&nbsp;</span>',
                '<span class="theTitle">{epTitle}</span>',
                '</span>',
                '<span itemprop="name" class="col-xs1-2 col-sm-2 col-md-1 col-lg-1 theCol4" >{tvRating}</span>',
                '</div>',
                '<div class="buttons2">',
                '<ul>',
                '<li class="{isPlayableClass}"><span data-type="video" class="playbutRef buttons playbutList" data-href="{videoLink}"><div class="glyphicon glyphicon-play"></div></span></li>',
                '<li>',
                '<span itemprop="url" class="moreList" data-href="{epInfoLink}" title="{epTitle}"><div>i</div></span>',
                '</li>',
                '</ul>',
                '</div>',
                '</div>',
                '</li>'
            ].join(''), days[i]);
        });

        var targetUl = page.find('.accordionContentNew[data-index="' + dateIndex + '"] ol');
        targetUl.append(daysList);
        var buttonsForEvent = targetUl.find('.buttons2 li').not('.tn-hidden');
        //console.log(buttonsForEvent);
        // this will set the events on the play and info buttons
        window.tnOverlays.init(buttonsForEvent);
    },

    listViewCallback: function(carousels, rowHdr) {
        console.log('listview');
        var page = $('#page-schedule-list');

        // if it is the first time coming to this page we will write the wrapper and the date list
        if (page.find('.shows-info').length === 0) {
            var contentWrapper = '<div class="shows-info"><div class="infobox"><div class="col-xs1-1 col-sm-1 col-md-1 col-lg-2"></div><div itemscope="" itemtype="https://web.archive.org/web/20141231172939/http://schema.org/TVEpisode" class="col-xs1-10 col-sm-10 col-md-10 col-lg-8 epleft2"><div class="scheduleHeader">Schedule</div></div></div></div>';
            page.append(contentWrapper);
            // adding filter
            if (window.tnVars.isPhone()) {
                Tn.writeScheduleFilter('.shows-info');
            } else {
                Tn.writeScheduleFilter();
            }
            var epleft2 = page.find('.epleft2');
            // we will loop through the carsouels and write the dates
            $(carousels).each(function(index) {
                var uniqueClass = 'row-' + index;
                var sectionHdr = Tn.fm([
                    '<div class="accordionButtonNew dd scheduleList__' + uniqueClass + '__" data-index="' + index + '" data-toggle="collapse" data-target=".accordionContentNew.extras.__' + uniqueClass + '__"><i class="fa fa-caret-up"></i>{dow}, {month} {date}</div>'
                ].join(''), rowHdr[index]);

                epleft2.append(sectionHdr);

                var dayContent = '<div class="accordionContentNew extras __' + uniqueClass + '__ collapse" data-index="' + index + '" data-associated-div=".scheduleList__' + uniqueClass + '__"><div class="schedulelist"><ol></ol></div></div>';
                epleft2.append(dayContent);
                // NOTE we are not writing out any shows here because we are triggering a click on the first date and
                // the schedule content will be written to the page at that time
            });

            Tn.setAccordionEvents(page);
            page.find('.accordionContentNew.collapse').first().collapse('show');

        } else {
            var firstAccord = page.find('.accordionContentNew').first();
            var isFirstOpen = firstAccord.hasClass('in');
            if (isFirstOpen) {
                // if the first one is open when the location changes, we put an event for when it completes the collapse
                // process to show the new content when it opens; then we hide all the collapsible sections
                firstAccord.one('hidden.bs.collapse', function() {
                    $(this).collapse('show');
                });
                page.find('.accordionContentNew.in').collapse('hide');
            } else {
                // if the first is not open, we hide all, then open the first with the new content
                page.find('.accordionContentNew.in').collapse('hide');
                firstAccord.collapse('show');
            }
        }
    },
    setAccordionEvents: function(page) {
        // FLIP ARROW ON ACCORDION

        page.find('.accordionContentNew').on('show.bs.collapse', function() {
            var that = this,
                associatedElClass = $(that).data("associated-div");

            // write the schedule for the day we are showing
            Tn.listViewWriteDays($(that).data('index'));
            $(associatedElClass).find("i.fa").removeClass("fa-caret-up").addClass("fa-caret-down");

        });
        page.find('.accordionContentNew').on('hide.bs.collapse', function() {
            var that = this,
                associatedElClass = $(that).data("associated-div");

            // empty the schedule for the day we are closing
            $(that).find('ol').empty();
            $(associatedElClass).find("i.fa").removeClass("fa-caret-down").addClass("fa-caret-up");
        });
    },
    getSchedulePage: function() {
        if (Tn.spd.scheduleView === 'tile') {
            return $('#page-schedule');
        } else {
            return $('#page-schedule-list');
        }
    }


});

$('body').on('pageshown', function(event, pageId) {
    if (pageId !== 'page-schedule' && pageId !== 'page-schedule-list') {
        return;
    }

    var page = $('#' + pageId);

    // The embedded schedule is not handled by this script
    if (page.hasClass('embedded')) {
        return;
    }

    // Page was already shown, so just call an update when the page is shown again
    if ((Tn.schedulePageInitialized && pageId === 'page-schedule') ||
        (Tn.scheduleListPageInitialized && pageId === 'page-schedule-list')) {

        // Figure out the location by the current page we're on
        var newloc, newView;
        switch (window.currentPageUrl) {
            case '/schedule/central.html':
                newloc = 'central';
                newView = 'tile';
                break;
            case '/schedule/mountain.html':
                newloc = 'mountain';
                newView = 'tile';
                break;
            case '/schedule/pacific.html':
                newloc = 'pacific';
                newView = 'tile';
                break;
            case '/schedule/central/list.html':
                newloc = 'central';
                newView = 'list';
                break;
            case '/schedule/mountain/list.html':
                newloc = 'mountain';
                newView = 'list';
                break;
            case '/schedule/pacific/list.html':
                newloc = 'pacific';
                newView = 'list';
                break;
            case '/schedule/eastern/list.html':
                newloc = 'eastern';
                newView = 'list';
                break;
            case '/schedule/list.html':
                newloc = 'eastern';
                newView = 'list';
                break;

            default:
                newloc = 'eastern';
                newView = 'tile';
        }

        // If the new location doesn't match our old location, we're going to refresh the schedule data
        // if the data has changed, the view has to be the same we can't change both at once
        var url, loc, view;
        if (newloc !== Tn.lastScheduleLoc) {
            Tn.lastScheduleLoc = newloc;
            loc = newloc;
            url = Tn.spd.serviceDomain + Tn.mapLocToSchedFeed[loc] + Tn.spd.feedSuffix;
            console.error("loc", loc);

            if (url && url.length > 0) {
                Tn.scheduleDataChanged = true;
                Tn.scheduleViewChanged = false;
                // here we want to reset the Tn.page variables
                $.extend(Tn.spd, {
                    'scheduleFeedPath': url,
                    'scheduleLoc': loc
                });

                // we are clearing the schedule data here
                // this will get new data and populate the same view
                if (Tn.lastScheduleView === 'tile') {

                    Tn.getScheduleData(url, Tn.scheduleImagePath, loc, Tn.scheduleView, function(carousels) {
                        page.pageCarousel("updateCarousel", carousels);
                        setTimeout(function() {
                            page.pageCarousel("resize");
                        }, 0);
                    });
                } else {
                    Tn.getScheduleData(url, Tn.scheduleImagePath, loc, Tn.scheduleView, Tn.listViewCallback);
                }

                Tn.updateScheduleFilter();
                Tn.scheduleDataChanged = false;
            }
        } else if (newView !== Tn.lastScheduleView) {
            Tn.lastScheduleView = newView;
            view = newView;
            loc = Tn.lastScheduleLoc;
            url = Tn.spd.serviceDomain + Tn.mapLocToSchedFeed[loc] + Tn.spd.feedSuffix;

            console.error("view", view);

            if (typeof(Tn.scheduleData) !== 'undefined') {
                Tn.scheduleViewChanged = true;
                Tn.scheduleDataChanged = false;

                // here we want to reset the Tn.page variables
                $.extend(Tn.spd, {
                    'scheduleView': view
                });

                //console.log("we should have new values now");
                //console.log(Tn.spd);
                /*
                    if the data is different than last time the tile has displayed, we want to send the update callback
                */
                var isCarouselUpdate = false;
                if ((view === 'tile') && (Tn.scheduleTileState.lastDisplayedLoc !== loc)) {
                    isCarouselUpdate = true;
                }
                Tn.getScheduleData(url, Tn.scheduleImagePath, loc, view, Tn.getScheduleCallback(view, isCarouselUpdate));
                Tn.updateScheduleFilter();
                Tn.scheduleViewChanged = false;
            }
        }

        if (pageId === 'page-schedule') {
            //page.pageCarousel("resize");
            page.pageCarousel("setYPos");
        }

        return;
    }

    if (!Tn.schedulePageInitialized && !Tn.scheduleListPageInitialized) {
        Tn.getSchedulePageData(page);
    } else {
        Tn.updateSchedulePageData(page);
    }

    // we are keeping the lastDisplayLoc for each view because the data may not have changec, but it may be different
    // then the last time a view was displayed
    // example... change the location to eastern in list and go to tile...data is same as list view but last time tile view was
    // displayed it was central
    if (pageId === 'page-schedule') {
        Tn.schedulePageInitialized = true;
        Tn.scheduleTileState = {
            'lastDisplayedLoc': Tn.spd.scheduleLoc
        };
    } else {
        Tn.scheduleListPageInitialized = true;
        Tn.scheduleListState = {
            'lastDisplayedLoc': Tn.spd.scheduleLoc
        };
    }

    // remove the jsp html from the page node
    page.empty();
    Tn.lastScheduleLoc = Tn.spd.scheduleLoc;
    Tn.lastScheduleView = Tn.spd.scheduleView;

    var scheduleCallback = Tn.getScheduleCallback(Tn.lastScheduleView);

    // adding filter
    //if(!window.tnVars.isMobile()){
        //Tn.writeScheduleFilter();
    //}
    

    // we want to set Tn.scheduleDataChanged here so if we switch the view to load for the first time, we can use existing data
    if (Tn.scheduleData && Tn.spd.scheduleLoc === Tn.lastScheduleLoc) {
        Tn.scheduleDataChanged = false;
        Tn.scheduleViewChanged = true;

    }

    Tn.getScheduleData(Tn.spd.scheduleFeedPath, Tn.spd.scheduleImagePath, Tn.spd.scheduleLoc, Tn.spd.scheduleView, scheduleCallback);

});




}

/*
     FILE ARCHIVED ON 17:29:39 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:39 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.63
  load_resource: 247.297
  PetaboxLoader3.resolve: 170.739
  PetaboxLoader3.datanode: 24.924
*/