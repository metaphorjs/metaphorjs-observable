import { assert } from "chai"
import Observable from "../src/index"
import util from "./util"

describe("Observable", function(){

    it("should relay other events", function(){

        const o1 = new Observable;
        const o2 = new Observable;
        const triggered = [];
        const l = util.listenerFactory("log-id", triggered);

        o1.relay(o2, "event");
        o1.on("event", l(1));
        o2.on("event", l(2));
        o2.trigger("event");

        o1.unrelay(o2, "event");
        o2.trigger("event");

        assert.deepStrictEqual([1, 2, 2], triggered);
    });

    it("should relay * events", function(){

        const o1 = new Observable;
        const o2 = new Observable;
        const triggered = [];
        const l = util.listenerFactory("log-id", triggered);

        o1.relay(o2, "*");
        o1.on("event1", l(1));
        o1.on("event2", l(2));
        o2.trigger("event1");
        o2.trigger("event2");

        assert.deepStrictEqual([1, 2], triggered);
    });

    it("should relay * events with prefix", function(){

        const o1 = new Observable;
        const o2 = new Observable;
        const triggered = [];
        const l = util.listenerFactory("log-id", triggered);

        o1.relay(o2, "*", null, "pfx-");
        o1.on("pfx-event1", l(1));
        o1.on("pfx-event2", l(2));
        o2.trigger("event1");
        o2.trigger("event2");

        assert.deepStrictEqual([1, 2], triggered);
    });

    it("should suspend and resume events", function(){
        const o = new Observable;
        const triggered = [];
        const l = function() {
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
        const o = new Observable;
        const context = {
            l: function(){},
            l2: function(){}
        };
        const l = function(){};

        o.createEvent("event");
        o.createEvent("event2");
        o.on("event", l);
        o.on("event", context.l, { context });

        assert(o.hasListener());
        assert(o.hasListener("event"));
        assert(!o.hasListener("event2"));
        assert(!o.hasListener("event3"));

        assert(o.hasListener("event", l));
        assert(o.hasListener("event", context.l, context));
        assert(!o.hasListener("event", context.l2));

        assert(!o.hasListener("event2", l));

        assert(o.hasEvent("event"));
        assert(!o.hasEvent("event3"));

        o.removeAllListeners("event");
        assert(!o.hasListener());
        assert(!o.hasListener("event"));
        assert(!o.hasListener("event", l));
        assert(!o.hasListener("event", context.l));
    });
});