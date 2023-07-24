import { assert } from "chai"
import Observable from "../src/index"

describe("Observable", () => {
    it("should make a promise out of an event", (done) => {

        const res = [];
        const p = new Promise(async (resolve) => {
            const o = new Observable();
            o.promise("event").then(() => {
                res.push(1);
            });
            setTimeout(() => o.trigger("event"), 50);
            setTimeout(() => o.trigger("event"), 50);
            setTimeout(resolve, 100);
        });

        p.then(
            () => {
                assert.deepStrictEqual([1], res);
                done();
            }
        );
        
    });
})