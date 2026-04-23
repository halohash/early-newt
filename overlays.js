var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function(tnVars, $, undefined) {
    function setPlayBtnEvent(event) {
        event.preventDefault();
        event.stopPropagation();

        var lastClick = $(this).attr('lastclick');
        if (lastClick && (new Date().getTime()-lastClick)<250) {
            return;
        }

        $(this).attr('lastclick', new Date().getTime());

        var href = $(this).parents('.main-content, .secondary-item').attr('data-videohref');
        if (!href || href.length === 0 || href === "undefined") {
            Tn.alert("No video url found");
            return;
        }
        var theUrl = (href.indexOf('http://') !== -1 && href.indexOf('https://') !== -1)?'http://' + $(location).attr('host') + href: href;
        Tn.showPlayer(theUrl);
    }
    function setMoreBtnEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        closeAllOverlays();
        var href = $(this).attr("data-href");
        if (href === '#') {
            Tn.alert("No clip information available");
            return;
        }
        Tn.setUrl(href, true, 'page-generic');
    }

    function setPlayListBtnEvent(event) {
        event.preventDefault();
        event.stopPropagation();

        var lastClick = $(this).attr('lastclick');
        if (lastClick && (new Date().getTime()-lastClick)<250) {
            return;
        }

        $(this).attr('lastclick', new Date().getTime());

        var href = $(this).attr('data-href');
        if (!href || href.length === 0 || href === "undefined") {
            Tn.alert("No video url found");
            return;
        }
        Tn.showPlayer('http://' + $(location).attr('host') + href);
    }

    window.tnOverlays = {
        msg: 'hi',

        moreInfoCb: function(event) {
            event.preventDefault();
            closeAllOverlays();
            var href = $(this).attr("href");
            if (!href || href === '') {
                href = $(this).attr("data-href");
            }
            if (href === '#') {
                Tn.alert("No clip information available");
                return;
            }
            Tn.setUrl(href, true, 'page-generic');
        },

        // item needs to be content block
        init: function(item) {
            if (typeof(item) === 'undefined') {
                return;
            }

            // item is the content object
            // contentSel will be needed to find the content object for the icon events
            var infoOverlay = item.find('.info-overlay');

            // for touch, we need to capture the touchstart/end and decide if it has swiped or not
            // if the screen has touch, we will always display the icon2 group on images
            if (tnVars.hasTouchStart) {
                //infoOverlay.parent().find('.icon-group2').css('visibility', 'visible');
                item.find('.icon-group2').css('visibility', 'visible');
            }

            // we are now going to try doing the truncate on the event that displays the red box
            //setMaxHtOfTruncBoxItem(item);
            //truncateOverlayHt(item);

            item.find('.more').on('click', setMoreBtnEvent);

            // this is for the schedule list info icon
            item.find('.moreList').on('click', setMoreBtnEvent);

            // events for play button on top of image
            item.find('.playbut').addClass('handled').on("click", setPlayBtnEvent);

            //this is for the schedule list play buttons
            item.find('.playbutList').addClass('handled').on("click", setPlayListBtnEvent);

            
            // icon2 is the icon group that lays over the image
            var $infoIcon = item.find('.icon-group2 > .icon.info');

            // SO, issue on the touch screen search, the mouse events were getting triggered on ipad
            // if you clicked anywhere in the red overlay box
            // this was preventing the play button and more link from executing.
            // i am assuming we did not see this on the carousels because iscroll captures all the events
            // geez this took a while to find!!! - jhillmann

            if(!tnVars.isMobile()){

                item.find('.info-overlay .icon-group .icon.info').on('mouseup', this.moreInfoCb);

                // events for the icon group over the image
                item.on('mouseenter', function() {
                    infoOverlay.css({
                        'transition': 'none',
                        'opacity': 0
                    });

                    closeAllOverlays();
                });
                $infoIcon.on('mouseenter', function() {
                    item.addClass('hover');
                    truncateContent(item);
                    // hiding the group2 info button because it was absorbing the event from the info button on the red
                    // in some cases (small red overlay)
                    $(this).hide();
                    $(this).parents('.carousel-row').children('.nav-slider').addClass('tn-hidden');
                    infoOverlay.css({
                        'transition': 'all ease-in-out 0.3s',
                        'opacity': 1
                    });
                });
                item.on('mouseleave', function() {
                    infoOverlay.css({
                        'opacity': 0
                    });
                    $infoIcon.show();
                    item.removeClass('hover');
                    // we want to set arrows back to original display
                    $(this).parents('.carousel-row').children('.nav-slider').removeClass('tn-hidden');
                });


            }
            

            // TRYING THIS AT TOUCHSTART BECAUSE TOUCHEND WAS TAKING TOO LONG
            $infoIcon.on('touchstart', function(e) {
                e.preventDefault();
                closeAllOverlays(true);
                $(this).hide();
                item.addClass('hover');
                truncateContent(item);
                // we want to hide any arrows showing when the red overlay is displayed
                //$(this).parents('.carousel-row').children('.nav-slider').addClass('tn-hidden');
            });

            //var redInfoIcon = item.find('.info-overlay .icon-group .icon.info');
            item.find('.info-overlay .icon-group .icon.info').on('touchstart', function(e) {
                //console.log( $(this) );
                e.preventDefault();
                console.log($infoIcon);
                $infoIcon.show();
                //$(this).parents('.main-content').children('.icon-group2').find('.info.icon').show();
                item.removeClass('hover');
                // we want to set arrows back to original display
                //$(this).parents('.carousel-row').children('.nav-slider').removeClass('tn-hidden');
            });
        },

        /**
         * [truncateOverlayHt description]
         * truncateOverlayHt is tied to the html structure of the overlay box.  It should truncate the description field on refresh
         *  of the containing carousel div element
         * @param  {[type]} options [description]
         * @return {[type]}  
         *        [description]
         */
        truncateOverlayHt: function(item) {
            truncateOverlayHt(item);
        },
        restoreOrigTruncate: function(item) {
            restoreOrigTruncate(item);
        },
        setMaxHtOfTruncBoxItem: function(item) {
            setMaxHtOfTruncBoxItem(item);
        },
        resizeOverlay: function(item) {
            resizeOverlay(item);
        },
        destroyTruncate: function(item) {
            destroyTruncate(item);
        },
        closeAllOverlays: function(){
            closeAllOverlays();
        }
    };
    /**
     * [destroyTruncate - we will call this when an item (carousel tile) is being removed]
     * @param  {[type]} item [description]
     * @return {[type]}      [description]
     */
    function destroyTruncate(item) {
            var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');
            truncElem.trigger("destroy.dot");
    }
    function restoreOrigTruncate(item) {
         var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');
        var content = truncElem.triggerHandler("originalContent.dot");
        if (typeof(content) !== 'undefined') {
            truncElem.trigger("destroy.dot");
            truncElem.append(content);
        }

    }

    function truncateContent(item){
        var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');
        if(truncElem.hasClass('istruncated')){
            return;
        }
        setMaxHtOfTruncBoxItem(item);

    }

    function resizeOverlay(item){

        //item.addClass('tilehasreized');
        // the thought here is to remove the height on resize
        // when the trunc call comes along, we don't have to redo it if the height has already been set
        var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');
        truncElem.removeClass('istruncated');

        /*
        restoreOrigTruncate(item);
        setMaxHtOfTruncBoxItem(item);
        truncateOverlayHt(item);
        // experimenting with removing events before tacking on a new one
        item.find('.more').off('click');
        item.find('.more').on('click', setMoreBtnEvent);
        */
    }

    function closeAllOverlays(isTouch){
        //('.icon-group2 > .icon.info')
        // we also need to show the icon-group2 info for touch screen
        var isT = typeof(isTouch) !== 'undefined' ? isTouch : tnVars.hasTouchStart;
        $('.main-content').removeClass('hover');
        $('.secondary-item').removeClass('hover');
        if(isT){
            $('.main-content .icon-group2 > .icon.info').show();
            $('.secondary-item .icon-group2 > .icon.info').show();
        }
        
    }

    function truncateOverlayHt(item) {
        //console.log("truncateOverlayHt: " + itemId);
        var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');

        // then create a new one with the new height
        truncElem.dotdotdot({
            'ellipsis': '',
            'after': truncElem.children('.more'),
            'height': truncElem.height(),
            'watch': false,
            'lastCharacter': {

                //  Remove these characters from the end of the truncated text. 
                'remove': [' ', ',', ';', '.', '!', '?']

                //  Don't add an ellipsis if this array contains 
                //  the last character of the truncated text. 
                //'oEllipsis'   : []
            }
        });
    }

    function setMaxHtOfTruncBoxItem(item) {
        var $overlay = item.find('.info-overlay');
        var overlayHt = $overlay.height();
        var atfH = $overlay.children('.meta').children('.above-fold').outerHeight(true);
        //var btfH = $overlay.children('.meta').children('.below-fold').outerHeight(true);
        var footerH = $overlay.children('.meta').children('.footer').outerHeight(true);

        // this is the max of the below the fold section
        var maxBtfH = overlayHt - atfH - footerH - 50;

        var $btfChildrenNoTrunc = $overlay.children('.meta').children('.below-fold').children().not('.truncate-h');
        var btfChildrenHt = $btfChildrenNoTrunc.length > 0 ? $btfChildrenNoTrunc.height() : 0;
        var maxTruncHt = maxBtfH - btfChildrenHt;
        var truncElem = item.find('.info-overlay .meta > .below-fold .truncate-h');
        truncElem.height(maxTruncHt);
        truncElem.addClass('istruncated');

        // now we truncate
        truncateOverlayHt(item);
        //return true;
    }

}(window.tnVars, jQuery));

}

/*
     FILE ARCHIVED ON 17:29:28 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:43 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.423
  load_resource: 27.112
  PetaboxLoader3.datanode: 24.798
*/