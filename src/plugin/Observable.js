
var defineClass = require("metaphorjs-class/src/func/defineClass.js"),
    nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js");

require("../mixin/Observable.js");

module.exports = defineClass({

    $class: "plugin.Observable",
    $mixins: ["mixin.Observable"],

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