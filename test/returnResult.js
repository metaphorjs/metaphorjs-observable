
var assert = require("assert"),
    Observable = require("../dist/metaphorjs.observable.npm.js"),
    util = require("./_util");

describe("Observable", function(){
    describe("returnResult", function(){
        it("all", function(){
            var o = new Observable;
            o.createEvent("event", "all");
            o.on("event", function(){return 1});
            o.on("event", function(){return 2});
            var res = o.trigger("event");
            assert.deepStrictEqual([1,2], res);
        });

        it("first", function(){
            var o = new Observable;
            var triggered = false;
            o.createEvent("event", "first");
            o.on("event", function(){return 1});
            o.on("event", function(){triggered = true; return 2;});
            var res = o.trigger("event");
            assert.equal(1, res);
            assert(!triggered);
        });

        it("false", function(){
            var o = new Observable;
            var triggered = false;
            o.createEvent("event", false);
            o.on("event", function(){return false});
            o.on("event", function(){triggered = true; return 2;});
            var res = o.trigger("event");
            assert.strictEqual(false, res);
            assert(!triggered);
        });

        it("true", function(){
            var o = new Observable;
            var triggered = false;
            o.createEvent("event", true);
            o.on("event", function(){return true});
            o.on("event", function(){triggered = true; return 2;});
            var res = o.trigger("event");
            assert.strictEqual(true, res);
            assert(!triggered);
        });

        it("concat", function(){
            var o = new Observable;
            o.createEvent("event", "concat");
            o.on("event", function(){return [1]});
            o.on("event", function(){return [2]});
            var res = o.trigger("event");
            assert.deepStrictEqual([1,2], res);
        });

        it("merge", function(){
            var o = new Observable;
            o.createEvent("event", "merge");
            o.on("event", function(){return {a: 1}});
            o.on("event", function(){return {b: 2}});
            var res = o.trigger("event");
            assert.deepStrictEqual({a: 1, b: 2}, res);
        });

        it("nonempty", function(){
            var o = new Observable;
            var triggered = false;
            o.createEvent("event", "nonempty");
            o.on("event", function(){});
            o.on("event", function(){return 1});
            o.on("event", function(){triggered = true});
            var res = o.trigger("event");
            assert.equal(1, res);
            assert(!triggered);
        });

        it("last", function(){
            var o = new Observable;
            o.createEvent("event", "last");
            o.on("event", function(){return 3});
            o.on("event", function(){return 2});
            o.on("event", function(){return 1});
            var res = o.trigger("event");
            assert.equal(1, res);
        });

        it("pipe", function(){
            var o = new Observable;
            o.createEvent("event", "pipe");
            o.on("event", function(value){return value + value});
            o.on("event", function(value){return value * value});
            var res = o.trigger("event", 1);
            assert.equal(4, res);
        });
    });
});