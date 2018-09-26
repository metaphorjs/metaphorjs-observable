
var assert = require("assert"),
    Observable = require("../dist/metaphorjs.observable.npm.js"),
    util = require("./_util");

describe("Observable", function(){

    it("should append and prepend arguments", function(){

        var o = new Observable;

        var l = function(saveIn) {
            return function() {
                Array.prototype.slice.call(arguments).forEach(function(arg){
                    saveIn.push(arg);
                });
            };
        };

        var appended = [],
            prepended = [];

        o.on("event", l(appended), null, {append: [1,2]});
        o.on("event", l(prepended), null, {prepend: [3,4]});

        o.trigger("event", "!");

        assert.deepStrictEqual([3, 4, "!"], prepended);
        assert.deepStrictEqual(["!", 1, 2], appended);
    });

    it("should respect start and limit options", function(){

        var o = new Observable;
        var triggered = [];
        var l = util.listenerFactory("log-id", triggered);

        o.on("event", l(1), null, {limit: 2});
        o.on("event", l(2), null, {start: 3});

        o.trigger("event");
        o.trigger("event");
        o.trigger("event");
        o.trigger("event");

        assert.deepStrictEqual([1,1,2,2], triggered);
    });

    it("should respect given context and control dupes", function(){
        
        var o = new Observable;
        var triggered = [];
        var context = {
            a: 1,
            b: 2,
            l: function(){
                triggered.push(this.a);
            },
            d: function() {
                triggered.push(this.b);
            }
        };

        o.on("event", context.l, context);
        o.on("event", context.l, context);
        o.on("event", context.d, context, {allowDupes: true});
        o.on("event", context.d, context, {allowDupes: true});

        o.trigger("event");

        assert.deepStrictEqual([1, 2, 2], triggered);
    });

    it("should run listeners asynchronously when asked", function(done){
        var o = new Observable;
        o.on("event", done, null, {async: 100});
        o.trigger("event");
    });

    it("should unsubscribe from event", function() {

        var o = new Observable;
        var triggered = [];
        var l = function(){
            triggered.push(1);
        };
        o.on("event", l);
        o.trigger("event");
        o.un("event", l);
        o.trigger("event");

        assert.deepStrictEqual([1], triggered);
    });
});

