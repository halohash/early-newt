var _____WB$wombat$assign$function_____=function(name){return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name))||self[name];};if(!self.__WB_pmw){self.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opens = _____WB$wombat$assign$function_____("opens");
/**
 * @class Tn.Users
 * @singleton
 * Library for dealing with users from the [Gigya platform](http://www.gigya.com/).
 * It allows you to use the capabilities of Gigya without having to know the internal specifics.
 * Make sure to call Tn.Users.initialize when you page starts up
 *
 * Example of initializing the users class and checking for logged in user :
 *
 *     @example
 *     $("body").append("<p>Initializing user class...</p>");
 *     Tn.Users.initialize({
 *      onStartup: function(uid) {
 *          if (!uid) {
 *              $("body").append("<p>No user logged in</p>");
 *              return;
 *          }
 *          $("body").append(Tn.fm("<p>Logged in user is {0}</p>", uid));
 *      }
 *     });
 *
 * This example shows how to initiate a login when a link is clicked
 *
 *     @example
 *     $('body').append('<a href"#">Click me to log in</a>').click(function() {
 *      Tn.Users.logIn();
 *     });
 */
(function(Tn, jQuery, gigya, document, window, undefined) {
    if (!gigya) {
        console.error("Gigya not installed, user library not loaded!");
        return;
    }

    // Resets any UI forms with the latest values

    function updateProfileNames(firstName, lastName, email) {
        $('.editProfile').not('.noupdate').html(Tn.fm("Hi, {firstName}", {
            firstName: firstName || lastName || email || 'unknown user'
        }));
        $('.profile-fullname').html(Tn.fm("{firstName} {lastName}", {
            firstName: firstName,
            lastName: lastName
        }));
        $('.profile-firstname-value').val(firstName || "");
        $('.profile-lastname-value').val(lastName || "");
        $('.profile-email-value').val(email || "");
        $('.profile-info-oldpassword, .profile-info-newpassword, .profile-info-confirmpassword').val("");
    }

    function updateProfileSize() {
        $('#profile-contents-three .search-item .main-content').each(function() {
            var el = $(this);
            var w = el.width();
            var h = parseInt(w * 360 / 640, 10);
            el.height(h);

            window.tnOverlays.resizeOverlay(el);
        });
    }

    function updateProfileInfo() {
        if (!Tn.currentUser) {
            return;
        }
        updateProfileNames(Tn.currentUser.profile.firstName, Tn.currentUser.profile.lastName, Tn.currentUser.profile.email);
        $('#profile-dialog').attr('provider', Tn.Users.getPref("provider", "")).toggleClass('social', Tn.currentUser.provider.length === 0 ? false : true);
    }

    Tn.Users = {
        prefs: {},
        emailAlreadyExistsMsgKey: 'email_already_exists',
        emailAlreadyExistsMsg: 'An account with this email address already exists. Please log in using this email address or a social account. You may also request a new password using this email address.',
        setBrowser: function(uid, uidSignature, signatureTimestamp){
            var browserInfo = Tn.Users.getBrowser();
            //console.log('setBrowser: ' + browserInfo);
            var response = $.ajax({
                url: "/profile/index.json",
                method: "get",
                data: {
                    browser: browserInfo,
                    uid: uid,
                    uidSignature: uidSignature,
                    signatureTimestamp: signatureTimestamp
                },
                cache: true, // Only need this set once
                dataType: "json",
                success: function(data) {
                    if(data.status == '200'){
                        console.log('setBrowser ' + JSON.stringify(data));
                    } //else {
                    //     console.log('setBrowser failed.  data:' + JSON.stringify(data));
                    // }
                },
                error: function() {
                    console.error("Failed setBrowser: ", arguments);
                }
            });
        },
        getBrowser: function(){
            var unknown = 'unknown';
            //browser
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browser = navigator.appName;
            var version = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix, browserInfo;

            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) != -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
            }

            //IE 11 no longer identifies itself as MS IE, so trap it
            //http://stackoverflow.com/questions/17907445/how-to-detect-ie11
            else if ((browser == 'Netscape') && (nAgt.indexOf('Trident/') != -1)) {

                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
                if ((verOffset = nAgt.indexOf('rv:')) != -1) {
                    version = nAgt.substring(verOffset + 3);
                }

            }

            // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
                browser = 'Chrome';
                version = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
                browser = 'Safari';
                version = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) != -1) {
                    version = nAgt.substring(verOffset + 8);
                }

                // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
                //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
                //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
                //  can be keyed on to detect it.
                if (nAgt.indexOf('CriOS') != -1) {
                    //Chrome on iPad spoofing Safari...correct it.
                    browser = 'Chrome';
                    //Don't believe there is a way to grab the accurate version number, so leaving that for now.
                }
            }
            // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
                browser = 'Firefox';
                version = nAgt.substring(verOffset + 8);
            }
            // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                version = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() == browser.toUpperCase()) {
                    browser = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
            if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

            majorVersion = parseInt('' + version, 10);
            if (isNaN(majorVersion)) {
                version = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // mobile version
            var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

            // system
            var os = unknown;
            var clientStrings = [
                {s:'Windows 3.11', r:/Win16/},
                {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
                {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
                {s:'Windows 98', r:/(Windows 98|Win98)/},
                {s:'Windows CE', r:/Windows CE/},
                {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
                {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
                {s:'Windows Server 2003', r:/Windows NT 5.2/},
                {s:'Windows Vista', r:/Windows NT 6.0/},
                {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
                {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
                {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
                {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {s:'Windows ME', r:/Windows ME/},
                {s:'Android', r:/Android/},
                {s:'Open BSD', r:/OpenBSD/},
                {s:'Sun OS', r:/SunOS/},
                {s:'Linux', r:/(Linux|X11)/},
                {s:'iOS', r:/(iPhone|iPad|iPod)/},
                {s:'Mac OS X', r:/Mac OS X/},
                {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                {s:'QNX', r:/QNX/},
                {s:'UNIX', r:/UNIX/},
                {s:'BeOS', r:/BeOS/},
                {s:'OS/2', r:/OS\/2/},
                {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'Android':
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;

            }
            // Need to handle quotes since they want a string in the gigya field
            browserInfo = JSON.stringify({
                    browser: browser.replace(/"/g, '&quote'),
                    browserVersion: version.replace(/"/g, '&quote'),
                    mobile: mobile,
                    os: os.replace(/"/g, '&quote'),
                    osVersion: osVersion.replace(/"/g, '&quote')
                });
            browserInfo = browserInfo.replace(/"/g, '\\"');
            return browserInfo;
        },
        /**
         * Sets a preference on the system
         * @param {String} name  The name of the preference
         * @param {Mixed} value The value of the preference
         */
        setPref: function(name, value) {
            if (!this.prefs) {
                this.prefs = {};
            }
            if ($.isPlainObject(name)) {
                $.extend(this.prefs, name);
            } else {
                this.prefs[name] = value;
            }
            this.syncPrefs();
        },

        /**
         * Returns the preference by the given name
         * @param  {String} name     The name of the preference
         * @param  {Mixed} defValue The default value of the preference if not found
         * @return {Mixed}          The value of the preference
         */
        getPref: function(name, defValue) {
            if (!this.prefs) {
                return defValue;
            }
            if (this.prefs[name] !== undefined) {
                return this.prefs[name];
            }
            return defValue;
        },

        /**
         * Removes the preference specified
         * @param  {String} name The name of the preference
         */
        removePref: function(name) {
            var me = this;
            name = $.isArray(name) ? name : [name];
            $.each(name, function(key, val) {
                delete me.prefs[val];
            });
            this.syncPrefs();
        },

        /**
         * Clears all preferences from the queue
         */
        clearPrefs: function() {
            this.prefs = {};
            this.syncPrefs();
        },

        /**
         * @private
         * Syncs all preferences with the user service if logged in
         */
        syncPrefs: function() {
            if (!this.syncTimeout) {
                this.syncTimeout = setTimeout($.proxy(this.syncPrefsImmediately, this), 2000);
            }
            //this.syncPrefsImmediately();
        },

        /**
         * Synchs the preferences immediately, regardless of timer
         */
        syncPrefsImmediately: function() {
            // remove the sync timeout 
            if (this.syncTimeout) {
                clearTimeout(this.syncTimeout);
                delete this.syncTimeout;
            }

            // If no user currently logged in, we can't sync
            if (!Tn.currentUser) {
                return;
            }

            gigya.accounts.setAccountInfo({
                data: {
                    prefs: JSON.stringify(this.prefs)
                },
                callback: function(o) {
                    if (o.errorCode !== 0) {
                        console.error("Error adding preferences", o.errorDetails);
                        return;
                    }
                }
            });
        },

        /**
         * The default set of reactions to be used across the board
         * @cfg {Array}
         */
        defaultReactions: [{
            text: 'Inspiring',
            ID: 'inspiring',
            iconImgUp: 'https://web.archive.org/web/20141231172923/https://cdns.gigya.com/gs/i/reactions/icons/Inspiring_Icon_Up.png',
            tooltip: 'This is inspiring',
            feedMessage: 'Inspiring!',
            headerText: 'You think this is inspiring'
        }, {
            text: 'Innovative',
            ID: 'innovative',
            iconImgUp: 'https://web.archive.org/web/20141231172923/https://cdns.gigya.com/gs/i/reactions/icons/Innovative_Icon_Up.png',
            tooltip: 'This is innovative',
            feedMessage: 'This is innovative',
            headerText: 'You think this is Innovative'
        }, {
            text: 'LOL',
            ID: 'lol',
            iconImgUp: 'https://web.archive.org/web/20141231172923/https://cdns.gigya.com/gs/i/reactions/icons/LOL_Icon_Up.png',
            tooltip: 'LOL',
            feedMessage: 'LOL!',
            headerText: 'You LOL'
        }, {
            text: 'Amazing',
            ID: 'amazing',
            iconImgUp: 'https://web.archive.org/web/20141231172923/https://cdns.gigya.com/gs/i/reactions/icons/Amazing_Icon_Up.png',
            tooltip: 'This is amazing',
            feedMessage: 'This is amazing!',
            headerText: 'You think this is Amazing'
        }],

        /**
         * The link to be used for the default reaction
         * @cfg {String} [reactionLink='https://web.archive.org/web/20141231172923/http://tbs.com']
         */
        reactionLink: 'https://web.archive.org/web/20141231172923/http://tbs.com',

        /**
         * The title to be used for the default reaction
         * @cfg {String}
         */
        reactionTitle: 'TBS Superstation',

        /**
         * The id of the container to be used to show reactions, or undefined for no reactions
         * @cfg {String}
         */
        reactionContainerId: undefined,

        /**
         * The server defined category, or undefined for no default comment
         * @cfg {String} [commentCategory=undefined]
         */
        commentCategory: undefined,

        /**
         * The container id to display default comments, or undefined for no comments
         * @cfg {String}
         */
        commentId: undefined,

        /**
         * Returns whether a user is logged
         * @return {Boolean} True if their is a user already logged in
         */
        isUserLoggedIn: function() {
            return Tn.currentUser ? true : false;
        },

        /**
         * Sets up a reaction bar at the id specified
         * @param  {String} id    The id of the div to add the reaction bar to
         * @param  {String} link  The link for the user action
         * @param  {String} title The title for the user action
         */
        setupReactions: function(id, link, title) {
            var act = new gigya.socialize.UserAction();
            act.setLinkBack(link);
            act.setTitle(title);

            gigya.socialize.showReactionsBarUI({
                barID: 'barID',
                showCounts: 'top',
                containerID: id,
                reactions: this.defaultReactions,
                userAction: act,
                showSuccessMessage: true,
                noButtonBorders: false
            });
        },

        onBeforeScreenLoadCb: function(d) {

            switch (d.nextScreen) {
                case "gigya-register-screen":
                    Tn.parseAnalytics({
                        "url_section": "/",
                        "section": "profile",
                        "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " create profile",
                        "template_type": "adbp:misc",
                        "content_type": "other:overlay",
                        "search.keyword": "",
                        "search.number_results": "",
                        "friendly_name": window.siteDefaults.name.toLowerCase() + " create profile",
                        "series_name": ""
                    }, false);
                    break;
                case "gigya-login-screen":
                    Tn.parseAnalytics({
                        "url_section": "/",
                        "section": "profile",
                        "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " login",
                        "template_type": "adbp:misc",
                        "content_type": "other:overlay",
                        "search.keyword": "",
                        "search.number_results": "",
                        "friendly_name": window.siteDefaults.name.toLowerCase() + " profile login",
                        "series_name": ""
                    }, false);
                    break;
                case "gigya-thank-you-screen":
                    console.log('This can be a place where we can set the browser info in gigya.  It is called before onAfterScreenLoad()... then gigya-log-in-dialog-loaded ... for social we could use accounts.socialLogin');
                    break;
            }
            //$('body').trigger('gigya-before-screen-load');
        },

        setErrorMessage: function(errorKey, errorMsg){
            if(gigya.i18n && gigya.i18n["gigya.services.accounts.plugins.screenSet.js"] && gigya.i18n["gigya.services.accounts.plugins.screenSet.js"].en){
                gigya.i18n["gigya.services.accounts.plugins.screenSet.js"].en[errorKey] = errorMsg;
            }
        },
        getErrorMessages: function(errorKey){
            var msg;
            if(gigya.i18n && gigya.i18n["gigya.services.accounts.plugins.screenSet.js"] && gigya.i18n["gigya.services.accounts.plugins.screenSet.js"].en){
                msg = gigya.i18n["gigya.services.accounts.plugins.screenSet.js"].en[errorKey];
            }
            return msg;
        },

        /**
         * Ensures that the screenset html is loaded before triggering the callback
         * @param  {Function} cb The method to be called once the screenset is loaded
         */
        ensureScreenSetLoaded: function(cb) {
            if ($('#profile-dialog').length > 0) {
                cb();
                return;
            }

            Tn.showPjaxSplash(true);
            $.ajax({
                url: "/includes/gigya.html",
                dataType: 'text'
            }).always(function() {
                Tn.showPjaxSplash(false);
            }).fail(function() {
                Tn.alert("Could not load login screenset");
            }).success(function(data) {
                data = data.replace(/SITE_ID/g, window.siteDefaults.name);
                $('body').append(data);

                // Buidl our recent history list every time we expand the frame
                $('#profile-contents-three').on('shown.bs.collapse', function() {
                    Tn.getCarouselData(function(carousels, rows) {
                        var shows = {},
                            results = [],
                            resultsEl = $('.profile-videos');

                        resultsEl.empty();

                        $.each(rows, function(showIndex) {
                            $.each(carousels[showIndex], function(index, ep) {
                                if (!ep.playable) {
                                    return;
                                }
                                shows[ep.titleid] = ep;
                            });
                        });

                        var history = Tn.Users.getPref('videoHistory', {});
                        $.each(history, function(key, val) {
                            if (shows[key]) {
                                // Add our result and include the date so we know where to start off at
                                results.push($.extend(shows[key], {
                                    dt: val.dt
                                }));
                            }
                        });

                        // Sort the results in date order
                        results.sort(function(b, a) {
                            if (a.dt > b.dt) {
                                return 1;
                            }
                            if (a.dt < b.dt) {
                                return -1;
                            }
                            return 0;
                        });

                        // Add our results to the profile video container
                        if (results.length > 0) {
                            var container = $('<div class="results row"></div>');
                            container.appendTo(resultsEl);

                            $.each(results, function(key, ep) {

                                // Only display the last 6 results
                                if (key > 6) {
                                    return false;
                                }

                                var item = $('<div class="search-item col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>');
                                item.appendTo(container);
                                var epText = ep.epinfo;
                                epText = epText.replace(/Season\s/gi, "S").replace(/Episode\s/gi, "E");
                                ep.epinfo = epText;

                                Tn.initializeShowOverlay(item, ep);

                                if ($('#profile.contents-three a[data-toggle="collapse"]:not(.collapsed)')) {
                                    $('#profile-dialog .showTitle').show();
                                } else {
                                    $('#profile-dialog .showTitle').hide();
                                }
                            });
                        } else {
                            resultsEl.append('<div class="watchnow">No history available</div>');
                        }

                        updateProfileSize();
                    });
                });

                $('#profile-dialog').find(".mvpd-show-picker").on("click", function(event) {
                    event.preventDefault();
                    //closing profile dialog box on this click since it disables some functionality in auth box
                    $('#profile-dialog').modal('hide');
                    Tn.Auth.getAuthentication(window.currentPageUrl);
                });
                $('#profile-dialog').find(".mvpd-sign-out").on("click", function(event) {
                    event.preventDefault();
                    Tn.Auth.logout();
                });

                $('#profile-dialog').find('.profile-save-changes').click(function(event) {
                    event.preventDefault();
                    var oldPassword = $('.profile-oldpassword-value').val() || '',
                        newPassword = $('.profile-newpassword-value').val() || '',
                        confirmPassword = $('.profile-confirmpassword-value').val() || '',
                        data = {
                            profile: {
                                firstName: $('.profile-firstname-value').val(),
                                lastName: $('.profile-lastname-value').val(),
                                email: $('.profile-email-value').val()
                            },
                            callback: function(o) {
                                Tn.showPjaxSplash(false);
                                if (o.errorCode !== 0) {
                                    Tn.profileerror("We experienced a problem with your profile. Please try again.<br>" + o.errorDetails);
                                    console.error("Gigya::Error getting user settings", o);
                                } else {
                                    updateProfileNames($('.profile-firstname-value').val(), $('.profile-lastname-value').val(), $('.profile-email-value').val());
                                    Tn.success("Your " + window.siteDefaults.name + " Profile has been updated!");
                                }
                            }
                        };

                    if (oldPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0) {
                        if (newPassword.length < 4 || newPassword !== confirmPassword) {
                            Tn.profileerror("Please enter a valid passord.");
                            return;
                        }
                        data.password = oldPassword;
                        data.newPassword = newPassword;
                    }

                    Tn.showPjaxSplash(true);
                    gigya.accounts.setAccountInfo(data);
                });

                Tn.Users.setupLogin($('#profile-dialog'));
                updateProfileInfo();

                Tn.updateBrandImage();
                // Call our callback method
                cb();
            });
        },

        /**
         * @private
         * Sets up callbacks on the default login methods
         */
        setupLogin: function(item) {
            item.find('.signUp').click(function(event) {
                event.preventDefault();
                Tn.Users.ensureScreenSetLoaded(function() {
                    gigya.accounts.showScreenSet({
                        screenSet: 'Mobile-login',
                        mobileScreenSet: 'Mobile-login',
                        onBeforeScreenLoad: Tn.Users.onBeforeScreenLoadCb
                    });
                });
            });
            item.find('.logIn').click(function(event) {
                event.preventDefault();
                $('body').trigger('gigya-log-in-clicked');
                Tn.Users.logIn();
            });
            item.find('.editProfile').click(function(event) {
                event.preventDefault();
                $('body').trigger('gigya-edit-profile-clicked');
                Tn.Users.ensureScreenSetLoaded(function() {
                    $('#profile-dialog').modal('show');
                    Tn.parseAnalytics({
                        "url_section": "/",
                        "section": "profile",
                        "subsection": "profile:" + window.siteDefaults.name.toLowerCase() + " profile info",
                        "template_type": "adbp:misc",
                        "content_type": "other:overlay",
                        "search.keyword": "",
                        "search.number_results": "",
                        "friendly_name": window.siteDefaults.name.toLowerCase() + " profile info",
                        "series_name": ""
                    }, false);
                });
            });
            item.find('.logOut').click(function(event) {
                event.preventDefault();
                Tn.Users.logOut();
                $('#profile-dialog').modal('hide');
            });
        },

        /**
         * Logs the user into the system
         */
        logIn: function() {
            var screenSet = 'Login-web';
            Tn.Users.ensureScreenSetLoaded(function() {
                Tn.screenSetShown = true;

                $('body').trigger('gigya-log-in-dialog');

                gigya.accounts.showScreenSet({
                    screenSet: screenSet,
                    onLogin: function() {
                        console.log('################## onLogin');
                    },
                    onError: function(obj) {
                        var emailError = false,
                            emailErrorMsg = Tn.Users.getErrorMessages(Tn.Users.emailAlreadyExistsMsgKey),
                            defaultErrorMsg = "We experienced a problem with your profile. Please try again.";
                        if($.isArray(obj.response.validationErrors)){
                            for(var i=0;i < obj.response.validationErrors.length; i++){
                                var validationError = obj.response.validationErrors[i];
                                if(obj.errorCode == 400009 && validationError.errorCode == 400003){
                                    emailError = true;
                                }
                            }
                        }
                        if(emailError) { // Unique identifier exists
                            Tn.profileerror(emailErrorMsg);
                            $('#'+obj.form + ' .gigya-form-error-msg').hide(); // http://tickets.turner.com/browse/TENDP-11807 : they want to hide this message in special cases
                        } else {
                            $('#'+obj.form + ' .gigya-form-error-msg').show(); // http://tickets.turner.com/browse/TENDP-11807 
                            Tn.profileerror(defaultErrorMsg);
                        }

                        console.error("Gigya::logIn", arguments);
                    },
                    onAfterScreenLoad: function(obj) {
                        $('body').trigger('gigya-log-in-dialog-loaded');
                        if (!Tn.Users.getPref('lastLogin') && obj.currentScreen == "gigya-thank-you-screen" && obj.response && obj.response.UID) { // After submitted email form
                            // face book uses gigya-link-account-screen when they found the email address already
                            //Call service where I can set the browser information. 
                            Tn.Users.setBrowser(obj.response.UID, obj.response.UIDSignature, obj.response.signatureTimestamp);
                        } else if(!Tn.Users.getPref('lastLogin') && obj.currentScreen == "gigya-complete-registiration-screen" 
                            && obj.response && obj.response.response && obj.response.response.UID 
                            && obj.response.response.UIDSignature && obj.response.response.signatureTimestamp ) { // After twitter or facebook ( email prohibitted ) click
                            //Call service where I can set the browser information.
                            Tn.Users.setBrowser(obj.response.response.UID, obj.response.response.UIDSignature, obj.response.response.signatureTimestamp);
                        }  
                        Tn.Users.setErrorMessage(Tn.Users.emailAlreadyExistsMsgKey, Tn.Users.emailAlreadyExistsMsg);
                    },
                    beforeRequest: function(){
                        console.log('################## beforeRequest');
                    },
                    onHide: function() {
                        Tn.screenSetShown = false;
                        $('body').trigger('gigya-screen-set-hidden');
                    },
                    onBeforeScreenLoad: Tn.Users.onBeforeScreenLoadCb
                });
            });
        },

        /**
         * Closes the login screenset if shown
         */
        cancelLogin: function() {
            if (!Tn.screenSetShown) {
                return;
            }
            Tn.screenSetShown = false;
            gigya.accounts.hideScreenSet({
                screenSet: 'Login-web'
            });
            $('body').trigger('gigya-cancel-log-out-dialog');
        },

        /**
         * Logs any logged in user out of the system
         */
        logOut: function() {
            console.error("Logging out of gigya");
            this.syncPrefsImmediately();
            //setTimeout to avoid race condition
            setTimeout( function(){
                gigya.accounts.logout({});}, 2000);
            $('body').trigger('gigya-log-out-dialog');
        },



        /**
         * Adds a comment UI at the id specified
         * @param  {String} id       The id of the dom element to place comments
         * @param  {String} category The server generated id for the comment
         */
        setupComments: function(id, category) {
            gigya.comments.showCommentsUI({
                categoryID: category,
                streamID: '',
                containerID: id,
                deviceType: 'mobile',
                cid: '',
                version: 2,
                useSiteLogin: true
                    //,enabledShareProviders: 'facebook,twitter,yahoo,linkedin'
            });
        },

        /**
         * Initializes the user management system
         * @param  {Object} config overrides to our default configuration values
         */
        initialize: function(config) {
            var me = this;
            jQuery.extend(Tn.Users, config || {});

            // Setup reactions if there is a container id specified
            if (me.reactionContainerId) {
                me.setupReactions(me.reactionContainerId, me.reactionLink, me.reactionTitle);
            }

            if (me.commentCategory && me.commentId) {
                me.setupComments(me.commentId, me.commentCategory);
            }

            // Add our callbacks for logging in/out
            me.setupLogin($('body'));

            // When dealing with RaaS, we have to notify social that we're logged in otherwise the plugins won't retain current user
            gigya.accounts.getAccountInfo({
                callback: function(user) {
                    if (user.errorCode === 0) {

                        // We won't get a provider here, so lock the last provider since that's who logged in
                        Tn.lockUserProvider = true;

                        gigya.socialize.notifyLogin({
                            siteUID: user.UID,
                            timestamp: user.signatureTimestamp,
                            UIDSig: user.UIDSignature
                        });

                        if (Tn.Users.onStartup) {
                            // Wait 30 seconds for preferences and such to be pulled down before calling the startup method
                            Tn.Users.onStartupWatch = setTimeout(function() {
                                delete Tn.Users.onStartupWatch;
                                console.error("Gigya: Error loading user preferences");
                                Tn.Users.onStartup(Tn.currentUser.UID);

                                if (Tn.Users.onLoginCB) {
                                    Tn.Users.onLoginCB(Tn.currentUser.UID);
                                }

                            }, 30000);
                        }
                    } else {
                        if (Tn.Users.onStartup) {
                            Tn.Users.onStartup(null);
                        }
                        return;
                    }
                }
            });
        }
    };

    // Run the following commands when the application first starts up
    Tn.onReady(function() {

        $('body').on('pageresize', updateProfileSize);

        // Hide the logout and edit profile UI's until we authenticate for the first time
        $('.logOut, .editProfile, .visible-logged-in').addClass('tn-hidden');

        // Add event handlers to look for then the user logs in/out of gigya
        gigya.accounts.addEventHandlers({
            onLogin: function(user) {
                Tn.currentUser = user;

                $('body').addClass('profile-signed-in').removeClass('profile-signed-out');
                $('.logIn, .signUp, .visible-logged-out').addClass('tn-hidden');
                $('.logOut, .editProfile, .visible-logged-in').removeClass('tn-hidden');
                // updateProfileNames(user.profile.firstName, user.profile.lastName, user.profile.email);
                // $('#profile-dialog').attr('provider', user.provider).toggleClass('social', user.provider.length === 0 ? false : true);

                Tn.Users.prefs = JSON.parse(user.data.prefs || "{}");

                if (Tn.Users.onStartupWatch) {
                    clearTimeout(Tn.Users.onStartupWatch);
                    Tn.Users.onStartupWatch = null;
                    Tn.Users.onStartup(Tn.currentUser.UID);
                }
                if (Tn.Users.onLoginCB) {
                    Tn.Users.onLoginCB(Tn.currentUser.UID);
                }
                $('body').trigger('gigya-log-in');

                if (Tn.lockUserProvider) {
                    delete Tn.lockUserProvider;
                } else {
                    Tn.Users.setPref("provider", user.provider);
                }
                if (!Tn.Users.getPref('lastLogin')) { // After submitted email form
                    // face book: gigya-link-account-screen when they found the email address already
                    Tn.Users.setBrowser(user.UID, user.UIDSignature, user.signatureTimestamp);
                }
                Tn.Users.setPref("lastLogin", new Date().getTime());

                updateProfileInfo();

                // // Grab the user settings so that they are available as preferences before notifying of login
                // gigya.socialize.getUserSettings({
                //     group: 'preferences',
                //     callback: function(o) {
                //         if (o.errorCode !== 0) {
                //             console.error("Gigya::Error getting user settings", o);
                //         } else {
                //             Tn.Users.prefs = o.settings;
                //             if (!Tn.Users.getPref('lastLogin')) {
                //                 Tn.success("Welcome " + user.profile.firstName + ", your profile was sucecssfully created.");
                //                 Tn.Users.setPref("lastLogin", new Date().getTime());
                //             }
                //             console.error("Found prefs", o.settings);
                //         }
                //     }
                // });
            },
            onLogout: function() {
                delete Tn.currentUser;
                $('body').addClass('profile-signed-out').removeClass('profile-signed-in');
                $('.logIn, .signUp, .visible-logged-out').removeClass('tn-hidden');
                $('.logOut, .editProfile, .visible-logged-in').addClass('tn-hidden');
                Tn.Users.prefs = {};
                $('body').trigger('gigya-log-out');
                if (Tn.Users.onLogoutCB) {
                    Tn.Users.onLogoutCB();
                }
            }
        });
    });

})(Tn, jQuery, window.gigya, document, window);

}

/*
     FILE ARCHIVED ON 17:29:23 Dec 31, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 20:00:43 Apr 23, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.434
  load_resource: 107.901
  PetaboxLoader3.resolve: 48.038
  PetaboxLoader3.datanode: 31.579
*/