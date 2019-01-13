
var assert = require("assert"),
    Observable = require("../dist/metaphorjs.observable.npm.js"),
    util = require("./_util");

var getObs = function(rr) {
    var o = new Observable;
    o.createEvent("event", {
        returnResult: rr,
        expectPromises: true,
        resolvePromises: true
    });
    return o;
};

var l1 = function(val) {
    return function(){
        return util.getPromise(val);
    };
};

var l2 = function(val, opt) {
    return function(){
        opt.triggered = true; 
        return util.getPromise(val);
    }
};

var l3 = function(resolver) {
    return function(value) {
        return new Promise(function(resolve, reject){
            resolve(resolver(value));
        });
    };
}

describe("Observable", function(){
    describe("async returnResult", function(){
        it("all", function(done){
            var o = getObs("all");
            o.on("event", l1(1));
            o.on("event", l1(2));
            o.trigger("event").then(function(res){
                assert.deepStrictEqual([1,2], res);
                done();
            }).catch(function(reason){
                done(reason);
            });
        });

        it("first", function(done){
            var o = getObs("first");
            var opt = {};
            o.on("event", l1(1));
            o.on("event", l2(2, opt));
            o.trigger("event").then(function(res){
                assert.equal(1, res);
                assert(opt.triggered === undefined);
                done();
            }).catch(function(reason){
                done(reason);
            });
        });

        it("false", function(done){
            var o = getObs(false);
            var opt = {};
            o.on("event", l1(false));
            o.on("event", l2(2, opt));
            o.trigger("event").then(function(res){
                assert.strictEqual(false, res);
                //assert(opt.triggered === undefined);
                done();
            }).catch(function(reason){
                done(reason);
            });
        });

        it("true", function(done){
            var o = getObs(true);
            var opt = {};
            o.on("event", l1(true));
            o.on("event", l2(2, opt));
            o.trigger("event").then(function(res){
                assert.strictEqual(true, res);
                //assert(opt.triggered === undefined);
                done();
            }).catch(function(reason){
                done(reason);
            });
        });

        it("concat", function(done){
            var o = getObs("concat");
            o.on("event", l1([1]));
            o.on("event", l1([2]));
            o.trigger("event").then(function(res){
                assert.deepStrictEqual([1,2], res);
                done();
            })
            .catch(function(reason){
                done(reason);
            });
        });

        it("merge", function(done){
            var o = getObs("merge");
            o.on("event", l1({a: 1}));
            o.on("event", l1({b: 2}));
            o.trigger("event").then(function(res){
                assert.deepStrictEqual({a: 1, b: 2}, res);
                done();
            })
            .catch(function(reason){
                done(reason);
            });
        });

        it("nonempty", function(done){
            var o = getObs("nonempty");
            var opt = {};
            o.on("event", l1());
            o.on("event", l1(1));
            o.on("event", l2(null, opt));
            o.trigger("event").then(function(res){
                assert.equal(1, res);
                // it does get triggered alright
                //assert(opt.triggered === undefined);
                done();
            })
            .catch(function(reason){
                done(reason);
            });
        });

        it("last", function(done){
            var o = getObs("last");
            o.on("event", l1(3));
            o.on("event", l1(2));
            o.on("event", l1(1));
            o.trigger("event").then(function(res){
                assert.equal(1, res);
                done();
            })
            .catch(function(reason){
                done(reason);
            });
        });

        it("pipe", function(done){
            var o = getObs("pipe");
            o.on("event", l3(function(value){
                return value + value
            }));
            o.on("event", l3(function(value){
                return value * value
            }));
            o.trigger("event", 1).then(function(res){
                assert.equal(4, res);
                done();
            })
            .catch(function(reason){
                done(reason);
            });
        });
    });
});