const o1 = new Observable;
const o2 = new Observable;

o2.relayEvent(o1, "some-event");
o2.on("some-event", function(){
    console.log("OK!");
});
o1.trigger("some-event"); // OK!


o2.relayEvent(o1, "another-event", "local-name");
o2.on("local-name", function(){
    console.log("OK!");
});
o1.trigger("another-event"); // OK!
