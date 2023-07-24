const o = new Observable;
o.promise("event").then(payload => console.log(payload));
o.trigger("event", { data: "hello world" });