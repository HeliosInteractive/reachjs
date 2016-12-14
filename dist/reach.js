/*Reach Client v3.0.1*/
(function(factory) {
    
    // Establish the root object, window (self) in the browser, or global on the server.
    // We use self instead of window for WebWorker support.
    var root = (typeof self == 'object' && self.self === self && self) ||
        (typeof module == 'object' && module);

    // Set up reach appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
      define('reach', ['exports'], function(exports) {
        // Export global even in AMD case in case this script is loaded with
        // others that may still expect a global reach.
        root.reach = factory();
        // return reach for correct AMD use
        return root.reach;
      });

      // Next for Node.js or CommonJS.
    } else if (typeof exports !== 'undefined') {
        root.exports = factory();
      // Finally, as a browser global.
    } else {
      root.reach = factory();
    }

  })(function() {
  "use strict";

function formatData(options) {
    if ("POST" !== options.method && "PUT" !== options.method) return options;
    if (options.headers && "multipart/form-data" === options.headers["Content-Type"]) return options;
    var data = merge(!0, options);
    return delete data.headers, delete data.uri, delete data.data, delete data.method, 
    options.data = data, options;
}

function filter(filter, options) {
    options.where && (filter.where = options.where), options.limit && (filter.limit = options.limit), 
    options.include && (filter.include = options.include), options.skip && (filter.skip = options.skip), 
    options.fields && (filter.fields = options.fields), options.order && (filter.order = options.order);
    var qs = !1;
    if (Object.keys(filter).length > 0) try {
        qs = JSON.stringify(filter);
    } catch (e) {}
    return qs;
}

function verbFunc(method) {
    return function(uri, options, done) {
        return "function" == typeof options && (done = options, options = {}), "object" == typeof uri ? uri.method = method : options.method = method, 
        reach(uri, options, done);
    };
}

function upload(activationId, data, options, done) {
    "function" == typeof options && (done = options, options = {}), data[0] ? data = data.map(function(obj) {
        return obj.path = obj.name, obj;
    }) : data.path = data.name, reach("files/upload/" + activationId, {
        method: "POST",
        qs: {
            options: JSON.stringify(options)
        },
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: data
    }, done);
}

var merge = function() {
    "use_strict";
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
    var Public = function(clone) {
        return merge(clone === !0, !1, arguments);
    };
    return Public.recursive = function(clone) {
        return merge(clone === !0, !0, arguments);
    }, Public.clone = function(input) {
        var index, size, output = input, type = typeOf(input);
        if ("array" === type) for (output = [], size = input.length, index = 0; size > index; ++index) output[index] = Public.clone(input[index]); else if ("object" === type) {
            output = {};
            for (index in input) output[index] = Public.clone(input[index]);
        }
        return output;
    }, Public;
}(), image = function() {
    function uuid() {
        var d = new Date().getTime();
        return perf && (d += perf.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + 16 * Math.random()) % 16 | 0;
            return d = Math.floor(d / 16), ("x" === c ? r : 3 & r | 8).toString(16);
        });
    }
    function toBlobOrBuffer(canvas, options, done) {
        var filename = uuid() + image.supportedMimeTypes[options.type];
        try {
            canvas.toBlob(function(blob) {
                done(null, {
                    name: filename,
                    type: options.type,
                    data: blob
                });
            }, options.type, options.quality);
        } catch (e) {
            setTimeout(function() {
                var regex = new RegExp("data:" + options.type + ";base64,"), buffer = new Buffer(canvas.toDataURL(options.type, options.quality).replace(regex, ""), "base64");
                done(null, {
                    name: filename,
                    type: options.type,
                    data: buffer
                });
            }, 1);
        }
    }
    var image = {}, perf = !1;
    try {
        window && window.performance && "function" == typeof window.performance.now && (perf = window.performance);
    } catch (e) {}
    image.supportedMimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/gif": ".gif",
        "video/mp4": ".mp4"
    };
    try {
        HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
            value: function(done, type, quality) {
                for (var binStr = atob(this.toDataURL(type, quality).split(",")[1]), len = binStr.length, arr = new Uint8Array(len), i = 0; len > i; i++) arr[i] = binStr.charCodeAt(i);
                done(new Blob([ arr ], {
                    type: type || "image/png"
                }));
            }
        });
    } catch (e) {}
    return image.fromCanvas = function(canvas, options, done) {
        "function" == typeof options && (done = options, options = "image/png"), "string" == typeof options && (options = {
            type: options,
            quality: 1
        }), options.type || (options.type = "image/png"), options.quality || (options.quality = 1), 
        toBlobOrBuffer(canvas, options, done);
    }, image.fromImage = function(img, options, done) {
        var extension = "." + img.src.split(".").pop();
        "function" == typeof options && (done = options, options = {
            type: image.supportedMimeTypes[extension],
            quality: 1
        }), "string" == typeof options && (options = {
            type: options,
            quality: 1
        });
        var canvas = document.createElement("canvas");
        canvas.width = img.width, canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0), image.fromCanvas(canvas, options, done);
    }, image.fromFileInput = function(file, done) {
        return image.fromBuffer(file, file.name, done), file;
    }, image.fromLocalPath = function(path, done) {
        try {
            require("fs").readFile(path, function(err, data) {
                image.fromBuffer(data, path, done);
            });
        } catch (e) {
            throw new Error("reach.image.fromLocalPath only supported in node.");
        }
        return path;
    }, image.fromBuffer = function(buffer, path, done) {
        setTimeout(function() {
            var extension = "." + path.split(".").pop();
            done(null, buffer && {
                name: uuid() + extension,
                type: image.supportedMimeTypes[extension],
                data: buffer
            });
        }, 1);
    }, image;
}(), request = function() {
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
    var xhr = function(uri, opts, done) {
        function xhrError(err) {
            done(err);
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
            done(null, response);
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
    var http = function(uri, opts, done) {
        function httpResponse(res) {
            function onData(chunk) {
                response.body += chunk;
            }
            function onEnd() {
                try {
                    var body = JSON.parse(response.body);
                    response.body = body;
                } catch (e) {}
                done(null, response);
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
            done(err);
        }
        var url = require("url");
        uri += querystring(opts.qs);
        var parsed = url.parse(uri, !0, !0), http = require("https:" === parsed.protocol ? "https" : "http"), reqOptions = {
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
    return "undefined" != typeof XMLHttpRequest ? xhr : http;
}(), request, image, _url, reach = function(uri, options, done) {
    if (!_url) throw new Error("set the url for reach with reachjs.setUrl('')");
    if ("undefined" == typeof uri) throw new Error("undefined is not a valid uri or options object.");
    if (!reach.key && options.qs && !options.qs.access_token) throw new Error("reach.key or token is required");
    "function" == typeof options && (done = options), "object" == typeof options ? options.uri = uri : options = "string" == typeof uri ? {
        uri: uri
    } : uri, "/" === options.uri.substr(0, 1) && (options.uri = options.uri.substr(1)), 
    options = formatData(options), uri = _url + options.uri, delete options.uri;
    var qs = filter({}, options);
    return options.qs || (options.qs = {}), qs && (options.qs.filter = qs), !options.headers && (options.headers = {}), 
    reach.key && !options.headers["X-Helios-ID"] && (options.headers["X-Helios-ID"] = reach.key), 
    options.headers["Content-Type"] || (options.headers["Content-Type"] = "application/json"), 
    new request(uri, options, done);
};

reach.key = null, reach.get = verbFunc("GET"), reach.post = verbFunc("POST"), reach.put = verbFunc("PUT"), 
reach.del = verbFunc("DELETE"), reach.request = request, reach.image = image, reach.upload = upload, 
reach.development = function() {
    console.error("reach.development is no longer supported. Set the url explicitly with reach.setUrl()");
}, reach.setUrl = function(pUrl) {
    "/" !== pUrl.substr(-1) && (pUrl += "/"), "api/" !== pUrl.substr(-4) && (pUrl += "api/"), 
    pUrl && (_url = pUrl);
};
    return reach;
  });