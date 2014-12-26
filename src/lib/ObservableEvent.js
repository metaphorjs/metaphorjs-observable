
var nextUid = require("metaphorjs/src/func/nextUid.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    slice = require("metaphorjs/src/func/array/slice.js"),
    isFunction = require("metaphorjs/src/func/isFunction.js"),
    undf = require("metaphorjs/src/var/undf.js");


module.exports = (function(){

    /**
     * This class is private - you can't create an event other than via Observable.
     * See Observable reference.
     * @class ObservableEvent
     * @private
     */
    var ObservableEvent = function(name, returnResult, autoTrigger, triggerFilter, filterContext) {

        var self    = this;

        self.name           = name;
        self.listeners      = [];
        self.map            = {};
        self.hash           = nextUid();
        self.uni            = '$$' + name + '_' + self.hash;
        self.suspended      = false;
        self.lid            = 0;

        if (typeof returnResult == "object" && returnResult !== null) {
            extend(self, returnResult, true, false);
        }
        else {
            self.returnResult = returnResult === undf ? null : returnResult; // first|last|all
            self.autoTrigger = autoTrigger;
            self.triggerFilter = triggerFilter;
            self.filterContext = filterContext;
        }
    };


    extend(ObservableEvent.prototype, {

        name: null,
        listeners: null,
        map: null,
        hash: null,
        uni: null,
        suspended: false,
        lid: null,
        returnResult: null,
        autoTrigger: null,
        lastTrigger: null,
        triggerFilter: null,
        filterContext: null,

        /**
         * Get event name
         * @method
         * @returns {string}
         */
        getName: function() {
            return this.name;
        },

        /**
         * @method
         */
        destroy: function() {
            var self        = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @param {object} options See Observable's on()
         */
        on: function(fn, context, options) {

            if (!fn) {
                return null;
            }

            context     = context || null;
            options     = options || {};

            var self        = this,
                uni         = self.uni,
                uniContext  = context || fn;

            if (uniContext[uni] && !options.allowDupes) {
                return null;
            }

            var id      = ++self.lid,
                first   = options.first || false;

            uniContext[uni]  = id;


            var e = {
                fn:         fn,
                context:    context,
                uniContext: uniContext,
                id:         id,
                called:     0, // how many times the function was triggered
                limit:      0, // how many times the function is allowed to trigger
                start:      1, // from which attempt it is allowed to trigger the function
                count:      0, // how many attempts to trigger the function was made
                append:     null, // append parameters
                prepend:    null // prepend parameters
            };

            extend(e, options, true, false);

            if (first) {
                self.listeners.unshift(e);
            }
            else {
                self.listeners.push(e);
            }

            self.map[id] = e;

            if (self.autoTrigger && self.lastTrigger && !self.suspended) {
                var prevFilter = self.triggerFilter;
                self.triggerFilter = function(l){
                    if (l.id == id) {
                        return prevFilter ? prevFilter(l) !== false : true;
                    }
                    return false;
                };
                self.trigger.apply(self, self.lastTrigger);
                self.triggerFilter = prevFilter;
            }

            return id;
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @param {object} options See Observable's on()
         */
        once: function(fn, context, options) {

            options = options || {};
            options.limit = 1;

            return this.on(fn, context, options);
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         */
        un: function(fn, context) {

            var self        = this,
                inx         = -1,
                uni         = self.uni,
                listeners   = self.listeners,
                id;

            if (fn == parseInt(fn)) {
                id      = fn;
            }
            else {
                context = context || fn;
                id      = context[uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    inx = i;
                    delete listeners[i].uniContext[uni];
                    break;
                }
            }

            if (inx == -1) {
                return false;
            }

            listeners.splice(inx, 1);
            delete self.map[id];
            return true;
        },

        /**
         * @method hasListener
         * @return bool
         */

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @return bool
         */
        hasListener: function(fn, context) {

            var self    = this,
                listeners   = self.listeners,
                id;

            if (fn) {

                context = context || fn;

                if (!isFunction(fn)) {
                    id  = fn;
                }
                else {
                    id  = context[self.uni];
                }

                if (!id) {
                    return false;
                }

                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].id == id) {
                        return true;
                    }
                }

                return false;
            }
            else {
                return listeners.length > 0;
            }
        },


        /**
         * @method
         */
        removeAllListeners: function() {
            var self    = this,
                listeners = self.listeners,
                uni     = self.uni,
                i, len;

            for (i = 0, len = listeners.length; i < len; i++) {
                delete listeners[i].uniContext[uni];
            }
            self.listeners   = [];
            self.map         = {};
        },

        /**
         * @method
         */
        suspend: function() {
            this.suspended = true;
        },

        /**
         * @method
         */
        resume: function() {
            this.suspended = false;
        },


        _prepareArgs: function(l, triggerArgs) {
            var args;

            if (l.append || l.prepend) {
                args    = slice.call(triggerArgs);
                if (l.prepend) {
                    args    = l.prepend.concat(args);
                }
                if (l.append) {
                    args    = args.concat(l.append);
                }
            }
            else {
                args = triggerArgs;
            }

            return args;
        },

        /**
         * @method
         * @return {*}
         */
        trigger: function() {

            var self            = this,
                listeners       = self.listeners,
                returnResult    = self.returnResult,
                filter          = self.triggerFilter,
                filterContext   = self.filterContext,
                args;

            if (self.suspended) {
                return null;
            }

            if (self.autoTrigger) {
                self.lastTrigger = slice.call(arguments);
            }

            if (listeners.length == 0) {
                return null;
            }

            var ret     = returnResult == "all" || returnResult == "merge" ?
                          [] : null,
                q, l,
                res;

            if (returnResult == "first") {
                q = [listeners[0]];
            }
            else {
                // create a snapshot of listeners list
                q = slice.call(listeners);
            }

            // now if during triggering someone unsubscribes
            // we won't skip any listener due to shifted
            // index
            while (l = q.shift()) {

                // listener may already have unsubscribed
                if (!l || !self.map[l.id]) {
                    continue;
                }

                args = self._prepareArgs(l, arguments);

                if (filter && filter.call(filterContext, l, args, self) === false) {
                    continue;
                }

                l.count++;

                if (l.count < l.start) {
                    continue;
                }

                res = l.fn.apply(l.context, args);

                l.called++;

                if (l.called == l.limit) {
                    self.un(l.id);
                }

                if (returnResult == "all") {
                    ret.push(res);
                }
                else if (returnResult == "merge" && res) {
                    ret = ret.concat(res);
                }
                else if (returnResult == "first") {
                    return res;
                }
                else if (returnResult == "nonempty" && res) {
                    return res;
                }
                else if (returnResult == "last") {
                    ret = res;
                }
                else if (returnResult == false && res === false) {
                    return false;
                }
            }

            if (returnResult) {
                return ret;
            }
        }
    }, true, false);


    return ObservableEvent;
}());