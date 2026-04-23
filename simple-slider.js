var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
/*
 jQuery Simple Slider

 Copyright (c) 2012 James Smith (http://loopj.com)

 Licensed under the MIT license (http://mit-license.org/)

*/
/*
  jhillmann - The original was a horizontal slider.  I turned it into a vertical slider but can go back and set up the 
  direction setting so it could be either direction

*/

var __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) {return i;} } return -1; };

(function($, window) {
  var SimpleSlider;
  SimpleSlider = (function() {

    function SimpleSlider(input, options) {
      var ratio,
        _this = this;
      this.input = input;
      this.defaultOptions = {
        animate: true,
        snapMid: false,
        classPrefix: null,
        classSuffix: null,
        theme: null,
        highlight: false,
        direction: 'vertical'
      };
      this.settings = $.extend({}, this.defaultOptions, options);
      if (this.settings.theme) {
        this.settings.classSuffix = "-" + this.settings.theme;
      }
      this.input.hide();

      // we dont' want the css written to the element
      this.slider = $("<div>").addClass("slider" + (this.settings.classSuffix || "")).insertBefore(this.input);
      this.slider.css({
          height: this.slider.parent().height()
      });
      if (this.input.attr("id")) {
        this.slider.attr("id", this.input.attr("id") + "-slider");
      }

      this.track = this.createDivElement("track").css({
        //height: "100%"
      });

      if (this.settings.highlight) {
        this.highlightTrack = this.createDivElement("highlight-track").css({
          height: "100%"
        });
      }
      this.dragger = this.createDivElement("dragger");
      this.slider.css({
        //minHeight: this.dragger.outerHeight(),
        //marginLeft: this.dragger.outerWidth() / 2,
        //marginRight: this.dragger.outerWidth() / 2
      });
      this.track.css({
        //marginTop: this.track.outerHeight() / -2
      });
      if (this.settings.highlight) {
        this.highlightTrack.css({
          //marginTop: this.track.outerHeight() / -2
        });
      }
      this.dragger.css({
        //marginTop: this.dragger.outerHeight() / -2
        //marginLeft: this.dragger.outerWidth() / -2
      });

      // MOUSE EVENTS

      this.track.mousedown(function(e) {
          return _this.trackEvent(e);
      });

      if (this.settings.highlight) {
          this.highlightTrack.mousedown(function(e) {
            return _this.trackEvent(e);
          });
      }

      this.dragger.mousedown(function(e) {
        if (e.which !== 1) {
          return;
        }
        _this.dragging = true;
        _this.dragger.addClass("dragging");
        _this.domDrag(e.pageX, e.pageY);
        return false;
      });

      $("body").mousemove(function(e) {
        if (_this.dragging) {
          _this.domDrag(e.pageX, e.pageY);
          return $("body").css({
            cursor: "pointer"
          });
        }
      }).mouseup(function(e) {
        if (_this.dragging) {
          _this.dragging = false;
          _this.dragger.removeClass("dragging");
          return $("body").css({
            cursor: "auto"
          });
        }
      });

      // TOUCH EVENTS
      // 
      this.track.on('touchstart', function(e) {
          return _this.trackEvent(e);
      });
      
      if (this.settings.highlight) {
          this.highlightTrack.on('touchstart', function(e) {
            return _this.trackEvent(e);
          });
      }

      // since the dragger is so small, for touch we will target the slided and get the distance between the touch
      // and the dragger element
      this.slider.on('touchstart', function(e) {
          if(!e.originalEvent.changedTouches){
              return false;
          }
          console.log('touchstart on slider');
          //var pageX = e.originalEvent.changedTouches[0].pageX;
          var pageY = e.originalEvent.changedTouches[0].pageY;
          var dragger = $(this).find('.dragger');
          var draggerRect = dragger.get(0).getBoundingClientRect();
          var draggerX = draggerRect.left + (dragger.outerWidth()/2);
          var draggerY = draggerRect.top + (dragger.outerHeight()/2);
          if(pageY > draggerRect.top - 20 || pageY < draggerRect.bottom + 20){
              _this.dragging = true;
              _this.dragger.addClass("dragging");
              _this.domDrag(draggerX, draggerY);
              return false;
          }
          
      });
      /*
      this.dragger.on('touchstart', function(e) {
          if(!e.originalEvent.changedTouches){
              return false;
          }
          console.log('touchstart on dragger');
          var pageX = e.originalEvent.changedTouches[0].pageX;
          var pageY = e.originalEvent.changedTouches[0].pageY;
          _this.dragging = true;
          _this.dragger.addClass("dragging");
          _this.domDrag(pageX, pageY);
          return false;
      });
*/


      $("body").on('touchmove', function(e) {
        if (_this.dragging) {
            var pageX = e.originalEvent.changedTouches[0].pageX;
            var pageY = e.originalEvent.changedTouches[0].pageY;
            _this.domDrag(pageX, pageY);
        }
      }).on('touchend', function() {
        if (_this.dragging) {
          _this.dragging = false;
          _this.dragger.removeClass("dragging");
        }
      });

      this.pagePos = 0;
      if (this.input.val() === "") {
        this.value = this.getRange().min;
        this.input.val(this.value);
      } else {
        this.value = this.nearestValidValue(this.input.val());
      }
      this.setSliderPositionFromValue(this.value);
      ratio = this.valueToRatio(this.value);
      this.input.trigger("slider:ready", {
        value: this.value,
        ratio: ratio,
        position: ratio * this.slider.outerHeight(),
        el: this.slider
      });
    }

    SimpleSlider.prototype.createDivElement = function(classname) {
      var item;
      item = $("<div>").addClass(classname).appendTo(this.slider);
      return item;
    };
    SimpleSlider.prototype.setRatio = function(ratio) {
      var value;
      ratio = Math.min(1, ratio);
      ratio = Math.max(0, ratio);
      value = this.ratioToValue(ratio);
      this.setSliderPositionFromValue(value);
      return this.valueChanged(value, ratio, "setRatio");
    };

    SimpleSlider.prototype.setValue = function(value) {
      var ratio;
      value = this.nearestValidValue(value);
      ratio = this.valueToRatio(value);
      this.setSliderPositionFromValue(value);
      return this.valueChanged(value, ratio, "setValue");
    };

    SimpleSlider.prototype.trackEvent = function(e) {
      if (e.which !== 1) {
        return;
      }
      this.domDrag(e.pageX, e.pageY, true);
      this.dragging = true;
      return false;
    };

    SimpleSlider.prototype.domDrag = function(pageX, pageY, animate) {
      var pagePos, ratio, value;
      if (animate === null) {
        animate = false;
      }
      //pagePos = pageY - (this.slider.offset().top);
      pagePos = (this.slider.offset().top + this.slider.outerHeight() ) - pageY;
      pagePos = Math.min(this.slider.outerHeight(), pagePos);
      pagePos = Math.max(0, pagePos);
      if (this.pagePos !== pagePos) {
        this.pagePos = pagePos;
        ratio = pagePos / this.slider.outerHeight();
        value = this.ratioToValue(ratio);
        this.valueChanged(value, ratio, "domDrag");
        if (this.settings.snap) {
          return this.setSliderPositionFromValue(value, animate);
        } else {
          return this.setSliderPosition(pagePos, animate);
        }
      }
    };

    SimpleSlider.prototype.setSliderPosition = function(position, animate) {
      if (animate === null) {
        animate = false;
      }
      if (animate && this.settings.animate) {
        this.dragger.animate({
          bottom: position - this.dragger.outerHeight()
        }, 200);
        if (this.settings.highlight) {
          return this.highlightTrack.animate({
            height: position
          }, 200);
        }
      } else {
        this.dragger.css({
          bottom: position - this.dragger.outerHeight()
        });
        if (this.settings.highlight) {
          return this.highlightTrack.css({
            height: position
          });
        }
      }
    };

    SimpleSlider.prototype.setSliderPositionFromValue = function(value, animate) {
      var ratio;
      if (animate === null) {
        animate = false;
      }
      ratio = this.valueToRatio(value);
      return this.setSliderPosition(ratio * this.slider.outerHeight(), animate);
    };

    SimpleSlider.prototype.getRange = function() {
      if (this.settings.allowedValues) {
        return {
          min: Math.min.apply(Math, this.settings.allowedValues),
          max: Math.max.apply(Math, this.settings.allowedValues)
        };
      } else if (this.settings.range) {
        return {
          min: parseFloat(this.settings.range[0]),
          max: parseFloat(this.settings.range[1])
        };
      } else {
        return {
          min: 0,
          max: 1
        };
      }
    };

    SimpleSlider.prototype.nearestValidValue = function(rawValue) {
      var closest, maxSteps, range, steps;
      range = this.getRange();
      rawValue = Math.min(range.max, rawValue);
      rawValue = Math.max(range.min, rawValue);
      if (this.settings.allowedValues) {
        closest = null;
        $.each(this.settings.allowedValues, function() {
          if (closest === null || Math.abs(this - rawValue) < Math.abs(closest - rawValue)) {
            return closest = this;
          }
        });
        return closest;
      } else if (this.settings.step) {
        maxSteps = (range.max - range.min) / this.settings.step;
        steps = Math.floor((rawValue - range.min) / this.settings.step);
        if ((rawValue - range.min) % this.settings.step > this.settings.step / 2 && steps < maxSteps) {
          steps += 1;
        }
        return steps * this.settings.step + range.min;
      } else {
        return rawValue;
      }
    };

    SimpleSlider.prototype.valueToRatio = function(value) {
      var allowedVal, closest, closestIdx, idx, range, _i, _len, _ref;
      if (this.settings.equalSteps) {
        _ref = this.settings.allowedValues;
        for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
          allowedVal = _ref[idx];
          if (!(typeof closest !== "undefined" && closest !== null) || Math.abs(allowedVal - value) < Math.abs(closest - value)) {
            closest = allowedVal;
            closestIdx = idx;
          }
        }
        if (this.settings.snapMid) {
          return (closestIdx + 0.5) / this.settings.allowedValues.length;
        } else {
          return closestIdx / (this.settings.allowedValues.length - 1);
        }
      } else {
        range = this.getRange();
        return (value - range.min) / (range.max - range.min);
      }
    };

    SimpleSlider.prototype.ratioToValue = function(ratio) {
      var idx, range, rawValue, step, steps;
      if (this.settings.equalSteps) {
        steps = this.settings.allowedValues.length;
        step = Math.round(ratio * steps - 0.5);
        idx = Math.min(step, this.settings.allowedValues.length - 1);
        return this.settings.allowedValues[idx];
      } else {
        range = this.getRange();
        rawValue = ratio * (range.max - range.min) + range.min;
        return this.nearestValidValue(rawValue);
      }
    };

    SimpleSlider.prototype.valueChanged = function(value, ratio, trigger) {
      var eventData;
      if (value.toString() === this.value.toString()) {
        return;
      }
      this.value = value;
      eventData = {
        value: value,
        ratio: ratio,
        position: ratio * this.slider.outerHeight(),
        trigger: trigger,
        el: this.slider
      };
      return this.input.val(value).trigger($.Event("change", eventData)).trigger("slider:changed", eventData);
    };

    return SimpleSlider;

  })();
  $.extend($.fn, {
    simpleSlider: function() {
      var params, publicMethods, settingsOrMethod;
      settingsOrMethod = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      publicMethods = ["setRatio", "setValue"];
      return $(this).each(function() {
        var obj, settings;
        if (settingsOrMethod && __indexOf.call(publicMethods, settingsOrMethod) >= 0) {
          obj = $(this).data("slider-object");
          return obj[settingsOrMethod].apply(obj, params);
        } else {
          settings = settingsOrMethod;
          return $(this).data("slider-object", new SimpleSlider($(this), settings));
        }
      });
    }
  });
  return $(function() {
    return $("[data-slider]").each(function() {
      var $el, allowedValues, settings, x;
      $el = $(this);
      settings = {};
      allowedValues = $el.data("slider-values");
      if (allowedValues) {
        settings.allowedValues = (function() {
          var _i, _len, _ref, _results;
          _ref = allowedValues.split(",");
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            _results.push(parseFloat(x));
          }
          return _results;
        })();
      }
      if ($el.data("slider-range")) {
        settings.range = $el.data("slider-range").split(",");
      }
      if ($el.data("slider-step")) {
        settings.step = $el.data("slider-step");
      }
      settings.snap = $el.data("slider-snap");
      settings.equalSteps = $el.data("slider-equal-steps");
      if ($el.data("slider-theme")) {
        settings.theme = $el.data("slider-theme");
      }
      if ($el.attr("data-slider-highlight")) {
        settings.highlight = $el.data("slider-highlight");
      }
      if ($el.data("slider-animate") !== null) {
        settings.animate = $el.data("slider-animate");
      }
      return $el.simpleSlider(settings);
    });
  });
})(this.jQuery || this.Zepto, this);

}

/*
     FILE ARCHIVED ON 17:29:03 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:39 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.675
  load_resource: 33.598
  PetaboxLoader3.datanode: 18.172
*/