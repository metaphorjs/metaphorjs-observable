
var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

require("../mixin/Observable.js");

module.exports = MetaphorJs.plugin.Observable = cls({

    $mixins: [MetaphorJs.mixin.Observable],

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