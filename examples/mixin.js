var MyClass = defineClass({
    $class: "MyClass",
    $mixins: ["mixin.Observable"],
    $init: function() {
        this.trigger("someEvent", 123);
    },

    doSomeAction: function() {
        // does some action
        this.trigger("anotherEvent", 234);
    }
});

var ParentClass = defineClass({
    $init: function() {
        this.my = new MyClass({
            callback: {
                context: this,
                someEvent: this.onSomeEvent
            }
        });
        this.my.on("anotherEvent", this.onAnotherEvent, this);
        this.my.doSomeAction();
    },

    onSomeEvent: function(value) {
        // value == 123
    },

    onAnotherEvent: function(value) {
        // value == 234
    }
});

var p = new ParentClass;