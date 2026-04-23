var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
$('body').on('pageshown', function(event, pageId) {

  var page = $('#' + pageId);

  page.find('.glyphicon-print').off('click').on('click', function(event) {

    var printContent;

    if ($('.auxContent').length === 0) {
      printContent = page.html();
    } else {
      printContent = page.find('.auxContent').html();
    }


    if ($('#printFrame').length === 0) {
      $('<iframe>', {
        id: 'printFrame',
        height: 0,
        width: 0,
        frameborder: 0
      }).appendTo('body');

      $('#printFrame').contents().find('head').append('<link rel="stylesheet" href="/css/print.css">');
    }

    $('#printFrame').contents().find('body').empty().append(printContent);
    $('#printFrame').get(0).contentWindow.print();
  });
});
}

/*
     FILE ARCHIVED ON 17:29:55 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:41 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 1.234
  load_resource: 32.109
  PetaboxLoader3.datanode: 19.271
*/