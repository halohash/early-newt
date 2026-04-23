var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
// JavaScript
	
 var siteHost = "";
 var currentHost = window.siteDefaults.webSiteDomain;
 
 if(window.location.href.indexOf("dev19.tntdrama") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://www.tbs.com";
 } else if(window.location.href.indexOf("stage19.tbs") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://stage19.tntdrama.com";
 } else if(window.location.href.indexOf("stage19.tntdrama") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://stage19.tbs.com";
 } else if(window.location.href.indexOf("qa-ext.tntdrama") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://www.tbs.com";
 } else if(window.location.href.indexOf("dev19.tbs") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://dev19.tntdrama.com";
 } else if(window.location.href.indexOf("preprod19.tntdrama") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://preprod19.tbs.com";
} else if(window.location.href.indexOf("preprod19.tbs") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://preprod19.tntdrama.com";
} else if(window.location.href.indexOf("www.tntdrama.com") > -1){
	siteHost = "https://web.archive.org/web/20141231172957/http://www.tbs.com";
 } else {
    siteHost = "https://web.archive.org/web/20141231172957/http://www.tntdrama.com";
        }

 
$(document).ready (function () {
       
    $('#TNT-Switch'). click (function (e) {


        if(window.location.href == "https://web.archive.org/web/20141231172957/http://www.tbs.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tbs.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tbs.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tbs.com/?O_CID=TBSMain"){
            this.href = siteHost + "/?O_CID=TNTMain";



		}else if(window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tbs.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tbs.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tbs.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod.19.tbs.com/?O_CID=TBSMain"){
            this.href = siteHost + "/?O_CID=TNTMain";      

       }else if(window.location.href == "https://web.archive.org/web/20141231172957/http://www.tbs.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tbs.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tbs.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tbs.com/?O_CID=TBSMain"){
           this.href = siteHost + "/?O_CID=TNTMain";   

        } else if (window.location.href.indexOf("videos/movies") > -1){
            this.href = siteHost + "/movies/?O_CID=TNTMovPlayer"; 

   } else if (window.location.href.indexOf("videos" || "episode-" ) > -1){
            this.href = siteHost + "/shows/?O_CID=TNTEpiPlayer"; 

              } else if (window.location.href.indexOf("episode-") > -1){
            this.href = siteHost + "/shows/?O_CID=TNTShowInfo"; 

             } else if (window.location.href.indexOf("season-") > -1){
            this.href = siteHost + "/shows/?O_CID=TNTShowInfo"; 

        } else  if(window.location.href.indexOf("shows") > -1) {
            this.href = siteHost + "/shows/?O_CID=TNTShows";

        } else if (window.location.href.indexOf("movies/index.html") > -1) {
            this.href = siteHost + "/movies/?O_CID=TNTMovies";


        } else if (window.location.href.indexOf("movies") > -1) {
            this.href = siteHost + "/movies/?O_CID=TNTMovInfo";

        } else if (window.location.href.indexOf("search") > -1){
             this.href = siteHost + "/search.html?O_CID=TNTSearch";

        } else if (window.location.href.indexOf("help") > -1){
            this.href = siteHost + "/help.html?O_CID=TNTHelp";

        } else if (window.location.href.indexOf("watchtbs") > -1){
             this.href = siteHost + "/watchtnt/?O_CID=TNTLivePlayer";

         } else if ((window.location.href.indexOf("schedule") > -1) && (window.location.href.indexOf("list") > -1)){
            this.href = siteHost + window.location.pathname + "?O_CID=TNTSched";

         } else if (window.location.href.indexOf("schedule") > -1){
            this.href = siteHost + "/schedule/?O_CID=TNTSched";

        

        } else if (window.location.href.indexOf("privacy.html") > -1){
            this.href = siteHost + "/privacy.html";

         } else if (window.location.href.indexOf("terms.html") > -1){
            this.href = siteHost + "/terms.html";

           } else if (window.location.href.indexOf("dvs-offerings.html") > -1){
            this.href = siteHost + "/dvs-offerings.html";  

             } else if (window.location.href.indexOf("closed-captioning.html") > -1){
            this.href = siteHost + "/closed-captioning.html";  

  



        } else {
            this.href = sitehost + "/?O_CID=TNTMain";
        }
    });


     $('#TBS-Switch'). click (function (e) {

     	
       if(window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tntdrama.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tntdrama.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tntdrama.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://dev19.tntdrama.com/?O_CID=TNTMain"){
         this.href = siteHost + "/?O_CID=TBSMain";

      }else if(window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tntdrama.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tntdrama.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tntdrama.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://preprod19.tntdrama.com/?O_CID=TNTMain"){
         this.href = siteHost + "/?O_CID=TBSMain"; 

    }else if(window.location.href == "https://web.archive.org/web/20141231172957/http://qa-ext.tntdrama.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://qa-ext.tntdrama.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://qa-ext.tntdrama.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://qa-ext.tntdrama.com/?O_CID=TNTMain"){
          this.href = siteHost + "/?O_CID=TBSMain";       

    }else if(window.location.href == "https://web.archive.org/web/20141231172957/http://www.tntdrama.com" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tntdrama.com/" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tntdrama.com/index.html" || window.location.href == "https://web.archive.org/web/20141231172957/http://www.tntdrama.com/?O_CID=TNTMain"){
         this.href = siteHost + "/?O_CID=TBSMain";    

  } else if (window.location.href.indexOf("videos/movies") > -1){
            this.href = siteHost + "/movies/?O_CID=TBSMovPlayer"; 

   } else if (window.location.href.indexOf("videos" || "episode-" ) > -1){
            this.href = siteHost + "/shows/?O_CID=TBSEpiPlayer"; 

              } else if (window.location.href.indexOf("episode-") > -1){
            this.href = siteHost + "/shows/?O_CID=TBSShowInfo"; 

             } else if (window.location.href.indexOf("season-") > -1){
            this.href = siteHost + "/shows/?O_CID=TBSShowInfo"; 

        } else  if(window.location.href.indexOf("shows") > -1) {
            this.href = siteHost + "/shows/?O_CID=TBSShows"; 


        } else if (window.location.href.indexOf("movies/index.html") > -1) {
            this.href = siteHost + "/movies/?O_CID=TBSMovies";

             } else if (window.location.href.indexOf("movies") > -1) {
            this.href = siteHost + "/movies/?O_CID=TBSMovInfo";

        } else if (window.location.href.indexOf("search") > -1){
             this.href = siteHost + "/search.html?O_CID=TBSearch";

        } else if (window.location.href.indexOf("help") > -1){
            this.href = siteHost + "/help.html?O_CID=TBSHelp";

        } else if (window.location.href.indexOf("watchtnt") > -1){
             this.href = siteHost + "/watchtbs/?O_CID=TBSLivePlayer";
        } else if ((window.location.href.indexOf("schedule") > -1) && (window.location.href.indexOf("list") > -1)){
            this.href = siteHost + window.location.pathname + "?O_CID=TBSSched";

        } else if (window.location.href.indexOf("schedule") > -1){
            this.href = siteHost + "/schedule/?O_CID=TBSSched";

         

            } else if (window.location.href.indexOf("privacy.html") > -1){
            this.href = siteHost + "/privacy.html";

         } else if (window.location.href.indexOf("terms.html") > -1){
            this.href = siteHost + "/terms.html";

           } else if (window.location.href.indexOf("dvs-offerings.html") > -1){
            this.href = siteHost + "/dvs-offerings.html";  

             } else if (window.location.href.indexOf("closed-captioning.html") > -1){
            this.href = siteHost + "/closed-captioning.html";  

           
        } else {
            this.href = sitehost + "/?O_CID=TBSMain";
        }
    });

});



}

/*
     FILE ARCHIVED ON 17:29:57 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:39 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.509
  load_resource: 75.094
  PetaboxLoader3.resolve: 39.836
  PetaboxLoader3.datanode: 16.494
*/