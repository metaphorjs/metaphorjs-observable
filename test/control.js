
var assert = require("assert"),
    Observable = require("../dist/metaphorjs.observable.npm.js"),
    util = require("./_util");

describe("Observable", function(){

    it("should relay other events", function(){

        var o1 = new Observable;
        var o2 = new Observable;
        var triggered = [];
        var l = util.listenerFactory("log-id", triggered);

        o1.relayEvent(o2, "event");
        o1.on("event", l(1));
        o2.on("event", l(2));
        o2.trigger("event");

        o1.unrelayEvent(o2, "event");
        o2.trigger("event");

        assert.deepStrictEqual([1, 2, 2], triggered);
    });

    it("should relay * events", function(){

        var o1 = new Observable;
        var o2 = new Observable;
        var triggered = [];
        var l = util.listenerFactory("log-id", triggered);

        o1.relayEvent(o2, "*");
        o1.on("event1", l(1));
        o1.on("event2", l(2));
        o2.trigger("event1");
        o2.trigger("event2");

        assert.deepStrictEqual([1, 2], triggered);
    });

    it("should relay * events with prefix", function(){

        var o1 = new Observable;
        var o2 = new Observable;
        var triggered = [];
        var l = util.listenerFactory("log-id", triggered);

        o1.relayEvent(o2, "*", null, "pfx-");
        o1.on("pfx-event1", l(1));
        o1.on("pfx-event2", l(2));
        o2.trigger("event1");
        o2.trigger("event2");

        assert.deepStrictEqual([1, 2], triggered);
    });

    it("should suspend and resume events", function(){
        var o = new Observable;
        var triggered = [];
        var l = function() {
            triggered.push(1);
        };

        o.on("event", l);
        o.trigger("event");
        o.suspendEvent("event");
        o.trigger("event");
        o.resumeEvent("event");
        o.trigger("event");
        o.suspendAllEvents();
        o.trigger("event");
        o.resumeAllEvents();
        o.trigger("event");

        assert.deepStrictEqual([1,1,1], triggered);
    });

    it("should indicate if it has a listener or not", function(){
        var o = new Observable;
        var context = {
            l: function(){},
            l2: function(){}
        };
        var l = function(){};

        o.createEvent("event");
        o.createEvent("event2");
        o.on("event", l);
        o.on("event", context.l, context);

        assert(o.hasListener());
        assert(o.hasListener("event"));
        assert(!o.hasListener("event2"));
        assert(!o.hasListener("event3"));

        assert(o.hasListener("event", l));
        assert(o.hasListener("event", context.l, context));
        assert(!o.hasListener("event", context.l2, context));

        assert(!o.hasListener("event2", l));

        assert(o.hasEvent("event"));
        assert(!o.hasEvent("event3"));

        o.removeAllListeners("event");
        assert(!o.hasListener());
        assert(!o.hasListener("event"));
        assert(!o.hasListener("event", l));
        assert(!o.hasListener("event", context.l, context));
    });
});