

module.exports = {

    listenerFactory: function(mode, log) {
        if (mode == "log-id") {
            return function(id) {
                return function() {
                    log.push(id);
                };
            };
        }
        else if (mode == "log-arg") {
            return function(id) {
                return function() {
                    log.push(arg);
                };
            };
        }
        else if (mode == "log-id-arg") {
            return function(id) {
                return function(arg) {
                    log.push([id, arg]);
                };
            };
        }
    },

    getPromise: function(resolveValue) {
        return new Promise(function(resolve, reject){
            resolve(resolveValue);
        });
    }
};