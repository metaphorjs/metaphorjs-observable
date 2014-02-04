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

	var listeners 	= [],
		hash 		= randomHash(),
		suspended	= false,
		lid			= 0,
		self 		= this,
		inaction	= false,
		toRemove	= [],
        returnRes   = returnResult || false;

	extend(self, {

		destroy: function() {
			listeners 	= null;
			hash 		= null;
			suspended 	= null;
			lid 		= null;
			self 		= null;
			name 		= null;
			inaction	= null;
			toRemove	= null;
		},


		/**
		 * {object options
		 * 		boolean first #put the listener ahead of other listeners. Defaults to false.
		 * 		boolean single #trigger this listener only one. Defaults to false.
		 * 		integer limit #how many times it is allowed to trigger. 0 - unlimited (default)
		 * 		integer start #starting from which attempt it is allowed to trigger. Defaults to 1
		 * }
		 */
		addListener: function(fn, scope, options) {

            scope = scope || self;

			if (scope[name+"_"+hash]) return;

			options = options || {};

			var id 	= ++lid,
				first 	= options.first || false;

			scope[name+"_"+hash] = id;


			var e = {
				fn: fn,
				scope: scope,
				id: id,
				called: 0, // how many times the function was triggered
				limit: options.limit ? options.limit :
						(options.single ? 1 : 0), // how many times the function is allowed to trigger
				start: options.start || 1, // from which attempt it is allowed to trigger the function
				count: 0 // how many attempts to trigger the function was made
			};

			if (first) {
				listeners.unshift(e);
			}
			else {
				listeners.push(e);
			}

			return hash;
		},

		removeListener: function(fn, scope) {

			var inx = -1;

            scope = scope || self;

            var id = scope[name+"_"+hash];

			if (!id) return;

			if (inaction) {
				toRemove.push({fn: fn, scope: scope});
				return;
			}

			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i].id == id) {
					inx = i;
					delete listeners[i].scope[name+"_"+hash];
					break;
				}
			}

			if (inx == -1) return;

			listeners.splice(inx, 1);
		},

        deferredRemove: function() {
            if (toRemove && toRemove.length) {
                for (var i = 0, len = toRemove.length; i < len; i++) {
                    self.removeListener(toRemove[i].fn, toRemove[i].scope);
                }
                toRemove = [];
            }
        },

        hasListener: function() {
            return listeners.length > 0 ? listeners.length : false;
        },

        getListeners: function() {
            return listeners;
        },

		clear: function() {
			for (var i = 0, len = listeners.length; i < len; i++) {
				delete listeners[i].scope[name+"_"+hash];
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

			if (suspended) return;
			if (listeners.length == 0) return;

			inaction	= true;

			var res 	= null;

			for (var i = 0, len = listeners.length; i < len; i++) {

				var l = listeners[i];

				l.count++;

				if (l.count < l.start) continue;

				res = l.fn.apply(l.scope, arguments);

				l.called++;

				if (l.called == l.limit) toRemove.push(l);

                if (res === false) {
                    break;
                }

                if (returnResult && res) {
                    self.deferredRemove();
                    return res;
                }
			}

			inaction	= false;

			self.deferredRemove();

            if (returnResult) {
                return null;
            }

			if (res === false) {
                return false;
            }
		}
	});

	return {
		addListener: self.addListener,
		removeListener: self.removeListener,
		suspend: self.suspend,
		resume: self.resume,
		trigger: self.trigger,
		clear: self.clear,
		destroy: self.destroy,
        hasListener: self.hasListener,
        getListeners: self.getListeners
	};
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

        create: function(name, returnResult) {
            name = name.toLowerCase();
            if (!events[name]) {
                events[name] = new event(name, returnResult);
            }
        },

		on: function(name, fn, scope, options) {
			name = name.toLowerCase();
			if (!events[name]) {
				events[name] = new event(name);
			}
			return events[name].addListener(fn, scope, options);
		},

		un: function(name, fn, scope) {
			name = name.toLowerCase();
			if (!events[name]) return;
			events[name].removeListener(fn, scope);
		},

        getEventListeners: function(name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return null;
            }
            return events[name].getListeners();
        },

        hasListener: function(name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener();
        },

		removeAllListeners: function(name) {
			if (!events[name]) return;
			events[name].clear();
		},

		trigger: function() {

			var a = [],
				name = arguments[0];

			name = name.toLowerCase();

			if (!events[name]) return;

			for (var i = 1, len = arguments.length; i < len; i++) {
				a.push(arguments[i]);
			}

			var e = events[name];
			return e.trigger.apply(e, a);
		},

		suspendEvent: function(name) {
			name = name.toLowerCase();
			if (!events[name]) return;
			events[name].suspend();
		},

		suspendAllEvents: function() {

			for (var name in events)
				events[name].suspend();
		},

		resumeEvent: function(name) {
			name = name.toLowerCase();
			if (!events[name]) return;
			events[name].resume();
		},

		resumeAllEvents: function() {

			for (var name in events)
				events[name].resume();
		},

		getPublicApi: function() {
			return {
				on: self.on,
				un: self.un
			};
		},

		getApi: function() {
			return {
				on: self.on,
				un: self.un,
                createEvent: self.create,
				trigger: self.trigger,
				suspendEvent: self.suspendEvent,
				suspendAllEvents: self.suspendAllEvents,
				resumeEvent: self.resumeEvent,
				resumeAllEvents: self.resumeAllEvents,
				removeAllListeners: self.removeAllListeners,
				destroy: self.destroy,
				getApi: self.getPublicApi,
                hasListener: self.hasListener,
                getMixinApi: self.getMixinApi
			};
		},

        getMixinApi: function() {
            return {
                on: self.on,
                un: self.un,
                createEvent: self.create,
                trigger: self.trigger,
                getEventListeners: self.getEventListeners,
                suspendEvent: self.suspendEvent,
                suspendAllEvents: self.suspendAllEvents,
                resumeEvent: self.resumeEvent,
                resumeAllEvents: self.resumeAllEvents,
                removeAllListeners: self.removeAllListeners,
                hasListener: self.hasListener
            };
        }
	});

	// at first, we return the full api
	return self.getApi();
	// after that you can extend your object:
	// var observable = new observable();
	// $.extend(myObj, observable.getApi());
	// observable.destroy is callable
	// but myObj.destroy is not (if wasn't set before)
};

window['observable'] = observable;

})();
