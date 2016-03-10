/*Reach Client v0.9.0*/
!function(exports, global) {
    "use strict";
    function verbFunc(method) {
        return function(uri, options, callback) {
            return "object" == typeof options ? options.method = method : "object" == typeof uri && (uri.method = method), 
            reach(uri, options, callback);
        };
    }
    var xhr = function(opts, callback) {
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", function(res) {
            callback(null, res);
        }), oReq.open(opts.method && opts.method.toUpperCase() || "GET", "http://local.reach.com/ping"), 
        oReq.send();
    }, http = function(opts, callback) {
        var http = require("http");
        http.get("http://0.0.0.0:3005/ping", function(res) {
            callback(null, res);
        }).on("error", callback);
    };
    "undefined" != typeof module && module.exports ? exports.request = module.exports = http : exports.request = xhr;
    var request, DEVURL = "http://reachstaging.herokuapp.com/api/", PRODURL = "http://reachstadiums.herokuapp.com/api/", _devel = !1, _url = PRODURL, reach = function(uri, options, callback) {
        if ("undefined" == typeof uri) throw new Error("undefined is not a valid uri or options object.");
        return "function" == typeof options && (callback = options), "object" == typeof options ? options.uri = uri : options = "string" == typeof uri ? {
            uri: uri
        } : uri, "/" === options.uri.substr(0, 1) && (options.uri = options.uri.substr(1)), 
        options.uri = _url + options.uri, new request(options, callback);
    };
    "undefined" != typeof module && module.exports ? module.exports = reach : global.reach = exports.reach = reach, 
    request = exports && exports.request ? exports.request : require("./lib/request"), 
    reach.request = request, reach.development = function(val) {
        return val ? (_devel = !!val, void (_url = _devel ? DEVURL : PRODURL)) : _devel;
    }, reach.key = null, reach.get = verbFunc("GET"), reach.post = verbFunc("POST"), 
    reach.put = verbFunc("PUT"), reach.del = verbFunc("DELETE"), global["true"] = exports;
}({}, function() {
    return this;
}());