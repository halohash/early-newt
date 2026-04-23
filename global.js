/*
  global.js
  DirecTV global js functions
  Authors: chad.lindstrom@blastradius.com, chris.nott@blastradius.com, allan.chang@blastradius.com, arch@blastradius.com
*/

// --------- begin right rail accordion code ---------

var aN_i           = null;     //item
var aN_a           = null;     //accordion
var aN_iBtnClass   = "hdrBtn"; //button class
var aN_aClass      = "accordion"; //button class
var aN_btn         = null;
var aN_btn_sel_src          = "/images/common/nav/bullet_minus.png";
var aN_btn_sel_over_src    = "/images/common/nav/bullet_minus_circle.png";
var aN_btn_unsel_src       = "/images/common/nav/bullet_plus.png";
var aN_btn_unsel_over_src    = "/images/common/nav/bullet_plus_circle.png";
/* activate accordion */
function actAcc(t){
   _swapBtn( _getBtn(t), 2 );
}
/* deactivate accordion */
function deactAcc(t){
   _swapBtn( _getBtn(t), 3 );
}
/* open accordion */
function toggleAcc(t){
   if( aN_a != null ){
      var _tmpThis = _getAcc(t);
      var _tmpActive = aN_a;

      aN_btn = _swapBtn( aN_btn, 0);
      aN_a = _hideAcc( aN_a );

      if( _tmpThis === _tmpActive ){
         return;
      }
   }
   aN_btn = _swapBtn( _getBtn(t), 1);
   aN_a = _getAcc(t);
   _showAcc( aN_a );
}
function _hideAcc(t){
   if( t != null ){
      t.style.display = "none";
   }
   return null;
}
function _showAcc(t){
   if( t != null ){
      t.style.display = "block";
   }
}
/* flag values: 0=> swap it click, 1=> revert it, 2=> swap it over, 3=> swap it out */
function _swapBtn(b,flag){
   if( b == null ){
      return null;
   }
   if(flag == 1){
      b.src = aN_btn_sel_src;
   } else if(flag == 2){
      //do mouse-over swapping
      if(b.src.indexOf(aN_btn_sel_src) > 0){
         b.src = aN_btn_sel_over_src;
      } else if(b.src.indexOf(aN_btn_unsel_src) > 0){
         b.src = aN_btn_unsel_over_src;
      }
   } else if(flag == 3){
      //do mouse-out swapping
      if(b.src.indexOf(aN_btn_sel_over_src) > 0){
         b.src = aN_btn_sel_src;
      } else if(b.src.indexOf(aN_btn_unsel_over_src) > 0){
         b.src = aN_btn_unsel_src;
      }
   } else{
      b.src = aN_btn_unsel_src;
   }
   return b;
}
function _getBtn(t){
   return _getObj(t.childNodes,aN_iBtnClass);
}
function _getAcc(t){
   return _getObj(t.parentNode.childNodes,aN_aClass);
}
window.onload = function() {
   _tmpObj = document.getElementById('openAccordion');
   if( _tmpObj != null ){
      toggleAcc(_tmpObj);
      _tmpObj = null;
   }
}

// --------- end right rail accordion code ---------

// --------- begin left navigation initialization code ---------

function initializeNavAccordion(accordionId, activeAccordion) {
    var navAccordion = new accordion(accordionId, {
        classNames : {
            toggle : 'nav_accordion_toggle',
            toggleActive : 'nav_accordion_toggle_active',
            content : 'nav_accordion_content'
        },
        direction : 'vertical'
    });
    if (activeAccordion >= 0) {
        navAccordion.activate($$('#' + accordionId + ' .nav_accordion_toggle')[activeAccordion]);
    }
    $('nav_accordion_container').fire('dtv:navAccordionOpened');
}
function initializeSubNavAccordion(accordionId, activeIndex) {
    var subnavAccordion = new accordion(accordionId, {
        classNames : {
            toggle : 'subnav_accordion_toggle',
            toggleActive : 'subnav_accordion_toggle_active',
            content : 'subnav_accordion_content'
        },
        direction : 'vertical'
    });
    if (activeIndex >= 0) {
        subnavAccordion.activate($$('#' + accordionId + ' .subnav_accordion_toggle')[activeIndex]);
    }
}

// --------- end left navigation initialization code ---------

// --------- begin generic form utility code ---------

function _getObj(items,c){
   var _s = items.length;
   if( _s > 0 ){
      for( var i = 0; i < _s; i++ ){
         if( items[i].className == c ){
            return items[i];
         }
      }
   }
   return null;
}
function _getObj2(items,c){
   var _s = items.length;
   if( _s > 0 ){
      for( var i = 0; i < _s; i++ ){
         if( items[i].className != null && items[i].className.indexOf(c) != -1 ){
            return items[i];
         }
      }
   }
   return null;
}
// Disable the ability to copy text from a field (CTRL+C).
function disableCopy(element) {
    element.oncopy = function() {
        return false;
    };
}
 //used to move cursor in phone and sin fields
function cursorHelper(t){
   if(t.className.indexOf('areaCode') != -1){
      if( t.value.length < 3 ){
         return;
      }
      var _tmpObj = _getObj2(t.parentNode.childNodes,'num3');
      _tmpObj.focus();
   }
   if(t.className.indexOf('num3') != -1){
      if( t.value.length < 3 ){
         return;
      }
      var _tmpObj = _getObj2(t.parentNode.childNodes,'num4');
      _tmpObj.focus();
   }
   if(t.className.indexOf('sin1') != -1){
      if( t.value.length < 3 ){
         return;
      }
      var _tmpObj = _getObj(t.parentNode.childNodes,'sin2');
      _tmpObj.focus();
   }
   if(t.className.indexOf('sin2') != -1){
      if( t.value.length < 2 ){
         return;
      }
      var _tmpObj = _getObj(t.parentNode.childNodes,'sin3');
      _tmpObj.focus();
   }
}
function checkMaxLength(inputObj,maxChars,outputObj,doChop,display){
   var _obj = document.getElementById(outputObj);
   if(inputObj){
      if( inputObj.value.length >= maxChars ){
         if( doChop ){
            inputObj.value = inputObj.value.substr(0,maxChars);
         }
         if(_obj && _obj.innerHTML){
            _obj.innerHTML = (display) ? display : "No";
         }
      } else {
         var _tmpMaxChars = maxChars - inputObj.value.length;
         if(_obj && _obj.innerHTML){
            _obj.innerHTML = _tmpMaxChars;
         }
      }
   }
}
/**
 * Disable double clicking on any form input button for forms with a class name of
 * "disableDoubleClick".  Once the button has been clicked it will be disabled.
 * This method should only be called once the page has fully loaded, which can be
 * done by adding the code Event.observe(window, 'load', initializeDisableDoubleClick, false);
 * to any page which should implement this method.
 */
function initializeDisableDoubleClick() {
    $$('form.disableDoubleClick').each(function(form) {
        form.observe('submit', function() {
            form.getInputs('submit').each(function(submit) {
                submit.onclick = function() { return false; };
            });
            form.getInputs('image').each(function(submit) {
                submit.onclick = function() { return false; };
                submit.onmouseover = null;
            });
            return false;
        });
    });
}

// --------- end generic form utility code ---------

// --------- begin popup window code ---------

var winReference = null;
// Open a window at a given position on the screen
function openPositionedWindow(url, name, width, height, x, y, status, scrollbars, moreProperties, openerName) {
   var properties = 'width=' + width + ',height=' + height + ',screenX=' + x + ',screenY=' + y + ',left=' + x + ',top=' + y + ((status) ? ',status' : '') + ',scrollbars' + ((scrollbars) ? '=yes' : '=no') + ((moreProperties) ? ',' + moreProperties : '');
   var reference = openWindow(url, name, properties, openerName);
   return reference;
}
// Open a window at the center of the screen
function openCenteredWindow(url, name, width, height, status, scrollbars, moreProperties, openerName) {
   var x, y = 0;
   if (screen) {
      x = (screen.availWidth - width) / 2;
      y = (screen.availHeight - height) / 2;
   }
   if (!status) status = '';
   if (!openerName) openerName = '';
   var reference = openPositionedWindow(url, name, width, height, x, y, status, scrollbars, moreProperties, openerName);
   return reference;
}
// Core utility function that actually creates the window and gives focus to it
function openWindow(url, name, properties, openerName) {
   winReference = window.open(url, name, properties);
   // ie doesn't like giving focus immediately (to new window in 4.5 on mac; to existing ones in 5 on pc)
   setTimeout('if (winReference && !winReference.closed) winReference.focus()', 200);
   if (openerName) top.name = openerName;
   return winReference;
}
function largePopup(t){
	openCenteredWindow(t.href, 'largePopup', 382, 444, true, false, '', 'opener');
	return false;
}
function formPopup(t){
	openCenteredWindow(t.href, 'formPopup', 395, 358, true, true, '', 'opener');
	return false;
}
function smallPopup(t){
	openCenteredWindow(t.href, 'smallPopup', 382, 232, true, false, '', 'opener');
	return false;
}
function MoreInfoPopup(t){
	openCenteredWindow(t.href, 'moreInfo', 382, 232, true, false, '', 'opener');
	return false;
}
function ShowDetailsPopup(t){
	openCenteredWindow(t.href, 'details', 680, 550, true, false, '', 'opener');
	return false;
}
function ShowAddWatchListPopup(t){
	openCenteredWindow(this.href, 'addToWatchlist', 382, 244, true, false, '', 'opener');
	return false;
}
function popup(url, scroll){
  var scrollable;
  scroll? scrollable=",scrollbars": scrollable="";
  newwin = window.open(url, "winpopup1","WIDTH=320,HEIGHT=350" + scrollable);
  newwin.focus();
}
function ResizePopup(width, height) {
    var setWidth, setHeight;
    if (self.innerHeight) { // all except Explorer
        setWidth = self.innerWidth;
        setHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        setWidth = document.documentElement.clientWidth;
        setHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
        setWidth = document.body.clientWidth;
        setHeight = document.body.clientHeight;
    }
    setWidth = width - setWidth;
    setHeight = height - setHeight;
    window.resizeBy(setWidth, setHeight);
};

// --------- end popup window code ---------

// --------- begin div scrolling code ---------

/**
 * find the parent of the current element's parent (if any exists).
 */
function findGrandparent(grandchild) {
   activeObject = document.getElementById(grandchild);
   if (activeObject == null || activeObject.parentNode == null || activeObject.parentNode.parentNode == null) {
      return null;
   }
   return activeObject.parentNode.parentNode;
}
/**
 * if a given element is offscreen scroll the screen to ensure that it is fully
 * visible.  use of this method requires that the prototype.js library has
 * been previously loaded.
 */
function scrollSelection(scrollTarget, scrollerName) {
   activeObject = $(scrollTarget);
   if (activeObject == null) {
      return;
   }
   // scrollerName is the name of a div in which scrolling is occurring.
   // if that parameter is null then the entire browser window will be used
   // as the scrolling object.
   var scrollObject = $(scrollerName);
   // top & bottom of the div being expanded
   var elementTop = relativePositionY(activeObject, scrollObject);
   var elementBottom = elementTop + Element.getHeight(activeObject);
   // top & bottom of the currently visible scroll window
   var displayTop = 0;
   if (scrollObject != null) {
      // div specified
      displayTop = scrollObject.scrollTop;
   } else if (window.innerHeight) {
      // non-IE
      displayTop = window.pageYOffset;
   } else if (document.documentElement && document.documentElement.clientHeight) {
      // IE6 w/ DOCTYPE
      displayTop = document.documentElement.scrollTop;
   } else if (document.body.clientHeight) {
      // other IE
      displayTop = document.body.scrollTop;
   } else {
      // didn't work, just return
      return;
   }
   var displayBottom = 0;
   if (scrollObject != null) {
      // div specified
      displayBottom = scrollObject.scrollTop + scrollObject.clientHeight;
   } else if (window.innerHeight) {
      // non-IE
      displayBottom = window.pageYOffset + window.innerHeight;
   } else if (document.documentElement && document.documentElement.clientHeight) {
      // IE6 w/ DOCTYPE
      displayBottom = document.documentElement.scrollTop + document.documentElement.clientHeight;
   } else if (document.body.clientHeight) {
      // other IE
      displayBottom = document.body.scrollTop + document.body.clientHeight;
   } else {
      // didn't work, just return
      return;
   }
   // offset provides a small buffer for the display
   var offset = 30;
   if (elementTop < 0) {
      // can occur during closing/opening on IE
      elementTop = 0;
   }
   if (elementTop < offset) {
      offset = elementTop;
   }
   if ((elementTop - offset) < displayTop) {
      // scroll up
      var destinationY = elementTop - offset;
      scrollUp(destinationY, scrollerName);
   } else if (displayBottom < elementBottom) {
      // scroll down
      var destinationY = displayTop + (elementBottom - displayBottom);
      scrollDown(destinationY, scrollerName);
   }
}
/**
 * given the name of a scrolling element, scroll that element so that the given
 * destinationY value is at the top of the screen.  this method scrolls in increments
 * using a small delay, producing a nice animation effect.
 */
function scrollUp(destinationY, scrollElement) {
   var scrollObject = $(scrollElement);
   var displayTop = 0;
   if (scrollObject != null) {
      // div specified
      displayTop = scrollObject.scrollTop;
   } else if (window.innerHeight) {
      // non-IE
      displayTop = window.pageYOffset;
   } else if (document.documentElement && document.documentElement.clientHeight) {
      // IE6 w/ DOCTYPE
      displayTop = document.documentElement.scrollTop;
   } else if (document.body.clientHeight) {
      // other IE
      displayTop = document.body.scrollTop;
   }
   if (displayTop <= destinationY) {
      return;
   }
   if (scrollObject != null) {
      scrollObject.scrollTop = scrollObject.scrollTop - 10;
   } else {
      window.scrollTo(0, displayTop - 10);
   }
   setTimeout("scrollUp('" + destinationY + "', '" + scrollElement + "')", 5);
}
/**
 * given the name of a scrolling element, scroll that element so that the given
 * destinationY value is at the top of the screen.  this method scrolls in increments
 * using a small delay, producing a nice animation effect.
 */
function scrollDown(destinationY, scrollElement) {
   var scrollObject = $(scrollElement);
   var displayTop = 0;
   if (scrollObject != null) {
      // div specified
      displayTop = scrollObject.scrollTop;
   } else if (window.innerHeight) {
      // non-IE
      displayTop = window.pageYOffset;
   } else if (document.documentElement && document.documentElement.clientHeight) {
      // IE6 w/ DOCTYPE
      displayTop = document.documentElement.scrollTop;
   } else if (document.body.clientHeight) {
      // other IE
      displayTop = document.body.scrollTop;
   }
   if (displayTop >= destinationY) {
      return;
   }
   if (scrollObject != null) {
      scrollObject.scrollTop = scrollObject.scrollTop + 10;
   } else {
      window.scrollTo(0, displayTop + 10);
   }
   setTimeout("scrollDown('" + destinationY + "', '" + scrollElement + "')", 5);
}
/**
 * calculate the position element with respect to the top of the current document.
 * this method accounts for scrolling elements in its height calculations, and
 * the height calculation includes elements that are offscreen.
 */
function relativePositionY(obj, scrollObj) {
   var posY = 0;
   if (obj.offsetParent) {
      posY = obj.offsetTop;
      while (obj = obj.offsetParent) {
         posY += obj.offsetTop;
      }
   }
   // subtract height of scroll object, if any
   if (scrollObj != null) {
      posY -= relativePositionY(scrollObj, null);
   }
   return posY;
}

// --------- end div scrolling code ---------

// --------- begin email preferences code ---------

/**
 * Email signup processing functions.  Requires prototype and scriptaculous.
 */
var emailSignupUrl = "/DTVAPP/emailsignup/emailSignup.jsp";
function saveEmail() {
   $('go').toggle();
   $('load').toggle();
   var params = new Array();
   var email = document.forms['signupForm'].emailField.value;
   params.push('email=' + email);
   var myAjax = new Ajax.Request( emailSignupUrl, {method: 'get', parameters: params.join('&'), onComplete: function(transport) {processResult(transport)}});
}
function processResult(transport) {
   $("default").hide();
   $("customers").hide();
   if (transport.responseText.match(/success/)) {
      $("fr").hide();
      $("success").toggle();
      $("validation").hide();
      $("error").hide();
      emailSignupPopup();
   } else if (transport.responseText.match(/exception/)) {
      $("validation").hide();
      $("error").show();
      $("error").setStyle({color:'red'});
      $('load').toggle();
      $('go').toggle();
   } else {
      $("error").hide();
      $("validation").show();
      $("validation").setStyle({color:'red'});
      $('load').toggle();
      $('go').toggle();
   }
}
function emailSignupPopup(signupEmailAddress) {
   if (!signupEmailAddress) {
       signupEmailAddress = document.forms['signupForm'].emailField.value;
   }
   var link = "/DTVAPP/emailsignup/interest.jsp?email=" + signupEmailAddress;
   openCenteredWindow(link,'details', 382, 450, true, false, '', 'opener');
   return false;
}

// --------- end email preferences code ---------

// --------- begin div transition effect code ---------

// keep track of which elements are currently being used in transitions.  necessary to
// avoid executing effects out of order
var transitionEffect = null;
/**
 * Hide one div and use a nice effect to make a new div appear.
 *
 * @param currentDiv The div that will be replaced/hidden.
 * @param nextDiv The new div to display.
 */
function transition(currentDiv, nextDiv) {
    if ($(nextDiv) == null) {
        throw "function transition() called with nextDiv element '" + nextDiv + "' that does not exist";
    }
    if (transitionEffect != null) {
        // if there is an effect in progress then there is an ordering issue so kill the
        // old effect.
        transitionEffect.cancel();
    }
    transitionEffect = Effect.Appear(nextDiv, {afterFinish: transitionComplete});
    Element.hide(currentDiv);
    // close any opened tooltips for the element that is disappearing
    closeTooltipsByClass(currentDiv);
}
function transitionComplete(obj) {
    transitionEffect = null;
}

// --------- end div transition effect code ---------

// --------- begin ajax form handling code ---------

// SubmitWatcher is used with Ajax to submit a form and then process the result.  this class
// adds an event handler to a form submit button that intercepts any clicks of that button
// and instead submits the form using Ajax.
var SubmitWatcher = Class.create();
SubmitWatcher.prototype = {
    // constructor
    initialize: function(submitId, formId, options) {
        this.formId = formId;
        if (!$(submitId)) {
            throw "submitId does not exist in SubmitWatcher.initialize()";
        }
        if (!$(this.formId)) {
            throw "formId does not exist in SubmitWatcher.initialize()";
        }
        this.setOptions(options);
        // FIXME - there HAS to be a way to do this by specifying element.eventType as a variable.
        if (this.options.eventType == 'change') {
            $(submitId).onchange = this.hijackNode.bindAsEventListener(this);
        } else {
            $(submitId).onclick = this.hijackNode.bindAsEventListener(this);
        }
        // additionally set a watcher for the form submit to handle submits where the user simply
        // presses the enter key without clicking a button.
        $(formId).onsubmit = this.hijackNode.bindAsEventListener(this);
    },
    // set up the default options array, and then override those values with any values
    // initialized in the constructor.
    setOptions: function(options) {
        this.options = {
            successHandler:    null,
            failureHandler:    null,
            createHandler:     null,
            transitionHandler: null,
            jsonErrorHandler:  null,
            returnValue:       false,
            eventType:         'click'
        };
        Object.extend(this.options, options || { });
    },
    // hijackNode is called if a user clicks on the form element that was specified in submitId
    // when this class was initialized.  it will serialize the form, submit the ajax request,
    // and execute any handlers that have been defined.
    hijackNode: function(e) {
        if (this.options.createHandler != null) {
            var createStatus = this.options.createHandler(this.formId);
            if (!createStatus) {
                return this.options.returnValue;
            }
        }
        var _this = this;
        var params = {
            requestHeaders: {Accept: 'application/json'},
            method: 'post',
            parameters: Form.serialize($(this.formId), true),
            mimetype: "application/json",
            onSuccess: function(transport) {
                if (transport.responseText.evalJSON().success) {
                    _this._applyTransitionHandler('onSuccess');
                } else {
                    _this._applyTransitionHandler('onFailure');
                }
                _this._applyJsonErrorHandler(transport.responseText);
                _this._applyHandler(_this.options.successHandler, transport.responseText.evalJSON());
            },
            onFailure: function(transport) {
                _this._applyTransitionHandler('onFailure');
                _this._applyJsonErrorHandler(transport.responseText);
                _this._applyHandler(_this.options.failureHandler, transport.responseText.evalJSON());
            },
            onCreate: function() {
                _this._applyTransitionHandler('onCreate');
            }
        };
        // submit the Ajax request
        new Ajax.Request($(this.formId).action, params);
        return this.options.returnValue;
    },
    // _applyHandler is an internal helper method used to execute handlers defined for this class.
    _applyHandler: function(handler, json) {
        if (handler == null) {
            return;
        }
        handler(this.formId, json);
    },
    // _applyHandler is an internal helper method used to execute any transitions that have been
    // defined for this class.
    _applyTransitionHandler: function(transitionMode) {
        if (this.options.transitionHandler == null) {
            return;
        }
        if (transitionMode == 'onCreate') {
            transition(this.options.transitionHandler.currentDiv, this.options.transitionHandler.transitionDiv);
        } else if (transitionMode == 'onSuccess') {
            transition(this.options.transitionHandler.transitionDiv, this.options.transitionHandler.successDiv);
        } else if (transitionMode == 'onFailure') {
            transition(this.options.transitionHandler.transitionDiv, this.options.transitionHandler.failureDiv);
        }
    },
    // _applyHandler is an internal helper method used to execute any error handling that has been
    // defined for this class.
    _applyJsonErrorHandler: function(json) {
        if (this.options.jsonErrorHandler == null) {
            return;
        }
        processJSONErrors(this.options.jsonErrorHandler.errorContainer, this.options.jsonErrorHandler.messageContainer, this.options.jsonErrorHandler.errorClass, json.evalJSON());
    }
}

// --------- end ajax form handling code ---------

// --------- begin lightbox code ---------

// keep arrays of open lightbox elements.  if multiple lightboxes are opened then the
// elements of the arrays will correspond to each open lightbox in the stack (ie top-level
// lightbox is element 0, second-level lightbox is element 1, etc).
var _currentLightboxWindow = new Array();
var _currentLightboxContentDiv = new Array();
var _currentLightboxSubContentDiv = new Array();
/**
 * Open a lightbox from a div using a specified width and height.  Once the lightbox is displayed
 * a callback event will fire for any code that is listening.
 *
 * @param contentOptions An array of information about what content can be displayed in the
 *  lightbox.  Valid values are:
 *    contentDiv:         The id of a div that will be displayed in the lightbox.
 *    contentSubDiv:      A div within contentDiv that will be made visible.  Useful for
 *                        lightboxes that flow through multiple displays.
 *    ajaxUrl:            A URL that contains the content to display in the lightbox.
 *    callback:           The name of a custom event to fire once the lightbox has opened.
 *                        Callback events MUST be pre-pended with a namespace; for
 *                        example: 'dtv:event'.
 *    hitboxPageName:     The hbx.pn value to report to hitbox for this lightbox.  If not
 *                        supplied then the parent page's hbx.pn value will be used with "Lightbox"
 *                        "Lightbox" appended.
 *    hitboxPageCategory: The hbx.mlc value to report to hitbox for this lightbox.  If not
 *                        supplied then the parent page's hbx.mlc value will be used.
 * @param lightboxOptions (Optional) Any options that can be used in the window.js Window()
 *  constructor.  See http://prototype-window.xilinus.com/documentation.html#initialize for details.
 */
function displayLightbox(contentOptions, lightboxOptions) {
    // set some global lightbox values depending on the content source
    if (contentOptions.ajaxUrl != null) {
        lightboxId = 'lb_' + new Date().getTime() + 'Lightbox';
        _currentLightboxContentDiv.unshift(null);
        _currentLightboxSubContentDiv.unshift(null);
    } else if (contentOptions.contentDiv != null) {
        lightboxId = contentOptions.contentDiv + 'Lightbox';
        if ($(lightboxId)) {
            // attempt to open a lightbox that is already open.  this can happen if a user double
            // clicks on a link that opens a lightbox
            return;
        }
        _currentLightboxContentDiv.unshift(contentOptions.contentDiv);
        _currentLightboxSubContentDiv.unshift(contentOptions.subContentDiv);
    } else {
        throw "contentOptions.contentDiv or contentOptions.ajaxUrl must be specified in openLightbox()";
    }
    // initialize the callback event if one exists
    var callback = null;
    if (contentOptions.callback != null) {
        if (contentOptions.contentDiv != null) {
            callback = '$(\'' + contentOptions.contentDiv + '\').fire(\'' + contentOptions.callback + '\')';
        } else {
            callback = '$(\'' + lightboxId + '\').fire(\'' + contentOptions.callback + '\')';
        }
    }
    // if there is a subContentDiv make it visible
    if ($(contentOptions.subContentDiv) != null) {
        hideChildDivs(contentOptions.contentDiv);
        $(contentOptions.subContentDiv).show();
    }
    // set up default lightbox options and event handlers
    lightboxOptions = Object.extend({
        showEffect: Element.show,
        hideEffect: Element.hide,
        id: lightboxId,
        className: 'alert',
        recenterAuto: false,
        onShow: function() {
            // the lightbox will not resize unless the height property is reset to auto
            $(_currentLightboxWindow[0].getId()).setStyle({height: 'auto'});
            $(_currentLightboxWindow[0].getId() + '_content').setStyle({height: 'auto'});
            if (callback != null) {
                setTimeout(callback, 1000);
            }
        },
        onClose: function() {
            if (contentOptions.subContentDiv != null) {
                $(contentOptions.subContentDiv).hide();
            }
        }
    }, lightboxOptions || {});
    // build and display the lightbox
    _currentLightboxWindow.unshift(new Window(lightboxOptions));
    if (contentOptions.ajaxUrl != null) {
        _currentLightboxWindow[0].setAjaxContent(contentOptions.ajaxUrl, { }, false, false);
    } else {
        _currentLightboxWindow[0].setContent(contentOptions.contentDiv, false, false);
    }
    _currentLightboxWindow[0].showCenter(true, lightboxOptions.top, lightboxOptions.left);
    _currentLightboxWindow[0].setDestroyOnClose();
    _currentLightboxWindow[0].setZIndex(999);
    // fire any hitbox reporting if needed
    hitboxCustomEvent(contentOptions.hitboxPageName, contentOptions.hitboxPageCategory);
}
// close the currently opened lightbox
function closeLightbox() {
    if (_currentLightboxWindow.length == 0) {
        throw "closeLightbox() called when no lightbox is open";
    }
    _currentLightboxWindow[0].close();
    // hide visible divs
    $(_currentLightboxContentDiv[0]).hide();
    // hide any tooltips that were opened in the lightbox
    closeTooltipsByClass(_currentLightboxContentDiv[0]);
    if (_currentLightboxSubContentDiv[0] != null) {
        hideChildDivs(_currentLightboxContentDiv[0]);
    }
    $(_currentLightboxContentDiv[0]).hide();
    _currentLightboxSubContentDiv.shift();
    _currentLightboxContentDiv.shift();
    _currentLightboxWindow.shift();
}
/**
 * Hide all children of a parent div.
 */
function hideChildDivs(parentDiv) {
    if ($(parentDiv) == null) {
        return;
    }
    $(parentDiv).immediateDescendants().each(
        function(element) {
            element.hide();
        }
    );
}
/**
 * Report a custom page "hit" to Hitbox.  This functionality is primarily used with lightboxes
 * to trigger Hitbox reporting.
 *
 * @param hitboxPageName (Optional) The hbx.pn value to report to hitbox for this lightbox.  If not
 *  supplied then the parent page's hbx.pn value will be used with "Lightbox" appended.
 * @param hitboxPageCategory (Optional) The hbx.mlc value to report to hitbox for this lightbox.  If not
 *  supplied then the parent page's hbx.mlc value will be used.
 */
function hitboxCustomEvent(hitboxPageName, hitboxPageCategory) {
    var hbxPn = 'Lightbox+with+no+page+name+set';
    if (hitboxPageName != null && hitboxPageName != '') {
        hbxPn = hitboxPageName.replace(/\s/, '+');
    } else if (hbx.pn != null && hbx.pn != '') {
        hbxPn = hbx.pn + '+Lightbox';
    }
    if (hitboxPageCategory != null) {
        _hbPageView(hbxPn, hitboxPageCategory.replace(/\s/, '+'));
    } else {
        _hbPageView(hbxPn, _mlc);
    }
}

// --------- end lightbox code ---------

// --------- begin error/message display code ---------

/**
 * Make the error div visible and display error messages.  The error div is
 * typically a container div at the top of the page.  Within that container div
 * there must be an empty div that will receive the error message text.
 *
 * @param errorDiv A div element that will be made visible if there are errors.
 * @param errorMessageDiv A div element that will have the error message written to it.
 * @param errorMessageClass A CSS class that will be applied to any form elements that
 *  are in an error state.
 * @param json A JSON Javascript object.  The object should contain an optional error message
 *  array (json.errors) and an optional array of div ids for those elements that are in an
 *  error state (json.errorElements).  Note that any elements in an error state with a
 *  corresponding label element with an id of the form "element id" + "Label", or an icon area
 *  with an id of the form "element id" + "Icon" will also have the CSS style applied to them.
 */
function processJSONErrors(errorDiv, errorMessageDiv, errorMessageClass, json) {
    // remove error CSS for fields currently in error state
    var errorElements = document.getElementsByClassName(errorMessageClass);
    for (var i=0; i < errorElements.length; i++) {
        $(errorElements[i]).removeClassName(errorMessageClass);
    }
    // now display new errors
    displayMessages(errorDiv, errorMessageDiv, json.errors, 'errorListItem');
    if (json.errorFields != null && json.errorFields.length > 0) {
        for (var i=0; i < json.errorFields.length; i++) {
            applyFieldError(errorMessageClass, json.errorFields[i]);
        }
    }
}
/**
 * Apply an error style to a field, as well as any associated field label and hidden
 * error icon.  To work, the field must have an ID of elementId, the (optional) label
 * for the must have an id of elementId + "Label", and the (optional) icon should be
 * set up as an empty span with an id of elementId + "Icon".
 *
 * @param errorMessageClass A CSS class that will be applied to any form elements that
 *  are in an error state.
 * @param elementId The HTML element ID for the field that will have an error state
 *  applied to it.  In addition, if a label with an ID or elementId + "Label" exists
 *  then it will have the error style applied to it, as will a hidden icon with the
 *  ID elementId + "Icon".
 */
function applyFieldError(errorMessageClass, elementId) {
    Element.addClassName(elementId, errorMessageClass);
    Element.addClassName(elementId + 'Label', errorMessageClass);
    Element.addClassName(elementId + 'Icon', errorMessageClass);
}
/**
 * Display an array of messages in a general message box.  Messages are displayed
 * as list items (<li>message</li>) and an appropriate class is added for display.
 * To work this method requires a div that contains all messages, and another div
 * within the container div that should be empty and will receive the message text.
 *
 * @param messageDiv The container div for the message box.
 * @param messageDiv The element that contains the actual message messages.
 * @param messages An array of messages.
 * @param messageClass The CSS style applied to the <li> tag.
 */
function displayMessages(messageContainerDiv, messageDiv, messages, messageClass) {
    if (!$(messageContainerDiv)) {
        throw "messageContainerDiv does not exist in displayMessages()";
    }
    if (!$(messageDiv)) {
        throw "messageDiv does not exist in displayMessages()";
    }
    // first hide any previously displayed messages
    $(messageContainerDiv).hide();
    if (messages == null || messages.length <= 0) {
        return;
    }
    // now display any new messages
    $(messageContainerDiv).show();
    var displayedMessage = '';
    for (var i=0; i < messages.length; i++) {
        displayedMessage += '<li class=\"' + messageClass + '\">' + messages[i] + '</li>';
    }
    $(messageDiv).update(displayedMessage);
}

// --------- end error/message display code ---------

// --------- begin session timeout code ---------

/**
 * Display a warning lightbox when the session is about to expire.  Triggered
 * from a window.setTimeout event in timeoutLoggedIn.jsp.
 */
function timeoutWarning() {
    displayLightbox({ contentDiv: 'lightboxTimeoutDiv', callback: 'dtv:lightboxTimeoutOpened', hitboxPageName: 'Session Timeout Warning Lightbox', hitboxPageCategory: '/global' }, { width: 568, height: 330, top: 100 });
    return false;
}
/**
 * When the session timeouts redirect to a logout page.  Triggered from a window.setTimeout
 * event in timeoutLoggedIn.jsp.
 *
 * @param wizardTimeout Set to true if this method is for the wizard, false otherwise.
 */
function executeTimeout(url) {
    self.location = self.location.protocol + '//' + self.location.host + url
                  + '?reason=timeout&lastVisited=' + self.location.pathname +  self.location.search;
}
/**
 * Prior to expiring a lightbox is displayed that allows the user to extend their session.  This
 * method is triggered if they choose to do so and extends the session, resetting any timeouts
 * in the process.
 */
function refreshSession() {
    url = '/DTVAPP/global/touch.jsp';
    new Ajax.Request(url, { method: 'get' });
    initTimeouts();
    closeLightbox();
    return false;
}

// --------- end session timeout code ---------

// --------- begin tooltip code ---------

// default class that should be used with tooltips.  only use a different class if tooltips
// need to be initialized / closed in separate groupings.
var _defaultTooltipClass = 'tooltipLink';
// create a tooltip box
function initializeTooltip(activatorDiv, tooltipDiv) {
    new Tip(activatorDiv, $(tooltipDiv).innerHTML, {effect: 'appear', hook: {target: 'topRight', tip: 'bottomLeft'}, offset: {x: -50, y: 5}, activation: 'click', deactivation: 'dtv:closeTooltip'});
}
// fire a "closeTooltip" event to close a tooltip.  openerId is the object that opened the
// tooltip since all handlers are registered for that object by default.
function closeTooltip(openerId) {
    $(openerId).fire('dtv:closeTooltip');
    }
// given a class name, find all links with that class and use the value of their "rel" attribute
// (which should contain the tooltip div id) to initialize tooltips.
function initializeTooltipsByClass(containerDiv, cssClass) {
    retrieveTooltips(containerDiv, cssClass).each(
        function(element) {
            initializeTooltip(element, element.rel);
}
    );
        }
// close tooltips given a css class and an (optional) container div
function closeTooltipsByClass(containerDiv, cssClass) {
    retrieveTooltips(containerDiv, cssClass).each(
        function(element) {
            closeTooltip(element);
}
    );
}
// create a pattern for finding tooltip activators by class
function retrieveTooltips(containerDiv, cssClass) {
    if (!cssClass) {
        cssClass = _defaultTooltipClass;
    }
    if ($(containerDiv) != null) {
        return $(containerDiv).getElementsBySelector('a.' + cssClass);
    }
    return $$('a.' + cssClass);
}

// --------- end tooltip code ---------

// --------- content page support code ---------

// initialize a promo image (used by business) - must be initialized only after page load completes
function initializePromo() {
    var cookieName = "customer";
    var theCookie = "" + document.cookie;
    var ind = theCookie.indexOf(cookieName);
    if (ind == -1 || cookieName == "") {
        var p = $("prospect-promo");
        if (p != null) {
            p.toggle();
        }
    } else {
        var c = $("customer-promo");
        if (c != null) {
            c.toggle();
        }
    }
 }

// --------- content page support code ---------
