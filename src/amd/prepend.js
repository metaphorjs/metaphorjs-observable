
var Promise;

try {
    Promise = require("metaphorjs-promise");
}
catch (thrownErr) {
    Promise = null;
}