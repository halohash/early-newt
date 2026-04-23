// Rollover  v2.0.2
// documentation: http://www.dithered.com/javascript/rollover/index.html
// license: http://creativecommons.org/licenses/by/1.0/
// code by Chris Nott (chris[at]dithered[dot]com)

function isDefined(property) {
  return (typeof property != 'undefined');
}
var rolloverInitialized = false;
function rolloverInit() {
    if (!rolloverInitialized && isDefined(document.images)) {
        _rolloverInit();
    }
    rolloverInitialized = true;
}
function rolloverReInit() {
    _rolloverInit();
}
function _rolloverInit() {
    // get all images (including all <input type="image">s)
    // use getElementsByTagName() if supported
    var images = new Array();
    if (isDefined(document.getElementsByTagName)) {
        // getElementsByTagName() returns an HTMLCollection object; need to convert to normal array
        imagesCollection = document.getElementsByTagName('img');
        for (var elementIndex = 0; elementIndex < imagesCollection.length; elementIndex++) {
            images[images.length] = imagesCollection[elementIndex];
        }
        // add <input type="image">s to array of images
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == 'image') {
                images[images.length] = inputs[i];
            }
        }
    }
    // get all images with '_off.' in src value
    for (var i = 0; i < images.length; i++) {
        if (images[i].src.indexOf('_off.') != -1) {
            var image = images[i];
            // store the off state filename in a property of the image object
            image.offImage = new Image();
            image.offImage.src = image.src;
            // store the on state filename in a property of the image object
            // (also preloads the on state image)
            image.onImage = new Image();
            image.onImage.imageElement = image;
            // add onmouseover and onmouseout event handlers once the on state image has loaded
            // Safari's onload is screwed up for off-screen images; temporary fix
            if (navigator.userAgent.toLowerCase().indexOf('safari') != - 1) {
                image.onmouseover = function() {
                    this.src = this.onImage.src;
                };
                image.onmouseout = function() {
                    this.src = this.offImage.src;
                };
            } else {
                image.onImage.onload = function() {
                    this.imageElement.onmouseover = function() {
                        this.src = this.onImage.src;
                    };
                    this.imageElement.onmouseout = function() {
                        this.src = this.offImage.src;
                    };
                };
            }
            // set src of on state image after defining onload event handler
            // so cached images (that load instantly in IE) will trigger onload
            image.onImage.src = image.src.replace(/_off\./, '_on.');
        }
    }
}

// call rolloverInit when document finishes loading
if (isDefined(window.addEventListener)) {
   window.addEventListener('load', rolloverInit, false);
}
else if (isDefined(window.attachEvent)) {
   window.attachEvent('onload', rolloverInit);
}