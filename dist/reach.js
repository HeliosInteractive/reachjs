/*Reach Client v0.9.0*/
!function(exports, global) {
    "use strict";
    function merge_recursive(base, extend) {
        if ("object" !== typeOf(base)) return extend;
        for (var key in extend) "object" === typeOf(base[key]) && "object" === typeOf(extend[key]) ? base[key] = merge_recursive(base[key], extend[key]) : base[key] = extend[key];
        return base;
    }
    function merge(clone, recursive, argv) {
        var result = argv[0], size = argv.length;
        (clone || "object" !== typeOf(result)) && (result = {});
        for (var index = 0; size > index; ++index) {
            var item = argv[index], type = typeOf(item);
            if ("object" === type) for (var key in item) {
                var sitem = clone ? Public.clone(item[key]) : item[key];
                recursive ? result[key] = merge_recursive(result[key], sitem) : result[key] = sitem;
            }
        }
        return result;
    }
    function typeOf(input) {
        return {}.toString.call(input).slice(8, -1).toLowerCase();
    }
    function querystring(obj) {
        function toParam(a, k) {
            return a.push(k + "=" + encodeURIComponent(obj[k])), a;
        }
        return obj ? "string" == typeof obj ? "?" + obj : "?" + Object.keys(obj).reduce(toParam, []).join("&") : "";
    }
    function parseHeaders(headers) {
        function foreachHeader(header) {
            if (header) {
                var a = header.split(":");
                h[a[0]] = a[1].trim();
            }
        }
        if (!headers) return headers;
        var h = {};
        return headers.split("\r\n").forEach(foreachHeader), h;
    }
    function filter(filter, options) {
        options.where && (filter.where = options.where), options.limit && (filter.limit = options.limit), 
        options.include && (filter.include = options.include), options.skip && (filter.skip = options.skip), 
        options.fields && (filter.fields = options.fields);
        var qs = !1;
        if (Object.keys(filter).length > 0) try {
            qs = JSON.stringify(filter), qs = "filter=" + qs;
        } catch (e) {}
        return qs;
    }
    function verbFunc(method) {
        return function(uri, options, callback) {
            return "object" == typeof options ? options.method = method : "object" == typeof uri && (uri.method = method), 
            reach(uri, options, callback);
        };
    }
    var Public = function(clone) {
        return merge(clone === !0, !1, arguments);
    };
    Public.recursive = function(clone) {
        return merge(clone === !0, !0, arguments);
    }, Public.clone = function(input) {
        var index, size, output = input, type = typeOf(input);
        if ("array" === type) for (output = [], size = input.length, index = 0; size > index; ++index) output[index] = Public.clone(input[index]); else if ("object" === type) {
            output = {};
            for (index in input) output[index] = Public.clone(input[index]);
        }
        return output;
    }, "undefined" != typeof module && module.exports ? module.exports = Public : exports.merge = Public;
    var xhr = function(uri, opts, callback) {
        function xhrResponse(res) {
            var response = {
                body: res.target.response,
                status: res.target.status,
                url: res.target.responseURL,
                headers: parseHeaders(self.oReq.getAllResponseHeaders())
            };
            try {
                var body = JSON.parse(res.target.response);
                response.body = body;
            } catch (e) {}
            callback(null, response);
        }
        var self = this;
        return self.oReq = new XMLHttpRequest(), uri += querystring(opts.qs), self.oReq.addEventListener("load", xhrResponse), 
        self.oReq.open(opts.method && opts.method.toUpperCase() || "GET", uri), opts.headers && "object" == typeof opts.headers && Object.keys(opts.headers).forEach(self.setHeaders.bind(self, opts.headers)), 
        opts.data ? self.oReq.send(JSON.stringify(opts.data)) : void self.oReq.send();
    };
    xhr.prototype.setHeaders = function(headers, key) {
        this.oReq.setRequestHeader(key, headers[key]);
    };
    var http = function(uri, opts, callback) {
        function httpResponse(res) {
            function onData(chunk) {
                response.body += chunk;
            }
            function onEnd() {
                try {
                    var body = JSON.parse(response.body);
                    response.body = body;
                } catch (e) {}
                callback(null, response);
            }
            var response = {
                body: "",
                status: res.statusCode,
                url: uri,
                headers: res.headers
            };
            res.setEncoding("utf8"), res.on("data", onData), res.on("end", onEnd);
        }
        function httpError(err) {
            callback(err);
        }
        var http = require("http"), url = require("url");
        uri += querystring(opts.qs);
        var parsed = url.parse(uri, !0, !0), reqOptions = {
            host: parsed.host,
            protocol: parsed.protocol,
            path: parsed.path,
            headers: opts.headers,
            method: opts.method
        }, req = http.request(reqOptions, httpResponse).on("error", httpError);
        opts.data && req.write(JSON.stringify(opts.data)), req.end();
    };
    "undefined" != typeof module && module.exports ? exports.request = module.exports = http : exports.request = xhr;
    var request, DEVURL = "http://reachstaging.herokuapp.com/api/", PRODURL = "http://reachstadiums.herokuapp.com/api/", _devel = !1, _url = PRODURL, reach = function(uri, options, callback) {
        if ("undefined" == typeof uri) throw new Error("undefined is not a valid uri or options object.");
        if (!reach.key) throw new Error("reach.key is required");
        if ("function" == typeof options && (callback = options), "object" == typeof options ? options.uri = uri : options = "string" == typeof uri ? {
            uri: uri
        } : uri, "/" === options.uri.substr(0, 1) && (options.uri = options.uri.substr(1)), 
        "POST" === options.method || "PUT" === options.method) {
            var data = exports.merge(!0, options);
            delete data.headers, delete data.uri, delete data.data, delete data.method, options.data = data;
        }
        uri = _url + options.uri, delete options.uri;
        var qs = filter({}, options);
        return qs && (options.qs = qs), !options.headers && (options.headers = {}), options.headers["X-Helios-ID"] = reach.key, 
        options.headers["Content-Type"] = "application/json", new request(uri, options, callback);
    };
    "undefined" != typeof module && module.exports ? module.exports = reach : global.reach = exports.reach = reach, 
    request = exports && exports.request ? exports.request : require("./lib/request"), 
    exports && exports.merge || (exports.merge = require("./lib/merge")), reach.request = request, 
    reach.development = function(val) {
        return val ? (_devel = !!val, void (_url = _devel ? DEVURL : PRODURL)) : _devel;
    }, reach.key = null, reach.get = verbFunc("GET"), reach.post = verbFunc("POST"), 
    reach.put = verbFunc("PUT"), reach.del = verbFunc("DELETE"), global["true"] = exports;
}({}, function() {
    return this;
}());