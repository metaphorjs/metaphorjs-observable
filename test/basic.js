
var assert = require("assert"),
    Observable = require("../dist/metaphorjs.observable.npm.js"),
    util = require("./_util");

describe("Observable", function(){
    it("triggers basic event", function(){
        var o = new Observable;
        var triggered = [];
        var arg = 0;
        var l = util.listenerFactory("log-id", triggered);

        o.on("event", function(value){
            arg = value;
        });
        o.on("event", l("first"));
        o.on("event", l("second"));
        o.trigger("event", 1);

        assert.equal(1, arg);
        assert.deepStrictEqual(["first", "second"], triggered);
    });

    it("triggers listeners in right order", function(){
        var o = new Observable;
        var triggered = [];
        var l = util.listenerFactory("log-id", triggered);

        o.on("event", l(1));
        o.on("event", l(2));
        o.on("event", l(3), null, {first: true});
        o.trigger("event");

        assert.deepStrictEqual([3,1,2], triggered);
    });
});