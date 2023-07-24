const o = new Observable;
o.createEvent("filtered", {triggerFilter: (l, args) => {
    if (l.always) {
        return true;
    }
    if (l.param == args[0]) {
        return true;
    }
    return false;
}});

o.on("filtered", function(){
    console.log("always")
}, null, {
    always: true
});

o.on("filtered", function(){
    console.log("param");
}, null, {
    param: 1
});


o.trigger("filtered", 2); // "always"
o.trigger("filtered", 1); // "always", "param"