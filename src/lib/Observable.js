
var bind = require("metaphorjs-shared/src/func/bind.js"),
    extend = require("metaphorjs-shared/src/func/extend.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");
    
require("./ObservableEvent.js");

module.exports = MetaphorJs.lib.Observable = (function(){

/**
 * @description A javascript event system implementing multiple patterns: 
 * observable, collector and pipe.
 * @description Observable:
 * @code src-docs/examples/observable.js
 *
 * @description Collector:
 * @code src-docs/examples/collector.js
 * 
 * @description Pipe:
 * @code src-docs/examples/pipe.js
 *
 * @class MetaphorJs.lib.Observable
 * @author Ivan Kuindzhi
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {


    /**
     * @method createEvent
     * @param {string} name {
     *      Event name
     *      @required
     * }
     * @param {object|string|bool} options {
     *  Options object or returnResult value. All options are optional.
     * 
     *  @type {string|bool} returnResult {
     *   false -- return first 'false' result and stop calling listeners after that<br>
     *   true -- return first 'true' result and stop calling listeners after that<br>
     *   "all" -- return all results as array<br>
     *   "concat" -- merge all results into one array (each result must be array)<br>
     *   "merge" -- merge all results into one object (each result much be object)<br>
     *   "pipe" -- pass return value of previous listener to the next listener.
     *             Only first trigger parameter is being replaced with return value,
     *             others stay as is.<br>
     *   "first" -- return result of the first handler (next listener will not be called)<br>
     *   "nonempty" -- return first nonempty result<br>
     *   "last" -- return result of the last handler (all listeners will be called)<br>
     *  }
     *  @type {bool} autoTrigger {
     *      once triggered, all future subscribers will be automatically called
     *      with last trigger params
     *      @code src-docs/examples/autoTrigger.js
     * }
     *  @type {function} triggerFilter {
     *      This function will be called each time event is triggered. 
     *      Return false to skip listener.
     *       @code src-docs/examples/triggerFilter.js
     *       @param {object} listener This object contains all information about the listener, including
     *           all data you provided in options while subscribing to the event.
     *       @param {[]} arguments
     *       @return {bool}
     *  }
     *  @type {object} filterContext triggerFilter's context
     *  @type {bool} expectPromises {   
     *      Expect listeners to return Promises. If <code>returnResult</code> is set,
     *      promises will be treated as return values unless <code>resolvePromises</code>
     *      is set.
     *  }
     *  @type {bool} resolvePromises {
     *      In pair with <code>expectPromises</code> and <code>returnResult</code>
     *      this option makes trigger function wait for promises to resolve.
     *      All or just one depends on returnResult mode. "pipe" mode 
     *      makes promises resolve consequentially passing resolved value
     *      to the next promise.
     *  }
     * }
     * @returns {MetaphorJs.lib.ObservableEvent}
     */
    createEvent: function(name, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new MetaphorJs.lib.ObservableEvent(name, options);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {MetaphorJs.lib.ObservableEvent|undefined}
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
    *       Event name. Use '*' to subscribe to all events.
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
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
        *      @type {bool|int} async run event asynchronously. If event was
        *                      created with <code>expectPromises: true</code>, 
        *                      this option is ignored.
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new MetaphorJs.lib.ObservableEvent(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link class:Observable.on}, but options.limit is forcefully set to 1.
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
    * @param {object} context If you called on() with context you must 
    *                         call un() with the same context
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
     * Relay all events of <code>eventSource</code> through this observable.
     * @method
     * @access public
     * @code src-docs/examples/relay.js
     * @param {object} eventSource
     * @param {string} eventName
     */
    relayEvent: function(eventSource, eventName) {
        eventSource.on(eventName, this.trigger, this, {
            prepend: eventName === "*" ? null : [eventName]
        });
    },

    /**
     * Stop relaying events of <code>eventSource</code>
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    unrelayEvent: function(eventSource, eventName) {
        eventSource.un(eventName, this.trigger, this);
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
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */
    hasEvent: function(name) {
        return !!this.events[name];
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
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    },

    /**
    * Trigger an event -- call all listeners. Also triggers '*' event.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events,
            e,
            res = null;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            res = e.trigger.apply(e, toArray(arguments).slice(1));
        }

        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger.apply(e, arguments);
        }
        
        return res;
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
            events[name].$destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    */
    $destroy: function() {
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
    * @code src-docs/examples/api.js
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
                    "resumeAllEvents", "destroyEvent",
                    "relayEvent", "unrelayEvent"
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