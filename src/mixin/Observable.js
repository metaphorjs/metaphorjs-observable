
var Observable = require("../lib/Observable.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @mixin Observable
 */
module.exports = ns.register("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,
    $$callbackContext: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        self.$initObservable(cfg);
    },

    $initObservable: function(cfg) {

        var self    = this,
            obs     = self.$$observable,
            i;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context || ls.scope || ls.$context,
                events = extend({}, self.$$events, ls.$events, true, false);

            for (i in events) {
                obs.createEvent(i, events[i]);
            }

            ls.context = null;
            ls.scope = null;

            for (i in ls) {
                if (ls[i]) {
                    obs.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;

            if (context) {
                self.$$callbackContext = context;
            }
        }
        else if (self.$$events) {
            for (i in self.$$events) {
                obs.createEvent(i, self.$$events[i]);
            }
        }
    },

    on: function() {
        var o = this.$$observable;
        return o ? o.on.apply(o, arguments) : null;
    },

    un: function() {
        var o = this.$$observable;
        return o ? o.un.apply(o, arguments) : null;
    },

    once: function() {
        var o = this.$$observable;
        return o ? o.once.apply(o, arguments) : null;
    },

    trigger: function() {
        var o = this.$$observable;
        return o ? o.trigger.apply(o, arguments) : null;
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});
