var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
//Idol search API location
var tnSearchQueryUrl = "/includes/searchproxy.html?query=";

var searchImagePath = "https://web.archive.org/web/20141231172951/http://i.cdn.turner.com/v5cache/TBS/Images/Dynamic/";
if (window.siteDefaults.name === "TNT"){
	searchImagePath = "https://web.archive.org/web/20141231172951/http://i.cdn.turner.com/v5cache/TNT/Images";
}

// i do not believe we are using the episodeItemTemplate.
// We call the shows.js initializeShowOverlay for the template
/*
var episodeItemTemplate = [
    '<div class="main-content" data-id="{titleid}" data-videohref="{videoLink}">',
    '<div class="main playbut"></div>',
    '<img src="{imgSrc}" onerror="javascript:window.onShowOverlayError(this)" style="width:100%; height:100%;">',
    '<div class="caption withleft">',
    '    <div class="epinfo">{epinfoPLUS}</div>',
    '    <div class="text-wrapper">',
    '        <span class="special">{airOn}</span>',
    '        <span class="availexpire">{availExpire}</span>',
    '    </div>',
    '</div>',
    '<div class="icon-group2 {hideOverlayClass}">',
    '    <div class="icon plus"></div>',
    '    <div class="icon info"></div>',
    '</div>',
    '<div class="info-overlay">',
    '    <div class="icon-group">',
    '        <div class="icon plus"></div>',
    '        <div class="icon info" data-href="{epInfoLink}"></div>',
    '        <div class="icon playbut"></div>',
    '    </div>',
    '    <div class="meta">',
    '        <div class="above-fold">',
    '            <div class="title">',
    '                <span>{title}</span>',
    '            </div>',
    '            <div class="specs">',
    '                <div class="season">',
    '                    <span></span>',
    '                </div>',
    '                <div class="ep">',
    '                    <span></span>',
    '                </div>',
    '                <div class="time left">',
    '                    <span>{duration}</span>',
    '                </div>',
    '            </div>',
    '        </div>',
    '        <div class="below-fold">',
    '            <div class="ep-title">',
    '                <span></span>',
    '            </div>',
    '            <div class="blurb truncate-h" style="">',
    '                {blurb}<div class="more" data-href="{epInfoLink}" style="display: inline;">More...</div>',
    '            </div>',
    '        </div>',
    '<div class="footer {footerClass}">',
    '            <span class="availexpire">{availExpireHover}</span>',
    '        </div>',
    '    </div>',
    '</div>',
    '</div>'
].join('');
*/
var movieItemTemplate = [
    '<div class="main-content" id="id-{titleid}" data-id="{titleid}" data-videohref="{videoLink}">',
    '<div class="main playbut"></div>',
    '<img src="{imgSrc}" onerror="javascript:window.onShowOverlayError(this)" style="width:100%; height:100%;">',
    '<div class="caption withleft movie">',
    '    <div class="epinfo">{title}</div>',
    '    <div class="text-wrapper">',
    '        <span class="availexpire">{availExpire}</span>',
    '    </div>',
    '</div>',
    '<div class="icon-group2">',
    '    <div class="icon plus"></div>',
    '    <div class="icon info"></div>',
    '</div>',
    '<div class="info-overlay">',
    '    <div class="icon-group">',
    '        <div class="icon plus"></div>',
    '        <div class="icon info" data-href="{infoLink}"></div>',
    '        <div class="icon playbut"></div>',
    '    </div>',
    '    <div class="meta">',
    '        <div class="above-fold">',
    '            <div class="title">',
    '                <span>{title}</span>',
    '            </div>',
    '            <div class="specs">',
    '                <div class="season">',
    '                    <span></span>',
    '                </div>',
    '                <div class="ep">',
    '                    <span></span>',
    '                </div>',
    '                <div class="time left">',
    '                    <span>{duration}</span>',
    '                </div>',
    '            </div>',
    '        </div>',
    '        <div class="below-fold">',
    '            <div class="blurb truncate-h" style="">',
    '                {blurb}<div class="more" data-href="{infoLink}" style="display: inline;">More...</div>',
    '            </div>',
    '        </div>',
    '<div class="footer {footerClass}">',
    '            <span class="availexpire">{availExpireHover}</span>',
    '        </div>',
    '    </div>',
    '</div>',
    '</div>'
].join('');

// function formatDuration() has become Tn.formatDuration() and lives on show.js;
// it is used to format all seconds to mins durations except the video page
// 
function getMovieData(item) {
	var vidUrl = (item.pretty_video_url !== null && item.pretty_video_url !== '')?item.pretty_video_url:"/videos" + item.pretty_url;
    var availExpireHover = typeof(item.available_on) !== 'undefined' ? item.available_on : '';
    var availExpire = typeof(item.available_on) !== 'undefined' ? item.available_on : '';
    var footerClass = availExpireHover.length === 0 ? 'tn-hidden' : '';
    var movieData = {
        contentType: "movie",
        titleid:item.title_id,
        videoLink:vidUrl,
        imgSrc: searchImagePath + item.image_300,
        retinaImgSrc:searchImagePath + item.image_600,
        title:item.title.toUpperCase(),
        availExpire: availExpire,
        availExpireHover: availExpireHover,
        infoLink:item.pretty_url,
        duration:Tn.formatDuration(item.duration),
        footerClass:footerClass,
        isPlayableClass: '',
        blurb:item.movie_description
    };
    console.log(movieData);
    return movieData;
}

function getEpisodeData(item) {
    var availExpireHover = typeof(item.available_on) !== 'undefined' ? item.available_on : '';
    var availExpire = typeof(item.available_on) !== 'undefined' ? item.available_on : '';
    var footerClass = availExpireHover.length === 0 ? 'tn-hidden' : '';
    var episodeData = {
        contentType: "episode",
        titleid:item.title_id,
        videoLink:item.pretty_video_url,
        isPlayableClass: '',
        imgSrc:searchImagePath + item.image_300,
        retinaImgSrc:searchImagePath + item.image_600,
        epinfo: item.series_name.toUpperCase() + '<span> S' + item.season_number + ' | E' + item.episode_number + '</span>', 
        airOn:item.air_on,
        availExpireHover: availExpireHover,
        availExpire: availExpire,
        footerClass: footerClass,
        hideOverlayClass:'',
        theAdHTML:'',
        epInfoLink:item.pretty_url,
        title:item.title,
        duration:Tn.formatDuration(item.duration),
        blurb:item.episode_description
    };
    //console.log(episodeData);
    return episodeData;
}

function getClipData(item) {
    var footerClass = 'tn-hidden';
    var clipData = {
        contentType: "clip",
        titleid:item.content_id,
        videoLink:item.pretty_video_url,
        isPlayableClass: '',
        imgSrc:searchImagePath + item.image_300,
        retinaImgSrc:searchImagePath + item.image_600,
        epinfo: item.title,
        airOn:'',
        availExpireHover: '',
        availExpire: '',
        theAdHTML:'',
        footerClass: footerClass,
        hideOverlayClass:'',
        epInfoLink:item.pretty_video_url.replace('/videos/','/shows/'),
        title:item.title,
        duration:Tn.formatDuration(item.duration),
        blurb:item.clip_description
    };
    //console.log(episodeData);
    return clipData;
}

function updateSearchSize() {
    if (Tn.currentPage !== 'page-search') {
        return;
    }


    $('#page-search .search-item .main-content').each(function () {
        var el = $(this);
        var w = el.width();
        var h = parseInt(w * 360 / 640, 10);
        el.height(h);
        window.tnOverlays.resizeOverlay(el);
    });

}

$('body').on('pageresize', updateSearchSize);
$('body').on('pageshown', function (event, pageId) {
        if (pageId !== 'page-search') {
            return;
        }

        var page = $('#' + pageId);

        // Set the focus on the search field
        setTimeout(function () {
            page.find('.search-field').focus().blur().focus().select();
        }, 1000);

        // Page was already shown, so just call an update when the page is shown again
        if (Tn.searchPageInitialized) {
            updateSearchSize();
            return;
        }

        Tn.searchPageInitialized = true;

        function doSearch() {
            delete Tn.searchTimer;
            var val = $('.search-field').val(),
                resultsEl = $('.search-results'),
                foundShows = {},
                learnMoreTxt = "",
                results = [];

            resultsEl.empty();

            if (!val || val.length === 0) {
                resultsEl.append('<div class="watchnow">Enter a phrase to search for</div>');
                return;
            }

            val = val.toLowerCase();
            var searchQuery = tnSearchQueryUrl + val;
            searchQuery = searchQuery.replace(/ /g,"_");
            //console.log('performing search');
            $.ajax({
                url: searchQuery,
                dataType: 'json'
            }).done(function (data) {
				//console.log('data retrieved');
                //first grab the info on result types and numbers from the data
                var numShows = data.metaResults.show;
                var numMovies = data.metaResults.movie;
                var numEpisodes = data.metaResults.episode;
                var numClips = data.metaResults.clip;
                var totalAvailableResults = numShows + numMovies + numEpisodes + numClips;
                var maxResults = (numEpisodes + numMovies + numClips < 8) ? numEpisodes + numMovies +numClips : 8;
				
				//console.log ('shows: '+ numShows + 'episodes: ' + numEpisodes);
				
                var resultsDisplayed = 0;
                //now iterate over the results to populate learn more text and video results
                for (var i = 0; i < data.results[0].length; i++) {
                    var result = data.results[0][i];
                    if (result.contentType === "show") {
                        //this result is for learnMore
                        var showTitle = result.title;
                        var showURL = result.pretty_url;
                        learnMoreTxt += Tn.fm('<span class="shows"><a href="{1}">{0}</a></span>', showTitle.toLowerCase(), showURL);
                        //console.log(learnMoreTxt);
                    }
                }
                
                for (var i = 0; i < data.results[1].length; i++) {
                	var result = data.results[1][i];
                	//console.log(result.title);
					if (result.contentType === "movie") {
                        if (result.is_playable === "true") {
                            if (resultsDisplayed === maxResults) {
                                //we already have maxed out the video display
                                break;
                            } else {
                                var ep = getMovieData(result);
                                //console.log(ep);
                                results.push({
                                	contentType: ep.contentType,
                                    ep: ep
                                });
                                resultsDisplayed++;
                            }
                        }
                    }                	
                }
                
                for (var i = 0; i < data.results[2].length; i++) {
                	var result = data.results[2][i];
                	//console.log(result.title + " " + result.contentType +  " " + result.isplayable); 
                	if (result.contentType === "episode") {  
                        if (result.isplayable === "true") {
                            if (resultsDisplayed === maxResults) {
                                //we already have maxed out the video display
                                break;
                            } else {
                                var ep = getEpisodeData(result);
                                //console.log(ep);
                                results.push({
                                	contentType: ep.contentType,
                                    ep: ep
                                });
                                resultsDisplayed++;
                            }
                        }
                                    	             
					}
				}
				
				if (data.results.length > 3){
                for (var i = 0; i < data.results[3].length; i++) {
                	var result = data.results[3][i];
                	//console.log(result.title + " " + result.contentType +  " " + result.isplayable); 
                	if (result.contentType === "clip") {  
                        if (result.isplayable === "true") {
                            if (resultsDisplayed === maxResults) {
                                //we already have maxed out the video display
                                break;
                            } else {
                                var ep = getClipData(result);
                                //console.log(ep);
                                results.push({
                                	contentType: ep.contentType,
                                    ep: ep
                                });
                                resultsDisplayed++;
                            }
                        }
                                    	             
					}
				}				
				}
				if (learnMoreTxt.length > 0) {
					resultsEl.append('<div class="learnmore"><span class="title">Learn More About</span>' + learnMoreTxt + '</div>');
					resultsEl.find('.shows a').on('click', function (event) {
						event.preventDefault();
						Tn.setUrl($(this).attr("href"), true, 'page-generic');
					});
				}

				if (results.length > 0) {
					resultsEl.append('<div class="watchnow withresults">Watch Now</div>');

					var container = $('<div class="results row"></div>');
					container.appendTo(resultsEl);

					$.each(results, function (key, sr) {
						var item = $('<div class="search-item col-xs-6 col-sm-4 col-md-4 col-lg-3"></div>');
						item.appendTo(container);
						//console.log ('ep:\n ' + sr.ep);
						if (sr.contentType === "episode" || sr.contentType === "clip") {
							//load episode div
							Tn.initializeShowOverlay(item, sr.ep);
						} else {
							//load movie div
							var divItem = Tn.fm(movieItemTemplate,sr.ep);
							item.append(divItem);
							window.tnOverlays.init(item.find('.main-content'));
						}	
						//container.append('<div class="search-item col-xs-6 col-sm-4 col-md-3 col-lg-3"><img style="width:100%;height:100%;" src="https://web.archive.org/web/20141231172951/http://placehold.it/640x360&text=Falling%20skies" /></div>');
					});
				} else {
					resultsEl.append('<div class="watchnow">No results found</div>');
				}

				updateSearchSize();		
				
				try{
					tntSearchResults(searchQuery,totalAvailableResults);
				} catch(e)
				{
				}
            }).fail(function () {
                resultsEl.append('<div class="watchnow">No results found</div>');
                //Tn.alert("Failed to load idol search data");
            });
        //});

}

// See if there is a search field on this page
page.find('.search-field').keyup(function () {
    if (Tn.searchTimer) {
        clearTimeout(Tn.searchTimer);
    }
    Tn.searchTimer = setTimeout(doSearch, 500);
});

doSearch();

});
}

/*
     FILE ARCHIVED ON 17:29:51 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:39 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 8.028
  load_resource: 196.357
  PetaboxLoader3.resolve: 156.066
  PetaboxLoader3.datanode: 15.847
*/