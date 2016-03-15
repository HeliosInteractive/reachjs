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
    function uuid() {
        var d = new Date().getTime();
        return perf && (d += perf.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + 16 * Math.random()) % 16 | 0;
            return d = Math.floor(d / 16), ("x" === c ? r : 3 & r | 8).toString(16);
        });
    }
    function toBlobOrBuffer(canvas, type, callback) {
        var filename = uuid() + image.supportedMimeTypes[type];
        try {
            canvas.toBlob(function(blob) {
                callback(null, {
                    name: filename,
                    type: type,
                    data: blob
                });
            }, type);
        } catch (e) {
            setTimeout(function() {
                var regex = new RegExp("data:" + type + ";base64,"), buffer = new Buffer(canvas.toDataURL(type).replace(regex, ""), "base64");
                callback(null, {
                    name: filename,
                    type: type,
                    data: buffer
                });
            }, 1);
        }
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
    function getForm(data) {
        var FormData = require("form-data"), form = new FormData();
        return form.append("file", data.data, {
            filename: data.path,
            contentType: data.type,
            basename: !1
        }), form;
    }
    function formatData(options) {
        if ("POST" !== options.method && "PUT" !== options.method) return options;
        if (options.headers && "multipart/form-data" === options.headers["Content-Type"]) return options;
        var data = exports.merge(!0, options);
        return delete data.headers, delete data.uri, delete data.data, delete data.method, 
        options.data = data, options;
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
    function upload(path, data, callback) {
        data[0] ? data = data.map(function(obj) {
            return obj.path = path + obj.name, obj;
        }) : data.path = path + data.name, "/" === path.substr(0, 1) && (path = path.substr(1)), 
        reach("containers/reachdata/upload", {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            data: data
        }, callback);
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
    var image = {}, perf = !1;
    "undefined" != typeof module && module.exports ? exports.image = module.exports = image : exports.image = image;
    try {
        window && window.performance && "function" == typeof window.performance.now && (perf = window.performance);
    } catch (e) {}
    image.supportedMimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpg",
        ".jpeg": "image/jpg",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        "image/png": ".png",
        "image/jpg": ".jpg",
        "image/gif": ".gif",
        "video/mp4": ".mp4"
    };
    try {
        HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
            value: function(callback, type, quality) {
                for (var binStr = atob(this.toDataURL(type, quality).split(",")[1]), len = binStr.length, arr = new Uint8Array(len), i = 0; len > i; i++) arr[i] = binStr.charCodeAt(i);
                callback(new Blob([ arr ], {
                    type: type || "image/png"
                }));
            }
        });
    } catch (e) {}
    image.fromCanvas = function(canvas, type, callback) {
        "function" == typeof type && (callback = type, type = "image/png"), toBlobOrBuffer(canvas, type, callback);
    }, image.fromImage = function(img, callback) {
        var extension = "." + img.src.split(".").pop(), canvas = document.createElement("canvas");
        canvas.width = img.width, canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0), image.fromCanvas(canvas, image.supportedMimeTypes[extension], callback);
    }, image.fromFileInput = function(file, callback) {
        return image.fromBuffer(file, file.name, callback), file;
    }, image.fromLocalPath = function(path, callback) {
        try {
            require("fs").readFile(path, function(err, data) {
                image.fromBuffer(data, path, callback);
            });
        } catch (e) {
            throw new Error("reach.image.fromLocalPath only supported in node.");
        }
        return path;
    }, image.fromBuffer = function(buffer, path, callback) {
        setTimeout(function() {
            var extension = "." + path.split(".").pop();
            callback(null, buffer && {
                name: uuid() + extension,
                type: image.supportedMimeTypes[extension],
                data: buffer
            });
        }, 1);
    };
    var xhr = function(uri, opts, callback) {
        function xhrError(err) {
            callback(err);
        }
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
        self.oReq = new XMLHttpRequest(), uri += querystring(opts.qs), self.oReq.addEventListener("load", xhrResponse), 
        self.oReq.addEventListener("error", xhrError), self.oReq.open(opts.method && opts.method.toUpperCase() || "GET", uri, !0);
        var data = null;
        opts.data && (opts.headers && "multipart/form-data" === opts.headers["Content-Type"] ? (data = new FormData(), 
        data.append("file", opts.data.data, opts.data.path), delete opts.headers["Content-Type"]) : data = JSON.stringify(opts.data)), 
        opts.headers && "object" == typeof opts.headers && Object.keys(opts.headers).forEach(self.setHeaders.bind(self, opts.headers)), 
        self.oReq.send(data);
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
            host: parsed.hostname,
            protocol: parsed.protocol,
            port: parsed.port,
            path: parsed.path,
            headers: opts.headers,
            method: opts.method
        }, form = !1;
        opts.headers && "multipart/form-data" === opts.headers["Content-Type"] && (form = getForm(opts.data), 
        reqOptions.headers["Content-Type"] = form.getHeaders()["content-type"]);
        var req = http.request(reqOptions, httpResponse).on("error", httpError);
        form ? form.pipe(req) : opts.data && req.write(JSON.stringify(opts.data)), req.end();
    };
    "undefined" != typeof module && module.exports ? exports.request = module.exports = http : exports.request = xhr;
    var request, image, DEVURL = "http://192.168.248.2:3005/api/", PRODURL = "http://reachstadiums.herokuapp.com/api/", _devel = !1, _url = PRODURL, reach = function(uri, options, callback) {
        if ("undefined" == typeof uri) throw new Error("undefined is not a valid uri or options object.");
        if (!reach.key) throw new Error("reach.key is required");
        "function" == typeof options && (callback = options), "object" == typeof options ? options.uri = uri : options = "string" == typeof uri ? {
            uri: uri
        } : uri, "/" === options.uri.substr(0, 1) && (options.uri = options.uri.substr(1)), 
        options = formatData(options), uri = _url + options.uri, delete options.uri;
        var qs = filter({}, options);
        return qs && (options.qs = qs), !options.headers && (options.headers = {}), options.headers["X-Helios-ID"] = reach.key, 
        options.headers["Content-Type"] || (options.headers["Content-Type"] = "application/json"), 
        new request(uri, options, callback);
    };
    "undefined" != typeof module && module.exports ? module.exports = reach : global.reach = exports.reach = reach, 
    request = exports && exports.request ? exports.request : require("./lib/request"), 
    image = exports && exports.image ? exports.image : require("./lib/image"), exports && exports.merge || (exports.merge = require("./lib/merge")), 
    reach.development = function(val) {
        return val ? (_devel = !!val, void (_url = _devel ? DEVURL : PRODURL)) : _devel;
    }, reach.key = null, reach.get = verbFunc("GET"), reach.post = verbFunc("POST"), 
    reach.put = verbFunc("PUT"), reach.del = verbFunc("DELETE"), reach.request = request, 
    reach.image = image, reach.upload = upload, global["true"] = exports;
}({}, function() {
    return this;
}());