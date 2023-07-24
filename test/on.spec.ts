import { assert } from "chai"
import Observable from "../src/index"
import util from "./util"

describe("Observable", function(){

    it("should append and prepend arguments", function(){

        const o = new Observable;

        const l = function(saveIn) {
            return (...args) => {
                args.forEach(arg => saveIn.push(arg));
            };
        };

        const appended = [], prepended = [];

        o.on("event", l(appended), { append: [1,2] });
        o.on("event", l(prepended), { prepend: [3,4] });

        o.trigger("event", "!");

        assert.deepStrictEqual([3, 4, "!"], prepended);
        assert.deepStrictEqual(["!", 1, 2], appended);
    });

    it("should respect start and limit options", function(){

        const o = new Observable;
        const triggered = [];
        const l = util.listenerFactory("log-id", triggered);

        o.on("event", l(1), {limit: 2});
        o.on("event", l(2), {start: 3});

        o.trigger("event");
        o.trigger("event");
        o.trigger("event");
        o.trigger("event");

        assert.deepStrictEqual([1,1,2,2], triggered);
    });

    it("should respect given context and control dupes", function(){
        
        const o = new Observable;
        const triggered = [];
        const context = {
            a: 1,
            b: 2,
            l: function(){
                triggered.push(this.a);
            },
            d: function() {
                triggered.push(this.b);
            }
        };

        o.on("event", context.l, { context });
        o.on("event", context.l, { context });
        o.on("event", context.d, { context });

        o.trigger("event");

        assert.deepStrictEqual([1, 2], triggered);
    });

    it("should run listeners asynchronously when asked", function(done){
        const o = new Observable;
        o.on("event", done, {async: 100});
        o.trigger("event");
    });

    it("should unsubscribe from event", function() {

        const o = new Observable;
        const triggered = [];
        const l = function(){
            triggered.push(1);
        };
        o.on("event", l);
        o.trigger("event");
        o.un("event", l);
        o.trigger("event");

        assert.deepStrictEqual([1], triggered);
    });

    it("should unsubscribe dupes correctly", function() {

        let res = 0;
        const SomeClass = class {
            handler() {
                res++;
            }
        }

        const h1 = new SomeClass,
            h2 = new SomeClass,
            h3 = new SomeClass,
            o = new Observable;

        o.on("event", h1.handler, { context: h1 });
        o.on("event", h2.handler, { context: h2 });
        o.on("event", h3.handler, { context: h3 });

        o.trigger("event");
        o.un("event", h3.handler, h3);
        o.trigger("event");

        assert.strictEqual(5, res, "handlers should've been called 5 times");
    });
});

