
var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    mixin_Observable = require("../mixin/Observable.js");

module.exports = MetaphorJs.plugin.Observable = cls({

    $mixins: [mixin_Observable],

    $init: function(cmp) {
        cmp.$implement({
            $$observable: this.$$observable,
            on: this.on,
            once: this.once,
            un: this.un,
            trigger: this.trigger
        });
    }
});