var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function($, window, document, undefined) {
    var IScroll = window.IScroll,
        pluginName = 'pageCarousel',
        uid = 1,
        defaults = {
            carousels: [],
            //lazyLoadTimeout: window.tnVars.isMobile() ? 100 : 50,
            lazyLoadTimeout: 150,
            //loadDelay: 50,
            scrollDelay: 100,
            vScrollDelay: window.tnVars.isMobile() ? 100 : 50,
            bufferH: window.tnVars.isMobile() ? 0 : 1,
            bufferV: window.tnVars.isMobile() ? 0 : 1,
            pxInViewAmount: 20,
            isMobile: window.tnVars.isMobile(),
            isWindowScroll: false,
            useVerticalSnap: false,
            alwaysRefreshHScrollOnResize: false
        };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    function fm(txt) {
        var i, reg;
        // Check to see if we're using named value pairs
        if(arguments.length === 2 && typeof arguments[1] === 'object') {
            $.each(arguments[1], function(key, value) {
                reg = new RegExp("\\{" + key + "\\}", "gm");
                txt = txt.replace(reg, value);
            });
            return txt;
        }
        // We have a list of parameters, so traverse the list
        for(i = 1; i < arguments.length; i++) {
            reg = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            txt = txt.replace(reg, arguments[i]);
        }
        return txt;
    }
    Plugin.prototype = {
        init: function() {
            var me = this;
            var id = "main-carousel-" + (uid++);
            me.$el = $(fm('<div class="verticalslider" id="{id}"></div>', {
                id: id
            }));

            if(me.options.isWindowScroll){
                if( $(document).scrollTop() !== 0){
                    //console.log('init: scroll to 0');
                    $(me.element).attr('ypos','0');
                }
            }
            

            //me.lastScrollHeight = -999;
            //me.$rows = [];
            me.lastYScrollChangeTime = new Date().getTime();
            //console.log('INIT: lastYScrollChangeTime set to', me.lastYScrollChangeTime);
            me.updateCarousel(this.options.carousels);
            me.$rows = me.$el.find('>div.carousel-row');
            // we always want the verticalslider to be first child of page.maincarousel
            $(this.element).removeClass('carousel-loading').prepend(me.$el).addClass('pagecarousel');
            // mobile scrolls from the window and desktop scrolls from the carousel page element
            me.vPageScrollElem = me.options.isWindowScroll ? document : me.element;
            //me.vPageScrollElem = me.options.isWindowScroll ? document : (me.options.isMobile ? me.$el.get(0) : me.element);
            //me.lastVScrollFireTime = 0;
            //me.lastY = $(me.element).scrollTop();
            //
            // if we need to add functionality where the page is scrolled down the y axis we will need to adjust
            me.lastYSnapInd = 0;
            me.isSnap = false;
            me.elementId = $(me.element).attr('id');
            me.hasPageChanged = false;
            me.velocityYDataPoints = [];
            //me.lastTouchMoveFireTime = 0;
            //me.lastYScrollPos = $(document).scrollTop();
            me.lastYScrollPos = 0;
            // for window scroll devices we will set the document to the top when the carousel is initialized
            // if we are revisiting a page, the scrolltop is executed in framework > finalize page
            // not all mobile carousel pages are windowscroll - currently live tv is not
            if(me.options.isWindowScroll){
                $(document).scrollTop(0);
            }

            me.lastYScrollVelocityArr = [];
            me.isYScrolling = false;
            me.yDirection = 'down';
            me.weArePossiblyDoingLazyLoadingYWork = false;
            me.weArePossiblyDoingLazyLoadingXWork = false;
            // we are scrolling the document so we want to get the starting offset between the top of the carsouel 
            // element and the document scrollTop
            me.elementOffset = $(me.element).offset().top - $(document).scrollTop();
            //$('body').prepend('<div id="androidMsg">Hi</div');
            setTimeout($.proxy(me.resize, me), 100); // This is where the page first gets painted
            $(window).resize($.proxy(me.resize, me));
            $(window).on('orientationchange', $.proxy(me.resize, me));
            // this will monitor the Y/X positions and will go to updateVerticalVisibility/updateHorizontalVisibility if it has changed
            // This is equivalent to lazyLoadWatcher but make iOS more responsive since inertia and deceleration is not something we can capture
            if(window.tnVars.isIOS()) { // TODO: Dispose of these on the next page
                $('body').on({
                    'touchstart': function(event) {
                        me.swipeStartX = me.getClientPos(event, 'X');
                        me.swipeStartY = me.getClientPos(event, 'Y');
                        me.weArePossiblyDoingLazyLoadingYWork = false;
                        me.weArePossiblyDoingLazyLoadingXWork = false;
                    }
                });

                $('body').on({
                    'touchmove': function(event) {
                        // This is equivalent to lazyLoadWatcher but make iOS more responsive since inertia and deceleration is not something we can capture
                        if(me.$rows.length === 0) { // This should not happen in theory but is key to making the site work so adding it anyway
                            me.$rows = me.$el.find('>div.carousel-row');
                        }
                        //TODO: we may be overloading so make sure we are done before the next call.  If we are not done, setTImeout in case we loose it

                        var theClientX = me.getClientPos(event, 'X'),
                            theClientY = me.getClientPos(event, 'Y'),
                            horizontalDelta = Math.abs(theClientX - me.swipeStartX),
                            verticalDelta = Math.abs(theClientY - me.swipeStartY);
                        if(me.$rows.length > 0) {
                            me.lastYScrollChangeTime = new Date().getTime();
                            //console.log('touchmove: me.lastYScrollChangeTime set to ', me.lastYScrollChangeTime, ' top = ' + $(me.vPageScrollElem).scrollTop());
                            if(verticalDelta > horizontalDelta) {
                                setTimeout($.proxy(me.lazyLoadWatchYEased, me), 0);
                            } else {
                                setTimeout($.proxy(me.lazyLoadWatchRowsEased, me), 0);
                            }
                        } else {
                            //console.log('------------touchmove: wouldnt exoect to be here');
                        }
                    }
                });

                $('body').on({
                    'scroll': function(event) {
                        // This is equivalent to lazyLoadWatcher but make iOS more responsive since inertia and deceleration is not something we can capture
                        if(me.$rows.length === 0) { // This should not happen in theory but is key to making the site work so adding it anyway
                            me.$rows = me.$el.find('>div.carousel-row');
                        }
                        //TODO: we may be overloading so make sure we are done before the next call.  If we are not done, setTImeout in case we loose it

                        setTimeout($.proxy(me.lazyLoadWatchYEased, me), 0);
                        setTimeout($.proxy(me.lazyLoadWatchRowsEased, me), 0);
                        //console.log('scroll event: ' + ((new Date).getTime()) + ' top = ' + $(me.vPageScrollElem).scrollTop());
                    }
                });
                $('body').on({
                    'touchend': function(event) {
                        // This is equivalent to lazyLoadWatcher but make iOS more responsive since inertia and deceleration is not something we can capture
                        if(me.$rows.length === 0) { // This should not happen in theory but is key to making the site work so adding it anyway
                            me.$rows = me.$el.find('>div.carousel-row');
                        }
                        //TODO: we may be overloading so make sure we are done before the next call.  If we are not done, setTImeout in case we loose it

                        setTimeout($.proxy(me.lazyLoadWatchYEased, me), 0);
                        setTimeout($.proxy(me.lazyLoadWatchRowsEased, me), 0);
                        //console.log('touchend: ' + ((new Date).getTime()) + ' top = ' + $(me.vPageScrollElem).scrollTop());
                    }
                });
            } else {
                me.lazyLoadWatcher(true);
            }


        },
        getClientPos: function(event, posDir) {
            var theEvent = (event.originalEvent) ? event.originalEvent : event,
                clientPos;
            if(theEvent.changedTouches && theEvent.changedTouches[0]) {
                clientPos = theEvent.changedTouches[0]['client' + posDir];
            } else if(theEvent['client' + posDir]) {
                clientPos = theEvent['client' + posDir];
            }
            return clientPos;
        },
        destroy: function(scroller) {
            return;
            if(scroller && typeof(scroller) === 'object') {
                scroller.destroy();
                scroller = null;
            } else if(this.scroller && typeof(this.scroller) === 'object') {
                this.scroller.destroy();
                this.scroller = null;
            }
        },
        /** The plan is not tot call this on iOS and mobile later **/
        lazyLoadWatcher: function(initial) {
            var me = this;
            if(me.lazyLoadTimer) {
                clearTimeout(me.lazyLoadTimer);
                delete me.lazyLoadTimer;
            }
            if(me.$rows.length === 0) { // This should not happen in theory but is key to making the site work so adding it anyway
                me.$rows = me.$el.find('>div.carousel-row');
            }
            try {
                if(me.$rows) {
                    me.lazyLoadWatchY(initial);
                    me.lazyLoadWatchRows();
                }
            } catch(e) {
                //console.log('no lazyloading'); // catch all to keep the lazyLoadWatcher going
            }
            // TODO - set timeout interval different for desktop vs mobile
            me.lazyLoadTimer = setTimeout($.proxy(me.lazyLoadWatcher, me), me.options.lazyLoadTimeout);
        },
        /** The plan is this function will only be caled by iOS in a attempt to minimize work on the client **/
        lazyLoadWatchRowsEased: function() {
            var me = this;
            if(me.weArePossiblyDoingLazyLoadingXWork !== true) {
                me.weArePossiblyDoingLazyLoadingXWork = true;
                me.lazyLoadWatchRows();
            } else {
                if(me.lazyLoadWatchRowsTimer) {
                    clearTimeout(me.lazyLoadWatchRowsTimer);
                    delete me.lazyLoadWatchRowsTimer;
                }
                //TODO: meRow.horizontalVisibilityTimer = setTimeout($.proxy(function(meRow){ 
                //  var me=this;me.updateHorizontalVisibility(meRow);
                //  me.workingOnHorizontal = false; }, me, meRow, true), 500); 
                //  Also put me.workingOnHorizontal = false after every call to updateHorizontalVisibility so we are not overdoing it

                me.lazyLoadWatchRowsTimer = setTimeout($.proxy(me.lazyLoadWatchRows, me, true), 500);
            }
        },
        /** This is called on a interval.  We will keep track of position vs time ( velocity ) to determine if we need to insert images **/
        lazyLoadWatchRows: function(calledAsFallback) {
            var me = this;
            // Turn on iScrolls: Hopefuly this is cheap enough to do on a interval
            if(me.lazyLoadWatchRowsTimer) {
                clearTimeout(me.lazyLoadWatchRowsTimer);
                delete me.lazyLoadWatchRowsTimer;
            }
            //console.log('lazyLoadWatchRows called');
            me.$rows.each(function() {
                //me.lazyLoadWatchRow($row);
                var $row = $(this),
                    rowId = $row[0].id,
                    meRow = me.rows[rowId],
                    rowIsViewable = $row.hasClass('isviewable'),
                    rowHasIscroller = (meRow && meRow.scroller && typeof(meRow.scroller) === 'object'),
                    dataPoint1, dataPoint2, xVelocity;

                if(rowIsViewable && rowHasIscroller && meRow.scroller.x !== meRow.lastX) {
                    // Update row as a fallback or when swipe stops suddenly at top or bottom
                    if(meRow.horizontalVisibilityTimer) {
                        clearTimeout(meRow.horizontalVisibilityTimer);
                        delete meRow.horizontalVisibilityTimer;
                    }
                    //TODO: meRow.horizontalVisibilityTimer = setTimeout($.proxy(function(meRow){ 
                    //  var me=this;me.updateHorizontalVisibility(meRow);
                    //  me.workingOnHorizontal = false; }, me, meRow, true), 500); 
                    //  Also put me.workingOnHorizontal = false after every call to updateHorizontalVisibility so we are not overdoing it
                    meRow.lastX = meRow.scroller.x;
                    meRow.velocityXDataPoints.push({
                        x: meRow.lastX,
                        time: (new Date().getTime())
                    });
                    if(!calledAsFallback) {
                        meRow.horizontalVisibilityTimer = setTimeout($.proxy(me.updateHorizontalVisibility, me, meRow, true), 500);
                        //console.log('!!!!! call updateHorizontalVisibility  timeout for ' + meRow.item.get(0).id + ' with timerid' + meRow.horizontalVisibilityTimer); 
                        if((meRow.velocityXDataPoints && meRow.velocityXDataPoints.length > 1) || calledAsFallback) {
                            dataPoint1 = meRow.velocityXDataPoints[(meRow.velocityXDataPoints.length - 2)];
                            dataPoint2 = meRow.velocityXDataPoints[(meRow.velocityXDataPoints.length - 1)];
                            xVelocity = (dataPoint1.x - dataPoint2.x) / (dataPoint1.time - dataPoint2.time);
                            //console.log('xVelocity=' + xVelocity);
                            if(Math.abs(xVelocity) < 2.2) {
                                //console.log('call updateHorizontalVisibility from lazyLoadWatchRows');
                                me.updateHorizontalVisibility(meRow);
                            }
                        }
                    } else {
                        //console.log('call updateHorizontalVisibility since we have waited long enough');
                        me.updateHorizontalVisibility(meRow);
                    }
                } else if(typeof(meRow) === 'object') {
                    meRow.velocityXDataPoints = [];
                }
            });
            me.weArePossiblyDoingLazyLoadingXWork = false;
        },
        /** The plan is this function will only be caled by iOS in a attempt to minimize work on the client **/
        lazyLoadWatchYEased: function() {
            var me = this;
            //console.log('lazyLoadWatchYEased: called');
            if(me.weArePossiblyDoingLazyLoadingYWork !== true) {
                //console.log('lazyLoadWatchYEased: continue');
                me.weArePossiblyDoingLazyLoadingYWork = true;
                me.lazyLoadWatchY();
            } else {
                //console.log('lazyLoadWatchYEased: wait');
                // Need to make sure it is called one last time if the last one that ran is not sufficient.  Let's wait a little and then do work
                if(me.verticalVisibilityTimer) {
                    clearTimeout(me.verticalVisibilityTimer);
                    delete me.verticalVisibilityTimer;
                }
                me.verticalVisibilityTimer = setTimeout($.proxy(me.updateVerticalVisibilityAsFallback, me, true), 500);
            }
            //console.log('lazyLoadWatchYEased: ended');
        },
        lazyLoadWatchY: function(initial) {
            var me = this,
                dataPoint1, dataPoint2, yVelocity, okToUpdate = false;

            // if the .page element is hidden we do not want to process it
            if($(me.element).css('display') === 'none'){
                return;
            }
            
            // mobile scrolls from the window and desktop scrolls from the carousel page element
            var yPos = $(me.vPageScrollElem).scrollTop(),
                now = new Date().getTime(),
                deltaTime = now - me.lastYScrollChangeTime + 1; // Add 1 to avoid divide by zero
            if(deltaTime > 2600) {
                //console.log('lazyLoadWatchY: lastYScrollChangeTime reset', me.lastYScrollChangeTime , (now - me.lastYScrollChangeTime ));
                me.velocityYDataPoints = [];
            }
            //console.log('lazyLoadWatchY: called');
            //console.log('yPos=' + yPos + ' me.lastYScrollPos=' + me.lastYScrollPos);
            //var yPos = (me.options.useVerticalSnap && me.options.isMobile) ? $(me.vPageScrollElem).position().top : $(me.vPageScrollElem).scrollTop();
            if(me.lastYScrollPos !== yPos || me.isYScrolling) { // If we suddenly stopped scrolling it should still update
                me.isYScrolling = true;

                if(me.lastYScrollPos === yPos) { // We want updates to happen at least once if isYScrolling suddenly stopped
                    me.isYScrolling = false;
                }
                me.yDirection = (me.lastYScrollPos < yPos)?'down':'up';
                me.lastYScrollPos = yPos;
                me.velocityYDataPoints.push({
                    y: yPos,
                    time: now
                });
                me.lastYScrollChangeTime = now;
                //console.log('lazyLoadWatchY: lastYScrollChangeTime changed to', me.lastYScrollChangeTime );
                // Update row as a fallback or when swipe stops suddenly at top or bottom
                if(me.verticalVisibilityTimer) {
                    clearTimeout(me.verticalVisibilityTimer);
                    delete me.verticalVisibilityTimer;
                }
                me.verticalVisibilityTimer = setTimeout($.proxy(me.updateVerticalVisibilityAsFallback, me, true), 500);
                //console.log('lazyLoadWatchY: fire verticalVisibilityTimer!!!' + me.velocityYDataPoints.length);
                if(me.velocityYDataPoints && me.velocityYDataPoints.length >= 1) {
                    //console.log('lazyLoadWatchY: me.velocityYDataPoints.length >= 1');
                    if(me.velocityYDataPoints.length === 1) {
                        //dataPoint1 = me.velocityYDataPoints[(me.velocityYDataPoints.length - 1)];
                        yVelocity = yPos / deltaTime;
                    } else {
                        dataPoint1 = me.velocityYDataPoints[(me.velocityYDataPoints.length - 2)]; // Use the last two data points for calculations.
                        dataPoint2 = me.velocityYDataPoints[(me.velocityYDataPoints.length - 1)];
                        try {
                            yVelocity = (dataPoint1.y - dataPoint2.y) / (dataPoint1.time - dataPoint2.time);
                        } catch(e) {
                            console.log('yVelocity error' + e);
                        }
                    }
                    //console.log('yVelocity=' + yVelocity);
                    if(Math.abs(yVelocity) < 2.2 || !me.isYScrolling) {
                        //console.log('lazyLoadWatchY: velocity okToUpdate:', Math.abs(yVelocity), (!me.isYScrolling));
                        okToUpdate = true;
                    }
                } else if(!me.isYScrolling) {

                    //console.log('lazyLoadWatchY: !me.isYScrolling');
                    okToUpdate = true; // We want updates to happen at least once if isYScrolling suddenly stopped
                }
                if(okToUpdate) {
                    //console.log('updateYYRow!');
                    me.updateVerticalVisibility();
                    me.updateIScrolls();
                } else {
                    //console.log('DONT updateYYRow!||||', me.velocityYDataPoints.length, me.isYScrolling);
                }
            } else {
                //console.log('clear velocityYDataPoints', me.lastYScrollPos, yPos, me.isYScrolling);
                //me.velocityYDataPoints = [];
            }
            me.weArePossiblyDoingLazyLoadingYWork = false;
            //console.log('lazyLoadWatchY: ended');
        },
        updateVerticalVisibilityAsFallback: function(scrollTimeOut) {
            var me = this;
            if(me.verticalVisibilityTimer) {
                clearTimeout(me.verticalVisibilityTimer);
                delete me.verticalVisibilityTimer;
            }
            if(scrollTimeOut) {
                //console.log('Fallback: waiting for yscroll to stop timed out.');
            }
            me.updateVerticalVisibility();
            me.updateIScrolls();
            me.weArePossiblyDoingLazyLoadingYWork = false;
        },
        updateIScrolls: function() {
            var me = this;
            // This could happen after clearing me.$rows in updateCarousel
            if(me.$rows.length === 0) {
                me.$rows = me.$el.find('>div.carousel-row');
            }
            me.$rows.each(function() {
                var $row = $(this),
                    rowId = $row[0].id,
                    meRow = me.rows[rowId],
                    rowIsViewable = $row.hasClass('isviewable'),
                    rowHasIscroller = (meRow && meRow.scroller && typeof(meRow.scroller) === 'object');
                //If row is in view and no iScroll currently on row
                //console.log('updateIScrolls called');
                if(rowIsViewable && !rowHasIscroller && meRow) {
                    //console.log('create iScroll');
                    var scroller = new IScroll('#' + rowId, {
                        eventPassthrough: true,
                        scrollX: true,
                        scrollY: false,
                        //preventDefault: false,
                        //mouseWheel: true,
                        //click: true,
                        momentum: false,
                        //tap: true,
                        snap: '.carousel-row-item',
                        disableSnap: false
                            // useTransition: false, //use rAnimFrame instead of CSS3 - this increases performance
                            // bindToWrapper: true, //bind the scroll event to the wrapper not the whole document
                            // bounce: false, //do not perform a bounce on scrollEnd
                            // fadeScrollbars: false //make it dependend upon the used device - Android is getting choppy on fade` 
                    });
                    //scroller.options.snap = false;
                    //console.log('iscroll made for #' + rowId);
                    try {
                        meRow.scroller = scroller;
                    } catch(e) {
                        //TODO: Remove try catch.  Was for development / debugging
                        console.error('meRow.scroller error:' + rowId);
                    }
                    //alert("CR scrollerWidth: " + me.rows[id].scroller.scrollerWidth);
                    //console.log("CR scrollerWidth: " + me.rows[id].scroller.scrollerWidth);
                    scroller.on('scrollStart', $.proxy(me.scrollStart, me, meRow));
                    scroller.on('scrollEnd', $.proxy(me.scrollEnd, me, meRow));
                    scroller.on('scrollEnd', $.proxy(me.updateRowClass, meRow));


                    var spotlightIndex = meRow.spotlight;
                    // this should be set to true when the row is loaded correctly with spotlight or curpage
                    var currentScrollerPage;
                    // this has been moved from createRow because the dom is not written at that point and Android was not scroling correctly
                    var page = meRow.item.attr('curpage'),
                        moveIScroll = false;
                    if(page) {
                        page = parseInt(page, 10);
                        if(page !== 0 && page < meRow.placeholders.length) {
                            meRow.scroller.goToPage(page, 0, 0);
                            currentScrollerPage = meRow.scroller.currentPage.pageX;
                            meRow.lastPage = page;
                            moveIScroll = true;
                        }
                    } else if(!meRow.spotlightInit) {
                        // on initial page load the row will be scrolled to the tile designated as spotlighted by the CMA
                        // once the row is destroyed, the curpage var is set and that will be used to do any scrollTo
                        // curpage keeps the context of where the user had scrolled before the row was destroyed
                        //alert('spotlight: ' + spotlightIndex);
                        if(spotlightIndex !== 0) {
                            spotlightIndex = parseInt(spotlightIndex, 10);
                            if(spotlightIndex < meRow.placeholders.length && spotlightIndex !== meRow.scroller.currentPage.pageX) {
                                meRow.scroller.goToPage(spotlightIndex, 0, 0);
                                currentScrollerPage = meRow.scroller.currentPage.pageX;
                                meRow.lastPage = spotlightIndex;
                                meRow.spotlightInit = true;
                                moveIScroll = true;
                            }
                        }
                    }
                    meRow.lastX = meRow.scroller.x;
                    //if(moveIScroll){
                    //console.log('call updateHorizontalVisibility from updateIScrolls');
                    me.updateHorizontalVisibility(meRow);
                    //}
                    meRow.velocityXDataPoints = [];

                } /*else if(!rowIsViewable && rowHasIscroller) { // if row is not in view then remove iScroll ( TODO: Do we need to remove iScroll at all? )
                    //console.log('updateIScrolls: row is not viewable but has a iscroller: destroy', rowId);
                    //me.destroy(me.rows[rowId].scroller);
                }*/ else if(rowIsViewable && rowHasIscroller) {
                    // On older android devices, the pages weren't being calculated correctly.
                    // We account for this by ensuring our pages are generated.
                    //console.log('updateIScrolls: row is viewable and has a iscroller');
                    if(meRow.lastScrollWidth !== meRow.scroller.scrollerWidth) {
                        meRow.lastScrollWidth = meRow.scroller.scrollerWidth;
                        //console.log('refreshing because width has changed');
                        meRow.scroller.refresh();
                        //console.log("UV scrollerWidth: " + meRow.scroller.scrollerWidth);
                        //alert("UV scrollerWidth: " + meRow.scroller.scrollerWidth);
                    } else if(meRow.scroller.pages && (meRow.scroller.pages.length < meRow.placeholders.length)) {
                        meRow.lastScrollWidth = meRow.scroller.scrollerWidth;
                        // do not set this refresh in a setTimeout or the scroll to spotlight won't work
                        //alert('refreshing because number of pages has changed');
                        //console.log('refreshing because number of pages has changed');
                        meRow.scroller.refresh();
                    } else if(typeof(me.options.alwaysRefreshHScrollOnResize) !== 'undefined' && me.options.alwaysRefreshHScrollOnResize) {
                        // for live tv and home we always want the horizontal scroll to refresh
                        // could be because they only have 1 row
                        // this is needed.  on orientation change this is the condition testing true for ipad
                        meRow.scroller.refresh(); //Hopefully this isn't needed.  If it is, move it back to checkRowInDo
                    } else {
                        //console.log('updateIScrolls: catchall');
                    }
                }
            });
        },
        snapVertical: function(yPos) {
            // find closest snap to the yPos
            //console.log('snapVertical');
            var me = this;
            var closest = null;
            var closestInd;
            $(me.ySnap).each(function(index) {
                var thisY = this.yPos;
                if(closest === null || Math.abs(thisY - yPos - me.elementOffset) < Math.abs(closest - yPos - me.elementOffset)) {
                    closest = thisY;
                    closestInd = index;
                }
            });
            $(me.element).scrollTop(closest - me.elementOffset);
            me.lastYSnapInd = closestInd;
            me.isSnap = false;
            //console.log('me.lastYSnap: ' + me.lastYSnap);
        },
        createYSnap: function() {
            var me = this;
            me.ySnap = [];
            $.each(me.items, function(index) {
                var item = this;
                me.ySnap.push({
                    'item': $(item).attr('id'),
                    'index': index,
                    'yPos': item.offset().top,
                    'yPosTop': item.position().top
                });
            });
        },
        /**
         * Sets up the carousel with new data to be shown for each row
         * @param {Array} newData The json object containing the carousel data (same structure as passed in via the contructor)
         */
        updateCarousel: function(newData) {
            var me = this;
            if(me.items) {
                $.each(me.items, function(index, item) {
                    me.destroyRow(item, true);
                    // destroyRow does not actually remove them from the page
                    var id = item.get(0).id;
                    $('#' + id).remove();
                });
            }

            me.options.carousels = newData;
            me.$rows = [];
            me.items = [];
            me.activeItems = {};
            me.viewableItems = {};
            me.rowsAboveDocView = {};
            me.rows = {};
            $.each(me.options.carousels, function(index) {
                var item = $(fm('<div class="carousel-row" id="carousel-{id}" index={index} style="position:relative;"></div>', {
                    id: uid++,
                    index: index
                }));
                me.items.push(item);
                me.$el.append(item);
                //me.$rows.push(item[0]);
                if(!me.options.isMobile) {
                    item.on({
                        'mouseenter': function() {
                            $(this).addClass('carousel-over');
                        },
                        'mouseleave': function() {
                            $(this).removeClass('carousel-over');
                        }
                    });
                }
            });
            /*
// after the carousel updates, we scroll the vertical to the top
if (me.scroller) {
me.scroller.scrollTo(0, 0, 0);
}
*/
        },
        getScrollerRow: function(index) {
            var retRow;
            $.each(this.rows, function(key, row) {
                if(row.index === index) {
                    retRow = row;
                    return false;
                }
            });
            return retRow;
        },
        /*
/up: function() {
this.scroller.prev();
}
down: function() {
this.scroller.next();
},
left: function() {
this.scrollToPageOffset(this.scroller.currentPage.pageY, -1);
},
right: function() {
this.scrollToPageOffset(this.scroller.currentPage.pageY, 1);
},
*/
        // up/down/left/right now updated to work without vertical iscroll
        up: function() {
            var me = this;
            var i = me.lastYSnapInd;
            if(i === null || i === 0) {
                return;
            }
            var prevI = i - 1;
            var offsetAdjust = me.elementOffset;
            $(me.vPageScrollElem).scrollTop(me.ySnap[prevI].yPos - offsetAdjust);
            me.lastYSnapInd = prevI;
        },
        down: function() {
            var me = this;
            var i = me.lastYSnapInd;
            if(i !== null && i === me.ySnap.length - 1) {
                return;
            }
            var nextI = i === null ? 0 : i + 1;
            var offsetAdjust = me.elementOffset;
            $(me.vPageScrollElem).scrollTop(me.ySnap[nextI].yPos - offsetAdjust);
            me.lastYSnapInd = nextI;
        },
        left: function() {
            var me = this;
            var lastYSnapInd = me.lastYSnapInd === null ? 0 : me.lastYSnapInd;
            var rowInd = me.ySnap[lastYSnapInd].index;
            me.scrollToPageOffset(rowInd, -1);
        },
        right: function() {
            var me = this;
            var lastYSnapInd = me.lastYSnapInd === null ? 0 : me.lastYSnapInd;
            var rowInd = me.ySnap[lastYSnapInd].index;
            me.scrollToPageOffset(rowInd, 1);
        },
        nextPage: function(index) {
            this.scrollToPageOffset(index, 1);
        },
        prevTile: function(index) {
            this.scrollToPageOffset(index, -1);
        },
        scrollToPageOffset: function(index, offset) {
            var me = this;
            index = index.toString();
            var row = this.getScrollerRow(index);
            if(!row) {
                return;
            }
            var page = parseInt(row.scroller.currentPage.pageX, 10) + offset;
            setTimeout(function() {
                row.scroller.goToPage(page, 0);
                me.scrollStart(row);
            }, 1);
        },
        destroyRow: function(item, removeHTMLOnDestroy) {
            var me = this,
                id = item.get(0).id,
                thisRow = me.rows[id];
            // the rows with ids only exist if the row actually has a scroller, which are only the rows in view
            if(!thisRow) {
                console.error("This row does not exist:" + id);
                return;
            }
            var scroller = me.rows[id].scroller;
            if(scroller && typeof(scroller) === 'object') {
                item.attr('curpage', scroller.currentPage.pageX);
            }
            var row = me.rows[id];
            //delete me.rows[id];
            if(me.options.rowRemoved) {
                me.options.rowRemoved.call(me.options, item, row.index, me.options.carousels[row.index], row);
            }
            row.placeholders.each(function(itemIndex) {
                var item = $(this);
                if(item.hasClass('active')) {
                    item.removeClass('active');
                    //item.addClass('loading');
                    me.options.removeItem(item, itemIndex, me.options.carousels[row.index][itemIndex], me.options.removeKeyHTMLOnDestroy, removeHTMLOnDestroy);
                }
            });

            if(!me.options.removeKeyHTMLOnDestroy || removeHTMLOnDestroy) {
                item.empty();
            }
        },
        createRow: function(item) {
            var me = this,
                id = item.get(0).id,
                scroller,
                index = item.attr('index'),
                items = me.options.carousels[index],
                scrollerId = id + '-scroller-' + index,
                spotlightIndex = 0,
                slider;
            if(me.options.removeKeyHTMLOnDestroy && document.getElementById(scrollerId)) {
                //console.log('skipping creating #' + id);
                me.options.rowAddedHelper.call(me.options, item);
            } else {
                slider = $(fm('<div class="rowslider" id="{id}" style="position:relative;white-space: nowrap;height:100%;"></div>', {
                    id: scrollerId,
                    index: index
                }));
                // slider should be first in the carousel-row
                item.prepend(slider);
                $.each(items, function(cindex /*, data*/ ) {
                    spotlightIndex = items[cindex].isSpotlight ? cindex : spotlightIndex;
                    var item = $(fm('<div class="carousel-row-item {itemcls}" index={index} id="{id}" style="display:inline-block;height:100%;position:relative;top:0;vertical-align: top;"></div>', {
                        index: cindex,
                        id: scrollerId + '-item-' + cindex,
                        itemcls: me.options.itemCls || ''
                    }));
                    slider.append(item);
                    //me.options.addItem(item, cindex, data);
                });
                me.rows[id] = {
                    item: item,
                    index: index,
                    spotlight: spotlightIndex,
                    placeholders: item.find('.carousel-row-item'),
                    lastX: 0,
                    lastPage: 0,
                    velocityXDataPoints: [],
                    widget: me
                };
                if(me.options.rowAdded) {
                    me.options.rowAdded.call(me.options, item, index, items, me.rows[id]);
                }
            }
            //TODO: Get to this later.  Need to get the arrows in
            //setTimeout($.proxy(me.updateRowClass, me.rows[id]), 10);
        },
        updateRowClass: function() {
            try {
                if(this.scroller && typeof(this.scroller) === 'object') {
                    this.item.toggleClass("no-next", (this.scroller.currentPage.pageX >= this.scroller.pages.length - 1) ? true : false);
                    this.item.toggleClass("no-prev", (this.scroller.currentPage.pageX <= 0) ? true : false);
                }
            } catch(e) {
                console.log('Error in updateRowClass');
            }
        },
        /**
         * [updateHorizontalVisibility this is triggered on row scroll only and updates visibility of one row's items]
         * @param {[type]} row [description]
         * @return {[type]} [description]
         */
        updateHorizontalVisibility: function(row, scrollTimeOut) {
            var me = this;
            var carouselindex = row.item.attr('index'),
                // docViewTop is the left side
                docViewLeft = row.item.offset().left + row.item.scrollLeft(),
                // docViewBottom is the right side
                docViewRight = docViewLeft + row.item.width(),
                elemLeft, elemRight, hidden, itemData, elemLeft4Seen, elemRight4Seen, itemNotInDocView;
            if(scrollTimeOut) {
                //console.log('updateHorizontalVisibility Fallback: timed out for ' + row.item.get(0).id + ' with timerid' + row.horizontalVisibilityTimer);
            } else {
                //console.log('updateHorizontalVisibility called for ' + row.item.get(0).id + ' with timerid' + row.horizontalVisibilityTimer);
            }
            if(row.horizontalVisibilityTimer) {

                //console.log('updateHorizontalVisibility clear timeout for ' + row.item.get(0).id + ' with timerid' + row.horizontalVisibilityTimer);
                clearTimeout(row.horizontalVisibilityTimer);
                delete row.horizontalVisibilityTimer;
            } else {
                //console.log('updateHorizontalVisibility no timeout to clear for ' + row.item.get(0).id);
            }
            row.placeholders.each(function(itemIndex) {
                //if (me.options.isMobile && me.itemAdded) {
                //return false;
                //}
                var item = $(this);
                var rowIsViewable = true;
                //alert('updateHorizontalVisibility');
                //console.log('updateHorizontalVisibility');
                // elemTop is the left side of the element
                elemLeft = item.offset().left - (me.options.bufferH * item.width());
                // elemBottom is the right side of the element
                elemRight = item.offset().left + item.width() + (me.options.bufferH * item.width());
                hidden = (elemRight < docViewLeft) || (elemLeft > docViewRight);
                itemData = me.options.carousels[carouselindex][itemIndex];
                // Going to use this for ads so I know I can show them
                elemLeft4Seen = item.offset().left + me.options.pxInViewAmount;
                elemRight4Seen = item.offset().left + item.width();
                itemNotInDocView = (elemRight4Seen < docViewLeft) || (elemLeft4Seen > docViewRight);
                if(!hidden) {
                    if(!item.hasClass('active')) {
                        item.addClass('active');
                        //item.removeClass('loading');
                        me.options.addItem(item, itemIndex, me.options.carousels[carouselindex][itemIndex], me);
                    }
                    if(rowIsViewable && !itemNotInDocView && (typeof(itemData.theAdHTML) === 'string' && itemData.theAdHTML.length > 0) && !item.hasClass('adshown')) {
                        item.addClass('adshown');
                        var itemWithAd = item;                   
                        setTimeout(function() {
                            window.adHelper.loadAds2(itemWithAd, 'onShow');
                        }, 0);
                    // if (!item.attr('ad-replaced')) {
                    // console.error("Ad being replaced");
                    // setTimeout(function() {
                    // window.adHelper.loadAds2(itemWithAd, 'onShow');
                    // }, 0);
                    // }
                    } else if (rowIsViewable && (typeof (itemData.theAdHTML) === 'string' && itemData.theAdHTML.length > 0) && !item.hasClass('adshown')) {
                        //console.log(item.html());
                        //console.log(item.offset().left + '+' + item.width() + '-' + me.options.pxInViewAmount);
                        //console.log('elemRight4Seen=' + elemRight4Seen + ' < docViewLeft=' + docViewLeft + '/elemLeft4Seen=' + elemLeft4Seen + '> docViewRight=' + docViewRight);
                    }
                } else {
                    if(item.hasClass('active')) {
                        //console.error("Item Removed");
                        item.removeClass('active');
                        item.removeClass('adshown');
                        //item.addClass('loading');
                        me.options.removeItem(item, itemIndex, me.options.carousels[carouselindex][itemIndex], me.options.removeKeyHTMLOnDestroy);
                    }
                }
                if((!rowIsViewable || itemNotInDocView) && (typeof(itemData.theAdHTML) === 'string' && itemData.theAdHTML.length > 0) && item.hasClass('adshown') && !me.rowsAboveDocView[row.item.attr('id')]) {
                    item.removeClass('adshown');
                }
            });
            me.weArePossiblyDoingLazyLoadingWork = false;
        },
        updateSize: function() {
            var me = this,
                dim;
            $.each(this.items, function(index, item) {
                dim = me.options.getItemDimensions.call(me.options, index, 0, me.options.carousels[0]);
                var prevHeight = item.height();
                item.width('100%').height(dim.h);
                if(prevHeight !== dim.h) {
                    if(me.options.onRowResized) {
                        me.options.onRowResized.call(me.options, index, item);
                    }
                }
            });
        },
        // we want this to add items from rows either newly added or removed
        // 
        // if we need to use the spotlight scroll, we would like to add the items after the gotopage has happened
        // 
        /**
         * [updateRowItemVisibility - triggered on window scroll, it will update visibility on rows within the document view]
         * @param {[type]} row [description]
         * @return {[type]} [description]
         */
        updateRowItemVisibility: function(row) {
            var me = this;
            //var isMobile = window.tnVars.isMobile();
            if(row.rowVisibilityTimer) {
                clearTimeout(row.rowVisibilityTimer);
                delete row.rowVisibilityTimer;
            }
            //console.log('updateRowItemVisibility');
            var carouselindex = row.item.attr('index'),
                rowId = row.item.attr('id'),
                // docViewTop is the left side
                //docViewTop = row.item.offset().left + row.item.scrollLeft(),
                // the row offsets we not working quite right because show and schedule have the row starting at 200+ px in
                // from the left of the screen
                // on mobile (ipad) the left image was not loading...the loading image showing under the red header and to screen left
                docViewTop = 0,
                // docViewBottom is the right side
                docViewBottom = docViewTop + $(window).width(),
                elemTop, elemBottom, hidden, itemData, elemLeft4Seen, elemRight4Seen, itemNotInDocView,
                //rowIsViewable = row.item.hasClass('isviewable'), itemIsBelowViewPort;
                rowIsViewable = (me.viewableItems[rowId])?true:false;

            //return false;
            row.placeholders.each(function(itemIndex) {
                var item = $(this);
                elemTop = item.offset().left - (me.options.bufferH * item.width());
                elemBottom = item.offset().left + item.width() + (me.options.bufferH * item.width());
                hidden = (elemBottom < docViewTop) || (elemTop > docViewBottom);
                itemData = me.options.carousels[carouselindex][itemIndex];
                // Going to use this for ads so I know I can show them
                elemLeft4Seen = item.offset().left + me.options.pxInViewAmount;
                elemRight4Seen = item.offset().left + item.width() - me.options.pxInViewAmount;
                itemNotInDocView = (elemRight4Seen < docViewTop) || (elemLeft4Seen > docViewBottom);
                // if (currentScrollerPage === itemIndex && hidden) {
                //     row.rowVisibilityTimer = setTimeout(function() {
                //         me.updateRowItemVisibility(row);
                //     }, 100);
                //     return false;
                // }
                if(!hidden) {
                    if(!item.hasClass('active')) {
                        //me.itemAdded = true;
                        //console.error("Item added");
                        item.addClass('active');
                        //item.removeClass('loading');
                        me.options.addItem(item, itemIndex, me.options.carousels[carouselindex][itemIndex], me);
                        //setTimeout(function () {
                        //row.scroller.refresh();
                        //}, 0);
                    }
                    if (rowIsViewable && !itemNotInDocView && (typeof (itemData.theAdHTML) === 'string' && itemData.theAdHTML.length > 0) && !item.hasClass('adshown') && me.yDirection === 'down') {
                        item.addClass('adshown');
                        var itemWithAd = item;
                       setTimeout(function() {
                            window.adHelper.loadAds2(itemWithAd, 'onShow');
                        }, 0);
                    // if (!item.attr('ad-replaced')) {
                    // console.error("Ad being replaced");
                    // setTimeout(function() {
                    // window.adHelper.loadAds2(itemWithAd, 'onShow');
                    // }, 0);
                    // }
                   }
                }
                if(me.options.onRowItemsAdded) {
                    me.options.onRowItemsAdded.call(me.options, row.item);
                }
                if ((!rowIsViewable || itemNotInDocView) && (typeof (itemData.theAdHTML) === 'string' && itemData.theAdHTML.length > 0) && item.hasClass('adshown') && !me.rowsAboveDocView[row.item.attr('id')]) {
                    item.removeClass('adshown');
                }
            });
        },
        updateVerticalVisibility: function(action) {
            var me = this;
            action = typeof(action) !== 'undefined' ? action : '';
            // this is to try to prevent the 'not current page' from reacting to the visibility scroll
            // since mobile is scrolling on the document
            //console.log('test *****************');
            //console.log('test curPage: ' + Tn.currentPage);
            //console.log('test me.elementId: ' + me.elementId);
            //console.log('test me.lastYScrollPos: ' + me.lastYScrollPos);
            //console.log("test docSCrollTop: " + $(document).scrollTop());

            if(me.options.isWindowScroll && (Tn.currentPage !== me.elementId)) {
                return;
            }

            if(me.options.isWindowScroll) {
                var elemYPos = $(me.element).attr('ypos');
                //console.log('elemYPos: ' + elemYPos + " for: " + me.elementId);
                if(typeof(elemYPos) === 'undefined'){
                    $(me.element).attr('ypos', me.lastYScrollPos);
                    //console.log("added ypos attribute: " + me.lastYScrollPos + " for: " + me.elementId);
                } else if(parseInt(elemYPos, 10) !== me.lastYScrollPos){
                    $(me.element).attr('ypos', me.lastYScrollPos);
                    //console.log("updated ypos attribute: " + me.lastYScrollPos + " for: " + me.elementId);
                } else {
                    //console.log("no change in vertical positioning for: " + me.elementId);
                }
            }

            var removed = [],
                added = [],
                removeViewed = [],
                addViewed = [],
                id, hidden,
                elemTop, elemBottom,
                rowNotInDocView, rowAboveDocView,
                elemTop4Seen, elemBottom4Seen;

            if(me.verticalVisibilityTimer) {
                clearTimeout(me.verticalVisibilityTimer);
                delete me.verticalVisibilityTimer;
            }
            //console.log('updateVerticalVisibility do work.');
            //var docViewTop = $(me.element).offset().top + $(me.element).scrollTop();
            //var docViewBottom = docViewTop + $(me.element).height();
            //var docViewTop = $('header').height();
            //var docViewBottom = docViewTop + $(window).height() - $('header').height() - $('footer').height();
            var docViewTop = $('header').height();
            var docViewBottom = docViewTop + $(window).height() - $('header').height() - $('footer').height();
            //alert("Visibility Test");
            //console.log("Visibility Test");
            //$('#androidMsg').append('<br/>updateVerticalVisibility');
            $.each(this.items, function(index, item) {
                id = item.get(0).id;
                //console.log('item.offset()');
                //console.log(item.offset());
                //elemTop = item.offset().top - me.elementOffset - (item.height() * me.options.buffer);
                //elemBottom = item.offset().top - me.elementOffset + item.height() + (item.height() * me.options.buffer);
                /*
elemTop = item.offset().top - (item.height() * me.options.buffer);
elemBottom = item.offset().top + item.height() + (item.height() * me.options.buffer);
// Going to use this for ads so I know I can show them
elemTop4Seen = item.offset().top;
elemBottom4Seen = item.offset().top + item.height();
*/
                var itemRect = item[0].getBoundingClientRect();
                //console.log(itemRect);
                elemTop = itemRect.top - me.elementOffset - (item.height() * me.options.bufferV);
                elemBottom = itemRect.bottom + (item.height() * me.options.bufferV);
                //elemTop4Seen = item.offset().top - me.elementOffset;
                //elemBottom4Seen = item.offset().top - me.elementOffset + item.height();
                elemTop4Seen = itemRect.top - me.elementOffset;
                elemBottom4Seen = itemRect.top - me.elementOffset + item.height();
                // if (me.options.isMobile) {
                hidden = (elemBottom < docViewTop) || (elemTop > docViewBottom);
                // When scrolling up we need to not refresh ads so keep track of ads that are above current view
                rowAboveDocView = (elemBottom4Seen < docViewTop);
                // Going to use this for ads so I know I can show them - no buffer
                rowNotInDocView = rowAboveDocView || (elemTop4Seen > docViewBottom);
                // } else {
                //     hidden =  /*(elemBottom < docViewTop) || */(elemTop > docViewBottom);
                //     // Going to use this for ads so I know I can show them - no buffer
                //     rowNotInDocView =  /*(elemBottom4Seen < docViewTop) ||*/(elemTop4Seen > docViewBottom);
                // }
                if(hidden) {
                    if(me.activeItems[id]) {
                        removed.push(item);
                    }
                } else {
                    if(!me.activeItems[id]) {
                        added.push(item);
                    }
                }
                if(rowNotInDocView) {
                    if(me.viewableItems[id]) {
                        removeViewed.push(item);
                    }
                } else {
                    if(!me.viewableItems[id]) {
                        addViewed.push(item);
                    }
                }
                if(rowAboveDocView) {
                        me.rowsAboveDocView[id] = item;
                } else if(me.rowsAboveDocView[id]) {
                    delete me.rowsAboveDocView[id];
                }
            });
            $.each(removeViewed, function(index, item) {
                item.removeClass('isviewable');
                delete me.viewableItems[item.get(0).id];
            });
            $.each(addViewed, function(index, item) {
                me.viewableItems[item.get(0).id] = item;
                item.addClass('isviewable');
            });
            $.each(removed, function(index, item) {
                item.removeClass('isvisible');
                me.destroyRow(item);
                delete me.activeItems[item.get(0).id];
            });
            // console.error("Row Removed", JSON.stringify($.map(removed, function(item) {
            //     return item.get(0).id;
            // })));
            $.each(added, function(index, item) {
                me.activeItems[item.get(0).id] = item;
                item.addClass('isvisible');
                me.createRow(item);
            });
            // console.error("Row Added", JSON.stringify($.map(added, function(item) {
            //     return item.get(0).id;
            // })));
            if(added.length !== 0 || removed.length !== 0 || action === 'resize' ){
                //console.error("Process ROWS");
                $.each(me.activeItems, function(index, $row) { // was me.rows
                    //$('#androidMsg').append('<br/>processing row: ' +row.index);
                    var row = me.rows[$row[0].id];
                    if(row && typeof(row) === 'object') {
                        index = row.item.attr('index');
                        var dim, width = 0;
                        row.placeholders.each(function(cindex) {
                            dim = me.options.getItemDimensions.call(me.options, index, cindex, me.options.carousels[index]);
                            width += dim.w;
                            $(this).width(dim.w).height(dim.h);
                        });
                        var rowslider = row.item.find('.rowslider');
                        row.totalItemsW = width;
                        rowslider.width(width);
                        // Android stock browser is having an issue with setting the width of rowslider
                        // which means that the scroller has no width to scroll
                        // i think it is a race condition between setting the width and when the row is dont writing to the page
                        // before doing any more processing, we need to see if the rows have actuall been written to the DOM
                        // Android takes a while
                        me.checkRowInDom(row); // TODO: Do I need to call this?
                    }
                });
            }
            me.weArePossiblyDoingLazyLoadingWork = false;
        },
        checkRowInDom: function(row) {
            //console.log('checkRowInDom');
            if(typeof(row.checkRowInDomTimer) !== 'undefined') {
                clearTimeout(row.checkRowInDomTimer);
                delete row.checkRowInDomTimer;
            }
            var me = this;
            var rowslider = row.item.find('.rowslider');
            var rowsliderW = rowslider.width();
            // we are trying to set the width here and we can't unless it has already written to the DOM
            if(rowsliderW === 0) {
                rowslider.width(row.totalItemsW);
                row.checkRowInDomTimer = setTimeout(function() {
                    me.checkRowInDom(row);
                }, 50);
                return false;
            }
            //alert('made it!: row ' + row.index);

            me.updateRowItemVisibility(row);
            /*
                        row.rowVisibilityTimer = setTimeout(function() {
                            //alert('going to updateRowItemVisibility');
                            //console.log('going to updateRowItemVisibility');
                            me.updateRowItemVisibility(row);
                        }, 50);
                    */
            //console.log(row);
            // passing the row in here for the ability to refresh the scroller
            // live tv needs the scroller refreshed everytime
            if(me.options.onRowVisible) {
                me.options.onRowVisible.call(me.options, row.index, row.item);
            }
            me.updateRowClass.call(row);
        },
        /**
         * [scrollStart called by iScroll on scrollstart of carousels]
         * @param {[type]} row [description]
         * @return {[type]} [description]
         */
        scrollStart: function(row) {
            var me = this;
            //row.item.addClass('hideload');
            //alert('scrollStart');
            //console.log('scrollStart');
        },
        /**
         * [scrollEnd called by iScroll on scrollend of carousles]
         * @param {[type]} row [description]
         * @return {[type]} [description]
         */
        scrollEnd: function(row) {
            var me = this;
            //row.isScrolling = false;
            //me.onScrollTimeout(row);
            //row.lastX = -1;
            //alert('scrollEnd');
            //console.log('scrollEnd');
            //setTimeout($.proxy(me.onScrollTimeout, me, row), 500);
        },
        /*
// this is the window scroll
// the scroll event is called constantly when the targetted element starts to scroll
// so we need to throttle
vScroll: function() {
var me = this;
me.isVScrolling = true;
var minScrollTime = 100;
var now = new Date().getTime();
if (!me.vScrollFireTimer) {
if (now - me.lastVScrollFireTime > (3 * minScrollTime)) {
me.onVScrollTimeout(); // fire immediately on first scroll
me.lastVScrollFireTime = now;
}
me.vScrollFireTimer = setTimeout(function() {
me.vScrollFireTimer = null;
me.lastVScrollFireTime = new Date().getTime();
me.onVScrollTimeout();
}, minScrollTime);
}
},
onVScrollTimeout: function() {
var me = this;
console.log('onVScrollTimeout');
//var vScrollTop = $(me.element).scrollTop();
var vScrollTop = $('body').scrollTop();
console.log('body: ' + $('body').scrollTop());
console.log('document: ' + $(document).scrollTop());
$('#androidMsg').append('<br/>vScrollTop' + vScrollTop);
$('#androidMsg').append('<br/>lastY' + me.lastY);
if (vScrollTop !== me.lastY) {
console.log(vScrollTop + ' - ' + me.lastY);
me.lastVScrollChangeTime = new Date().getTime();
me.lastY = vScrollTop;
me.updateVerticalVisibility();
} else {
me.isVScrolling = false;
return;
}
},
*/
        resizeActual: function() {
            this.resizeTimer = null;
            if(this.options.onResize) {
                this.options.onResize.call(this.options);
            }
            this.updateSize();
            this.createYSnap();
            this.updateVerticalVisibility('resize');
            this.updateIScrolls();
        },
        resize: function() {
            // Save the last window width and height
            this.lastWidth = $(window).width();
            this.lastHeight = $(window).height();
            if(this.resizeTimer) {
                clearTimeout(this.resizeTimer);
            }
            this.resizeTimer = setTimeout($.proxy(this.resizeActual, this), 100);
        },
        setYPos: function(){
            var me = this;
            //console.log('test setYPos');
            var yPos = $(me.element).attr('ypos');
            yPos = yPos !== '' ? parseInt(yPos, 10) : '';
            if(document.body.scrollTop !== yPos){
                $(me.element).css('opacity', 0);
                document.body.scrollTop = document.body.scrollTop = yPos;
                $(me.element).animate({
                    'opacity': 1
                }, 200);
                //console.log('test scrolling to yPos');
            }
            me.yDirection = 'down'; // Initialize for ads
            me.resize();
        }
    };
    $.fn[pluginName] = function(options) {
        var args = arguments;
        if(options === undefined || typeof options === 'object') {
            return this.each(function() {
                if(!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        } else if(typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;
            this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if(instance instanceof Plugin && typeof instance[options] === 'function') {
                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                // Allow instances to be destroyed via the 'destroy' method
                if(options === 'destroy') {
                    $.data(this, 'plugin_' + pluginName, null);
                }
            });
            return returns !== undefined ? returns : this;
        }
    };
}(jQuery, window, document));

}

/*
     FILE ARCHIVED ON 17:29:31 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:42 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.376
  load_resource: 37.433
  PetaboxLoader3.datanode: 33.611
*/