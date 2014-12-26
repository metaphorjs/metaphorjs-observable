
var bind = require("metaphorjs/src/func/bind.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    slice = require("metaphorjs/src/func/array/slice.js"),
    ObservableEvent = require("./ObservableEvent.js");


module.exports = (function(){


    /**
     * @description A javascript event system implementing two patterns - observable and collector.
     * @description Observable:
     * @code examples/observable.js
     *
     * @description Collector:
     * @code examples/collector.js
     *
     * @class Observable
     * @version 1.1
     * @author johann kuindji
     * @link https://github.com/kuindji/metaphorjs-observable
     */
    var Observable = function() {

        this.events = {};

    };


    extend(Observable.prototype, {



        /**
        * You don't have to call this function unless you want to pass params other than event name.
        * Normally, events are created automatically.
        *
        * @method createEvent
        * @access public
        * @param {string} name {
        *       Event name
        *       @required
        * }
        * @param {bool|string} returnResult {
        *   false -- return first 'false' result and stop calling listeners after that<br>
        *   "all" -- return all results as array<br>
        *   "merge" -- merge all results into one array (each result must be array)<br>
        *   "first" -- return result of the first handler (next listener will not be called)<br>
        *   "last" -- return result of the last handler (all listeners will be called)<br>
        * }
        * @param {bool} autoTrigger {
        *   once triggered, all future subscribers will be automatically called
        *   with last trigger params
        *   @code examples/autoTrigger.js
        * }
        * @param {function} triggerFilter {
        *   This function will be called each time event is triggered. Return false to skip listener.
        *   @code examples/triggerFilter.js
        *   @param {object} listener This object contains all information about the listener, including
        *       all data you provided in options while subscribing to the event.
        *   @param {[]} arguments
        *   @return {bool}
        * }
        * @return {ObservableEvent}
        */

        /**
         * @method createEvent
         * @param {string} name
         * @param {object} options {
         *  @type {string} returnResult
         *  @param {bool} autoTrigger
         *  @param {function} triggerFilter
         * }
         * @param {object} filterContext
         * @returns {ObservableEvent}
         */
        createEvent: function(name, returnResult, autoTrigger, triggerFilter, filterContext) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                events[name] = new ObservableEvent(name, returnResult, autoTrigger, triggerFilter, filterContext);
            }
            return events[name];
        },

        /**
        * @method
        * @access public
        * @param {string} name Event name
        * @return {ObservableEvent|undefined}
        */
        getEvent: function(name) {
            name = name.toLowerCase();
            return this.events[name];
        },

        /**
        * Subscribe to an event or register collector function.
        * @method
        * @access public
        * @param {string} name {
        *       Event name
        *       @required
        * }
        * @param {function} fn {
        *       Callback function
        *       @required
        * }
        * @param {object} context "this" object for the callback function
        * @param {object} options {
        *       You can pass any key-value pairs in this object. All of them will be passed to triggerFilter (if
        *       you're using one).
        *       @type {bool} first {
        *           True to prepend to the list of handlers
        *           @default false
        *       }
        *       @type {number} limit {
        *           Call handler this number of times; 0 for unlimited
        *           @default 0
        *       }
        *       @type {number} start {
        *           Start calling handler after this number of calls. Starts from 1
        *           @default 1
        *       }
         *      @type {[]} append Append parameters
         *      @type {[]} prepend Prepend parameters
         *      @type {bool} allowDupes allow the same handler twice
        * }
        */
        on: function(name, fn, context, options) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                events[name] = new ObservableEvent(name);
            }
            return events[name].on(fn, context, options);
        },

        /**
        * Same as {@link Observable.on}, but options.limit is forcefully set to 1.
        * @method
        * @access public
        */
        once: function(name, fn, context, options) {
            options     = options || {};
            options.limit = 1;
            return this.on(name, fn, context, options);
        },


        /**
        * Unsubscribe from an event
        * @method
        * @access public
        * @param {string} name Event name
        * @param {function} fn Event handler
        * @param {object} context If you called on() with context you must call un() with the same context
        */
        un: function(name, fn, context) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].un(fn, context);
        },

        /**
         * @method hasListener
         * @access public
         * @return bool
         */

        /**
        * @method hasListener
        * @access public
        * @param {string} name Event name { @required }
        * @return bool
        */

        /**
        * @method
        * @access public
        * @param {string} name Event name { @required }
        * @param {function} fn Callback function { @required }
        * @param {object} context Function's "this" object
        * @return bool
        */
        hasListener: function(name, fn, context) {
            var events = this.events;

            if (name) {
                name = name.toLowerCase();
                if (!events[name]) {
                    return false;
                }
                return events[name].hasListener(fn, context);
            }
            else {
                for (name in events) {
                    if (events[name].hasListener()) {
                        return true;
                    }
                }
                return false;
            }
        },


        /**
        * Remove all listeners from all events
        * @method removeAllListeners
        * @access public
        */

        /**
        * Remove all listeners from specific event
        * @method
        * @access public
        * @param {string} name Event name { @required }
        */
        removeAllListeners: function(name) {
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        },

        /**
        * Trigger an event -- call all listeners.
        * @method
        * @access public
        * @param {string} name Event name { @required }
        * @param {*} ... As many other params as needed
        * @return mixed
        */
        trigger: function() {

            var name = arguments[0],
                events  = this.events;

            name = name.toLowerCase();

            if (!events[name]) {
                return null;
            }

            var e = events[name];
            return e.trigger.apply(e, slice.call(arguments, 1));
        },

        /**
        * Suspend an event. Suspended event will not call any listeners on trigger().
        * @method
        * @access public
        * @param {string} name Event name
        */
        suspendEvent: function(name) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].suspend();
        },

        /**
        * @method
        * @access public
        */
        suspendAllEvents: function() {
            var events  = this.events;
            for (var name in events) {
                events[name].suspend();
            }
        },

        /**
        * Resume suspended event.
        * @method
        * @access public
        * @param {string} name Event name
        */
        resumeEvent: function(name) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].resume();
        },

        /**
        * @method
        * @access public
        */
        resumeAllEvents: function() {
            var events  = this.events;
            for (var name in events) {
                events[name].resume();
            }
        },

        /**
         * @method
         * @access public
         * @param {string} name Event name
         */
        destroyEvent: function(name) {
            var events  = this.events;
            if (events[name]) {
                events[name].removeAllListeners();
                events[name].destroy();
                delete events[name];
            }
        },


        /**
        * Destroy observable
        * @method
        * @md-not-inheritable
        * @access public
        */
        destroy: function() {
            var self    = this,
                events  = self.events;

            for (var i in events) {
                self.destroyEvent(i);
            }

            for (i in self) {
                self[i] = null;
            }
        },

        /**
        * Although all methods are public there is getApi() method that allows you
        * extending your own objects without overriding "destroy" (which you probably have)
        * @code examples/api.js
        * @method
        * @md-not-inheritable
        * @returns object
        */
        getApi: function() {

            var self    = this;

            if (!self.api) {

                var methods = [
                        "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                        "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                        "resumeAllEvents", "destroyEvent"
                    ],
                    api = {},
                    name;

                for(var i =- 1, l = methods.length;
                        ++i < l;
                        name = methods[i],
                        api[name] = bind(self[name], self)){}

                self.api = api;
            }

            return self.api;

        }
    }, true, false);


    return Observable;
}());