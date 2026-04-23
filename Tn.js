var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
(function(jQuery, document, window, undefined) {

    // Used to increment unique id's on the DOM
    var uidCount = 0;

    // Helper function for parsing url parameters

    function gup(name, location) {
        if (!location) {
            location = window.location.href;
        }
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(location);
        if (results === null || results === undefined) {
            return "";
        } else {
            return results[1];
        }
    }

    // Extend jQuery to give use all attribute from the selected element
    $.fn.getAttributes = function() {
        var attributes = {};

        if (this.length) {
            $.each(this[0].attributes, function(index, attr) {
                attributes[attr.name] = attr.value;
            });
        }

        return attributes;
    };

    /**
     * @class Tn
     * @singleton
     * Turner base class methods
     */
    window.Tn = function() {};

    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            Tn.isMobile = true;
        }
    })(navigator.userAgent || navigator.vendor || window.opera);

    if (gup("mobile") === 1 || gup("mobile") === "true") {
        Tn.isMobile = true;
    }

    if (gup("devOnly") == "1" || gup("devOnly") === "yes" || gup("devOnly") === "true" || $.cookie('devOnly')) {
        Tn.devOnlyFromBrowser = true;
    } else {
        Tn.devOnlyFromBrowser = false;
    }
    /**
     * @class Tn
     */
    $.extend(window.Tn, {

        /**
         * @property {Boolean} Tn.isMobile Returns if this is a mobile browser
         */
        /**
         * @property {String} [clickEvent] Returns the event to use for click handling
         */

        /**
         * Returns the url parameter specified by name or an empty string if not found.
         * Alternatively, you can specify a location if you don't want to use the window location with the location parameter.
         * @param  {String} name The name of the url parameter to search for
         * @param  {String} [location=undefined] An alternate url to search against
         * @return {String} The value of the parameter or an empty string if not found
         */
        gup: gup,
        clickEvent: ((document.ontouchstart !== null) ? 'click' : 'touchstart'),

        /**
         * Same as [jQuery.extend](http://api.jquery.com/jquery.extend/)
         */
        extend: function() {
            if (!arguments[0]) {
                return {};
            }
            if (!arguments[1]) {
                return arguments[0];
            }
            return $.extend.apply(this, arguments);
        },

        /**
         * Copies parameters into base
         * @param  {Object} base   The original object
         * @param  {Object} params The parameters to copy into base
         * @return {Object}        The modified base object
         */
        apply: function() {
            return Tn.extend.apply(this, arguments);
        },

        /**
         * Copies parameters into base only if they don't already exist in the base
         * @param  {Object} base   The original object
         * @param  {Object} params The parameters to copy into base
         * @return {Object}        The modified base object
         */
        applyIf: function(base, params) {
            if (!base) {
                return {};
            }
            if (!params) {
                return base;
            }
            $.each(params, function(key, val) {
                if (base[key] === undefined) {
                    base[key] = val;
                }
            });
            return base;
            //return $.extend(true, {}, options.itemDefaults, item);
        },

        /**
         * String formatter for javascript
         *
         * Usage as unnamed parameters : Tn.fm("My name is {0} {1}", "John", "doe");
         * Usage as named parameters : Tn.fm("My name is {first} {last}", {first: "John", last: "doe"});
         *
         * @param  {String} txt The text for format
         * @return {String}   the formatted string
         */
        fm: function(txt) {
            var i, reg;

            // Check to see if we're using named value pairs
            if (arguments.length === 2 && typeof arguments[1] === 'object') {
                $.each(arguments[1], function(key, value) {
                    reg = new RegExp("\\{" + key + "\\}", "gm");
                    txt = txt.replace(reg, value);
                });
                return txt;
            }

            // We have a list of parameters, so traverse the list
            for (i = 1; i < arguments.length; i++) {
                reg = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                txt = txt.replace(reg, arguments[i]);
            }
            return txt;
        },

        /**
         * String formatter for javascript.
         *
         * This is the longhand version, look at the {@link Tn#fm} method for usage details.
         */
        format: function() {
            return Tn.fm.apply(this, arguments);
        },

        /**
         * Converts an xml document into a json structure
         *
         * @param  {Object} xml The input XML document
         * @return {Object}     The output JSON structure
         */
        xml2json: function(xml) {
            var result = {};
            for (var i = 0; i < xml.childNodes.length; i++) {
                var node = xml.childNodes[i];
                if (node.nodeType === 1) {
                    var child = node.hasChildNodes() ? Tn.xml2json(node) : node.nodevalue;
                    child = !child ? {} : child;
                    if (result.hasOwnProperty(node.nodeName)) {
                        if (!(result[node.nodeName] instanceof Array)) {
                            var tmp = result[node.nodeName];
                            result[node.nodeName] = [];
                            result[node.nodeName].push(tmp);
                        }
                        result[node.nodeName].push(child);
                    } else {
                        result[node.nodeName] = child;
                    }
                    if (node.attributes.length > 0) {
                        result[node.nodeName]['@attributes'] = {};
                        child['@attributes'] = {};
                        console.error("Found attributes", node.attribute.length);
                        for (var j in node.attributes) {
                            if (1 || node.hasOwnProperty(j)) { // Get rid of jshint error when dealing with xml nodes
                                var attribute = node.attributes.item(j);
                                child['@attributes'][attribute.nodeName] = attribute.value;
                            }
                        }
                    }
                    if (node.childElementCount === 0 && node.textContent && node.textContent !== "") {
                        child.value = node.textContent.trim();
                    }
                }
            }
            return result;
        },

        /**
         * Encodes the input parameter into a json encoded string
         * @param  {Mixed} obj  The value to be encoded
         * @return {String}     The output as a string encoded json
         */
        encode: function(obj) {
            if (!obj) {
                return null;
            }
            return JSON.stringify(obj);
        },

        /**
         * Decodes the input string into a json object
         * @param  {String} txt The JSON encoded string
         * @return {Mixed}     The resulting JSON object
         */
        decode: function(txt) {
            try {
                return JSON.parse(txt);
            } catch (e) {
                console.error("Tn.decode::", e.message);
                return null;
            }
        },

        /**
         * Returns a unique ID for the current browser instance
         * @param  {String} [base] Appends the name to the uid for reference
         * @return {String}      The uid
         */
        uid: function(base) {
            uidCount += 1;
            base = base || "autogen";
            return "tn-" + base + "-" + uidCount;
        },

        /**
         * Returns the component for the id specified
         * @param  {String} id The id of the component
         * @return {Tn.Component}    The component as a class or null
         */
        getCmp: function(id) {
            return Tn.ComponentManager.getComponent(id);
        },

        isReady: false,
        onReadyCallbacks: [],
        onReady: function(cb) {
            if (!cb) {
                return;
            }

            Tn.onReadyCallbacks.push(cb);
            if (Tn.isReady) {
                Tn.processReadyCallbacks();
                return;
            }
        },

        processReadyCallbacks: function() {
            Tn.isReady = true;
            var callbacks = Tn.onReadyCallbacks;
            Tn.onReadyCallbacks = [];
            $.each(callbacks, function(index, val) {
                val.call(Tn, window, $, Tn);
            });
        },

        /**
         * Defines a class
         * Use this instead of the standard Tn.Class.extend approach
         *
         * To define a class, use the following syntax
         *
         *     Tn.define('Tutorial.MyClass', {
         *      constructor: function(config) { return; },
         *      getTime: function(){ return new Date().toString(); }
         *     });
         *     var myClass = new Tutorial.MyClass();
         *     $("body").html("The time is " + myClass.getTime());
         *
         * To extend a class, pass in the extend option
         *
         *     Tn.define('Tutorial.MyClass1', {
         *      getTime: function(){ return new Date().toString(); }
         *     });
         *     Tn.define('Tutorial.MyClass2', {
         *      extend: "Tn.MyClass1"
         *      method1: function() { return "Dummy method"; }
         *     });
         *     var myClass = new Tutorial.MyClass2();
         *     $("body").html("The time is " + myClass.getTime());
         *
         * You can also mix in different classes through the mixin property
         *
         * @param  {String} className   The name of the class to create
         * @param  {Object} options     The key value pairs fo propreties to apply to this class
         * @return {Tn.Class}           The newly created class
         */
        define: function(className, options) {
            options = options || {};
            var baseCls = options.extend;
            baseCls = baseCls || Tn.Class;
            if (typeof baseCls === "string") {
                baseCls = Tn.ComponentManager.classes[baseCls];
                if (!baseCls) {
                    console.error("Base class undefined", className, options.extend);
                    baseCls = Tn.Class;
                }
            }
            var retCls = baseCls.extend(options);
            Tn.ComponentManager.classes[className] = retCls;

            var arr = className.split(".");
            var ref = window;

            // Make sure the references are built out if they aren't already defined
            $.each(arr, function(index, val) {
                if (index >= arr.length - 1) {
                    ref[val] = retCls;
                    return;
                }
                if (!ref[val]) {
                    ref[val] = {};
                }
                ref = ref[val];
            });

            return retCls;
        },

        create: function(item, defaultXType) {
            // Make sure you specified an item
            if (!item) {
                console.error("NULL item passed in");
                return new Tn.Component({});
            }

            // See if we have a special component being initialized
            if (typeof item === "string") {
                switch (item) {
                    case '->':
                        break;
                    default:
                        console.error("Invalid item specified", item);
                        return new Tn.Component({});
                }
            }

            // Item already created, so just return it
            if (item.isComponent) {
                return item;
            }

            // Check to see if the item has a default xtype
            if (!item.xtype) {
                item.xtype = defaultXType || 'component';
            }

            // Look up the class instantiator in our compomnent library
            var func = Tn.ComponentManager.getXType('widget.' + item.xtype);
            if (!func) {
                console.error("Could not find xtype", item.xtype);
                func = Tn.Component;
            }
            return new func(item);
        },

        /**
         * Returns a template instantiated to the input record
         * @param  {String/Array} tpl A string or an array of strings containing name value pairs
         * @param  {Object} record An object containing name value pairs
         * @return {HTMLElement}        The templated dom object
         */
        applyTpl: function(tpl, record) {
            tpl = Tn.buildTpl(tpl, record);
            return tpl ? $(tpl) : undefined;
        },

        /**
         * Returns a template string for the input record
         * @param  {String/Array} tpl A string or an array of strings containing name value pairs
         * @param  {Object} record An object containing name value pairs
         * @return {HTMLElement}        The templated dom object
         */
        buildTpl: function(tpl, record) {
            var fmt = $.isArray(tpl) ? tpl.join('') : tpl;
            if (!fmt) {
                return;
            }

            fmt = Tn.fm(fmt, record);
            return fmt;
        },

        jsonError: function() {
            console.error("Error fetching json");
        },

        json: function(options) {
            Tn.applyIf(options, {
                dataType: "json",
                error: this.jsonError
            });
            $.ajax(options);
        },

        /**
         * Returns whether or not the input is an object (not an array)
         * @param  {Object}  obj The object to check
         * @return {Boolean}     True if it's a object
         */
        isObject: function(obj) {
            return $.isPlainObject(obj);
        },

        /**
         * Traverses the DOM and builds any widgets found
         */
        buildXtypes: function(wrapBody) {
            var items = [];
            if (wrapBody) {
                $('body').wrapInner(wrapBody);
            }
            $('[xtype]').each(function() {
                var item = $(this).getAttributes();
                item.contentEl = this;
                if (item.rawconfig) {
                    Tn.applyIf(item, Tn.decode(item.rawconfig));
                    delete item.rawconfig;
                }
                if (wrapBody && !item.renderTo) {
                    item.renderTo = 'document.body';
                }
                //console.error("Found item", item);
                if (!item.renderTo) {
                    item.renderTo = $(this).parent();
                }
                Tn.create(item);
                items.push(item);
                $(this).remove();
            });
            return items;
        }
    });


    /**
     * @class Tn.ComponentManager
     * @singleton
     * Manages the classes registered with the system
     */
    Tn.ComponentManager = {
        xtypes: {},
        components: {},
        classes: {},

        /**
         * Registers an xtype with the system
         * @param {String} xtype The xtype to be reigsterd
         * @param {Object} klass The class to be instantiated
         */
        addXType: function(xtype, klass) {
            this.xtypes[xtype] = klass;
        },

        /**
         * Returns the class for the specified xtype
         * @param  {String} xtype xtype in question
         * @return {Object}       The class registered to this xtype or undefined
         */
        getXType: function(xtype) {
            return this.xtypes[xtype];
        },

        /**
         * Registers a component with the system
         * @param {Tn.Component} comp The component to be registered
         */
        addComponent: function(comp) {
            this.components[comp.id] = comp;
        },

        /**
         * Removes a component from the system
         * @param  {Tn.Component} comp The component to deregister
         */
        removeComponent: function(comp) {
            delete this.components[comp.id];
        },

        /**
         * Returns the component if registered
         * @return {Tn.Component} [description]
         */
        getComponent: function(id) {
            if (typeof id === 'string') {
                return this.components[id];
            }
            return id;
        }
    };

    /**
     * @class  Tn.Class
     * The root of all classes created with Tn
     */


    /*
        Base.js, version 1.1a
        Copyright 2006-2010, Dean Edwards
        License: http://www.opensource.org/licenses/mit-license.php
    */
    var Base = function() {
        // dummy
    };

    Base.extend = function(_instance, _static) { // subclass
        var extend = Base.prototype.extend;

        // build the prototype
        Base._prototyping = true;
        var proto = new this;
        extend.call(proto, _instance);
        proto.superClass = function() {
            // call this method from any other method to invoke that method's ancestor
        };
        delete Base._prototyping;

        // create the wrapper for the constructor function
        //var constructor = proto.constructor.valueOf(); //-dean
        var constructor = proto.constructor;
        var klass = proto.constructor = function() {
            if (!Base._prototyping) {
                if (this._constructing || this.constructor === klass) { // instantiation
                    this._constructing = true;
                    constructor.apply(this, arguments);
                    delete this._constructing;
                } else if (arguments[0]) { // casting
                    return (arguments[0].extend || extend).call(arguments[0], proto);
                }
            }
        };

        // build the class interface
        klass.ancestor = this;
        klass.extend = this.extend;
        klass.forEach = this.forEach;
        klass.implement = this.implement;
        klass.prototype = proto;
        klass.toString = this.toString;
        klass.valueOf = function(type) {
            //return (type == "object") ? klass : constructor; //-dean
            return (type === "object") ? klass : constructor.valueOf();
        };
        extend.call(klass, _static);
        // class initialisation
        if (typeof klass.init === "function") {
            klass.init();
        }

        // If we passed in an alias, then register it with our component manager
        if (_instance.alias) {
            if (typeof _instance.alias === 'string') {
                _instance.alias = [_instance.alias];
            }
            $.each(_instance.alias, function(key, value) {
                Tn.ComponentManager.addXType(value, klass);
            });
        }
        if (_instance.mixins) {
            if (typeof _instance.mixins === 'string') {
                _instance.mixins = [_instance.mixins];
            }
            $.each(_instance.mixins, function(key, value) {
                var mixCls = Tn.ComponentManager.classes[value];
                klass.implement(mixCls);
            });
        }
        return klass;
    };

    Base.prototype = {
        extend: function(source, value) {
            if (arguments.length > 1) { // extending with a name/value pair
                var ancestor = this[source];
                if (ancestor && (typeof value === "function") && // overriding a method?
                    // the valueOf() comparison is to avoid circular references
                    (!ancestor.valueOf || ancestor.valueOf() !== value.valueOf()) &&
                    /\bsuperClass\b/.test(value)) {
                    // get the underlying method
                    var method = value.valueOf();
                    // override
                    value = function() {
                        var previous = this.superClass || Base.prototype.superClass;
                        this.superClass = ancestor;
                        var returnValue = method.apply(this, arguments);
                        this.superClass = previous;
                        return returnValue;
                    };
                    // point to the underlying method
                    value.valueOf = function(type) {
                        return (type === "object") ? value : method;
                    };
                    value.toString = Base.toString;
                }
                this[source] = value;
            } else if (source) { // extending with an object literal
                var extend = Base.prototype.extend,
                    proto = {
                        toSource: null
                    },
                    hidden = ["constructor", "toString", "valueOf"],
                    i, key;

                // if this object has a customised extend method then use it
                if (!Base._prototyping && typeof this !== "function") {
                    extend = this.extend || extend;
                }
                // if we are prototyping then include the constructor
                i = Base._prototyping ? 0 : 1;
                while (key = hidden[i++]) {
                    if (source[key] !== proto[key]) {
                        extend.call(this, key, source[key]);
                    }
                }
                // copy each of the source object's properties to this object
                for (key in source) {
                    if (!proto[key]) {
                        extend.call(this, key, source[key]);
                    }
                }
            }
            return this;
        }
    };

    // initialise
    Base = Base.extend({
        constructor: function() {
            this.extend(arguments[0]);
        }
    }, {
        ancestor: Object,
        version: "1.1",

        forEach: function(object, block, context) {
            for (var key in object) {
                if (this.prototype[key] === undefined) {
                    block.call(context, object[key], key, object);
                }
            }
        },

        implement: function() {
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] === "function") {
                    // if it's a function, call it
                    arguments[i](this.prototype);
                } else {
                    // add the interface using the extend method
                    this.prototype.extend(arguments[i]);
                }
            }
            return this;
        },

        toString: function() {
            return String(this.valueOf());
        }
    });

    Tn.Class = Base;
    Tn.uiPrefix = 'tn-';
    Tn.view = {};
    Tn.models = {};

    // TeamSite preview blocks ready and load events, so do it like this for now

    function checkAppState() {
        if (document.readyState !== 'complete') {
            setTimeout(checkAppState, 100);
            return;
        }
        Tn.processReadyCallbacks();
    }

    checkAppState();

})(jQuery, document, window, undefined);

}

/*
     FILE ARCHIVED ON 17:29:20 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:43 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 1.784
  load_resource: 51.736
  PetaboxLoader3.datanode: 50.175
*/