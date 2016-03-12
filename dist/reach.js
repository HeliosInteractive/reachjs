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
    function base64ToBinary(base64) {
        var b, data = base64.replace(/data:image\/png;base64,/, "");
        try {
            b = b64toBlob(data, "image/png");
        } catch (e) {
            b = new Buffer(data);
        }
        return b;
    }
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || "", sliceSize = sliceSize || 512;
        for (var byteCharacters = atob(b64Data), byteArrays = [], offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            for (var slice = byteCharacters.slice(offset, offset + sliceSize), byteNumbers = new Array(slice.length), i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }
    function uuid() {
        var d = new Date().getTime();
        return window && window.performance && "function" == typeof window.performance.now && (d += performance.now()), 
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + 16 * Math.random()) % 16 | 0;
            return d = Math.floor(d / 16), ("x" === c ? r : 3 & r | 8).toString(16);
        });
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
    function formData(files) {
        var sBoundary = "---------------------------" + Date.now().toString(16), segments = [];
        if (files[0]) for (var i = 0; i < files.length; i++) segments[i] = 'Content-Disposition: form-data; name="file"; filename="' + files[i].path + '"\r\nContent-Type: ' + files[i].type + "\r\n\r\n", 
        segments[i] += files[i].data + "\r\n"; else segments = [ 'Content-Disposition: form-data; name="file"; filename="' + files.path + '"\r\nContent-Type: ' + files.type + "\r\n\r\n" + files.data + "\r\n" ];
        return {
            boundary: sBoundary,
            body: "--" + sBoundary + "\r\n" + segments.join("--" + sBoundary + "\r\n") + "--" + sBoundary + "--\r\n"
        };
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
    var image = {};
    "undefined" != typeof module && module.exports ? exports.image = module.exports = image : exports.image = image, 
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
    }, HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        value: function(callback, type, quality) {
            for (var binStr = atob(this.toDataURL(type, quality).split(",")[1]), len = binStr.length, arr = new Uint8Array(len), i = 0; len > i; i++) arr[i] = binStr.charCodeAt(i);
            callback(new Blob([ arr ], {
                type: type || "image/png"
            }));
        }
    }), image.fromCanvas = function(image, callback) {
        image.toBlob(function() {
            var filename = uuid() + ".png";
            callback(null, {
                name: filename,
                type: "image/png",
                data: image.toDataURL().replace(/data:image\/png;base64,/, "")
            });
        });
    }, image.fromImage = function(image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width, canvas.height = image.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        var filename = uuid() + ".png";
        return {
            name: filename,
            type: "image/png",
            data: base64ToBinary(canvas.toDataURL("image/png"))
        };
    }, image.fromFileInput = function(file, callback) {
        if ("undefined" == typeof FileReader) throw new Error("reach.image.fromFileInput not supported in node. If you are using node webkit make sure you are running in window context. Or, pass your own Buffer or array data to reach.upload");
        var reader = new FileReader();
        return reader.onload = function(event) {
            var filename = uuid() + ".png";
            callback(null, {
                name: filename,
                type: "image/png",
                data: event.target.result
            });
        }, reader.onerror = reader.onabort = callback, reader.readAsArrayBuffer(file), file;
    }, image.fromLocalPath = function(path, callback) {
        try {
            require("fs").readFile(path, function(err, data) {
                var extension = "." + path.split(".").pop(), filename = uuid() + extension;
                callback(err, data && {
                    name: filename,
                    type: image.supportedMimeTypes[extension],
                    data: data
                });
            });
        } catch (e) {
            throw new Error("reach.image.fromLocalPath only supported in node.");
        }
        return path;
    };
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
        self.oReq = new XMLHttpRequest(), uri += querystring(opts.qs), self.oReq.addEventListener("load", xhrResponse), 
        self.oReq.open(opts.method && opts.method.toUpperCase() || "GET", uri, !0);
        var data = null;
        if (opts.data) if (opts.headers && "multipart/form-data" === opts.headers["Content-Type"]) {
            var multipart = formData(opts.data);
            opts.headers["Content-Type"] += ", boundary=" + multipart.boundary, data = multipart.body;
        } else data = JSON.stringify(opts.data);
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
            host: parsed.host,
            protocol: parsed.protocol,
            path: parsed.path,
            headers: opts.headers,
            method: opts.method
        }, req = http.request(reqOptions, httpResponse).on("error", httpError);
        opts.data && req.write(JSON.stringify(opts.data)), req.end();
    };
    "undefined" != typeof module && module.exports ? exports.request = module.exports = http : exports.request = xhr;
    var request, image, DEVURL = "http://local.reach.com/api/", PRODURL = "http://reachstadiums.herokuapp.com/api/", _devel = !1, _url = PRODURL, reach = function(uri, options, callback) {
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