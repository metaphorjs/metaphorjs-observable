require("../lib/Observable.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

/**
 * @mixin MetaphorJs.mixin.Observable
 * @description Mixin adds observable features to the host object.
 *              It adds 'callback' option to the host config. See $beforeInit.
 *              Mixin is designed for MetaphorJs class system.
 * @code src-docs/examples/mixin.js
 */
module.exports = MetaphorJs.mixin.Observable = {

    /**
     * @private
     * @type {Observable}
     * @description You can use this instance in your $init function
     */
    $$observable: null,

    /**
     * @private
     * @type {object}
     */
    $$callbackContext: null,

    /**
     * @protected
     * @type {object} {
     *      Override this to define event properties. 
     *      Object's key is event name, value - either returnResult or 
     *      options object. See {@link class:MetaphorJs.lib.Observable.createEvent}
     * }
     */
    $$events: null,

    /**
     * @method
     * @private
     * @param {object} cfg {
     *      This is a config that was passed to the host object's constructor.
     *      It is being passed to mixin's $beforeInit automatically.
     *      @type {object} callback {
     *          Here, except for 'context', '$context' and 'scope', 
     *          keys are event names and values are listeners. 
     *          @type {object} context All given listeners context
     *          @type {object} scope The same
     *      }
     * }
     */
    $beforeInit: function(cfg) {
        var self = this;
        self.$$observable = new MetaphorJs.lib.Observable;
        self.$initObservable(cfg);
    },

    /**
     * @method
     * @private
     * @ignore
     * @param {object} cfg
     */
    $initObservable: function(cfg) {
        MetaphorJs.lib.Observable.$initHost(this, cfg, this.$$observable);
    },

    /**
     * @method
     * @see {@link class:Observable.on}
     */
    on: function() {
        var o = this.$$observable;
        return o ? o.on.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.un}
     */
    un: function() {
        var o = this.$$observable;
        return o ? o.un.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.once}
     */
    once: function() {
        var o = this.$$observable;
        return o ? o.once.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.trigger}
     */
    trigger: function() {
        var o = this.$$observable;
        return o ? o.trigger.apply(o, arguments) : null;
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.$destroy();
        self.$$observable = null;
    }
};
