/**
 * @author johann kuindji (kuindji@gmail.com)
 */

(function(){

var randomHash = function() {

	var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
		hash = '';

	for(var i = 0; i < 10; i++) {
		var x = Math.floor(Math.random() * 52);
		hash += chars.charAt(x);
	}

	return hash;
};

var extend = function(trg, src) {
	for (var i in src) {
		trg[i] = src[i];
	}
};

var event = function(name, returnResult) {

	var listeners 	    = [],
		hash 		    = randomHash(),
		suspended	    = false,
		lid			    = 0,
		self 		    = this,
        returnResult    = returnResult || false; // first|last|all

	extend(self, {

		destroy: function() {
			listeners 	= null;
			hash 		= null;
			suspended 	= null;
			lid 		= null;
			self 		= null;
			name 		= null;
		},


		on: function(fn, scope, options) {

            scope       = scope || fn;
            options     = options || {};

            var uni     = name+"_"+hash;

			if (scope[uni]) {
                return;
            }

			var id 	    = ++lid,
				first 	= options.first || false;

			scope[uni]  = id;


			var e = {
				fn:         fn,
				scope:      scope,
				id:         id,
				called:     0, // how many times the function was triggered
				limit:      options.limit ? options.limit :
						        (options.once ? 1 : 0), // how many times the function is allowed to trigger
				start:      options.start || 1, // from which attempt it is allowed to trigger the function
				count:      0 // how many attempts to trigger the function was made
			};

			if (first) {
				listeners.unshift(e);
			}
			else {
				listeners.push(e);
			}

			return id;
		},

		un: function(fn, scope) {

			var inx     = -1,
                uni     = name+"_"+hash,
                id;

            if (fn == parseInt(fn)) {
                id      = fn;
            }
            else {
                scope   = scope || fn;
                id      = scope[uni];
            }

			if (!id) {
                return false;
            }

			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i].id == id) {
					inx = i;
					delete listeners[i].scope[uni];
					break;
				}
			}

			if (inx == -1) {
                return false;
            }

			listeners.splice(inx, 1);
            return true;
		},

        hasListener: function(fn, scope) {

            if (fn) {

                scope   = scope || fn;
                var id,
                    uni     = name+"_"+hash;

                if (fn == parseInt(fn)) {
                    id  = fn;
                }
                else {
                    id  = scope[uni];
                }

                if (!id) {
                    return false;
                }

                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].id == id) {
                        return true;
                    }
                }

                return false;
            }
            else {
                return listeners.length > 0 ? listeners.length : false;
            }
        },

		removeAllListeners: function() {
            var uni = name+"_"+hash;
			for (var i = 0, len = listeners.length; i < len; i++) {
				delete listeners[i].scope[uni];
			}
			listeners = [];
		},

		suspend: function() {
			suspended = true;
		},

		resume: function() {
			suspended = false;
		},

		trigger: function() {

			if (suspended || listeners.length == 0) {
                return;
            }

			var ret 	= returnResult == "all" ? [] : null,
                res;

			for (var i = 0, len = listeners.length; i < len; i++) {

				var l = listeners[i];

				l.count++;

				if (l.count < l.start) {
                    continue;
                }

				res = l.fn.apply(l.scope, arguments);

				l.called++;

				if (l.called == l.limit) {
                    self.removeListener(l.id);
                }

                if (returnResult == "all") {
                    ret.push(res);
                }

                if (returnResult == "first" && res) {
                    return res;
                }

                if (returnResult == "last" && res) {
                    ret = res;
                }

                if (returnResult == false && res === false) {
                    break;
                }
			}

            if (returnResult) {
                return ret;
            }
		}
	});

	return self;
};


var observable = function() {

	var self = this,
		events	= {};

	extend(self, {

		destroy: function() {
			for (var i in events) {
				events[i].destroy();
			}

			events 	= null;
			self	= null;
		},

        createEvent: function(name, returnResult) {
            name = name.toLowerCase();
            if (!events[name]) {
                events[name] = new event(name, returnResult);
            }
            return events[name];
        },

        getEvent: function(name) {
            name = name.toLowerCase();
            return events[name];
        },

		on: function(name, fn, scope, options) {
			name = name.toLowerCase();
			if (!events[name]) {
				events[name] = new event(name);
			}
			return events[name].on(fn, scope, options);
		},

        once: function(name, fn, scope, options) {
            options     = options || {};
            options.limit = 1;
            return self.on(name, fn, scope, options);
        },


		un: function(name, fn, scope) {
			name = name.toLowerCase();
			if (!events[name]) {
                return;
            }
			events[name].un(fn, scope);
		},

        hasListener: function(name, fn, scope) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, scope);
        },

		removeAllListeners: function(name) {
			if (!events[name]) {
                return;
            }
			events[name].removeAllListeners();
		},

		trigger: function() {

			var a = [],
				name = arguments[0];

			name = name.toLowerCase();

			if (!events[name]) {
                return;
            }

			for (var i = 1, len = arguments.length; i < len; i++) {
				a.push(arguments[i]);
			}

			var e = events[name];
			return e.trigger.apply(e, a);
		},

		suspendEvent: function(name) {
			name = name.toLowerCase();
			if (!events[name]) {
                return;
            }
			events[name].suspend();
		},

		suspendAllEvents: function() {
			for (var name in events) {
				events[name].suspend();
            }
		},

		resumeEvent: function(name) {
			name = name.toLowerCase();
			if (!events[name]) {
                return;
            }
			events[name].resume();
		},

		resumeAllEvents: function() {

			for (var name in events) {
				events[name].resume();
            }
		}
	});

	return self;
};

window['observable'] = observable;

})();
