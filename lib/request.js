"use strict";

/**
 * Browser request
 * @param opts
 * @param callback
 */
var xhr = function(uri, opts, callback){

  var self = this;

  self.oReq = new XMLHttpRequest();

  uri += querystring(opts.qs);

  function xhrResponse(res){

    var response = {
      body : res.target.response,
      status : res.target.status,
      url : res.target.responseURL,
      headers : parseHeaders(self.oReq.getAllResponseHeaders())
    };
    try{
      var body = JSON.parse(res.target.response);
      response.body = body;
    }catch(e){}

    callback(null, response);
  }

  self.oReq.addEventListener("load", xhrResponse);
  self.oReq.open((opts.method && opts.method.toUpperCase()) || "GET", uri, true );

  var data = null;

  if( opts.data ){
    if( opts.headers && opts.headers["Content-Type"] === "multipart/form-data" ){
      var multipart = formData(opts.data);
      opts.headers["Content-Type"] += ", boundary=" + multipart.boundary;
      data = multipart.body;
    }
    else
      data = JSON.stringify(opts.data);
  }

  if( opts.headers && typeof opts.headers === "object" )
    Object.keys(opts.headers).forEach(self.setHeaders.bind(self, opts.headers));

  self.oReq.send(data);
};
/**
 * Convert keys of object to headers
 * @param headers
 * @param key
 */
xhr.prototype.setHeaders = function(headers, key){
  this.oReq.setRequestHeader(key, headers[key]);
};
/**
 * Format a query string
 * @param obj
 * @returns {*}
 */
function querystring(obj) {

  if( !obj ) return "";
  if( typeof obj === "string" ) return "?" + obj;

  function toParam(a, k){
    a.push( k + "=" + encodeURIComponent(obj[k]) );
    return a;
  }

  return "?" +
      Object.keys(obj)
          .reduce(toParam,[])
          .join("&");
}
/**
 * Split string headers into key -> value pairs
 * @param headers
 * @returns {*}
 */
function parseHeaders(headers){

  if( !headers ) return headers;

  var h = {};

  function foreachHeader(header){

    if( !header ) return;
    var a = header.split(":");
    h[a[0]] = a[1].trim();
  }

  headers
      .split("\r\n")
      .forEach(foreachHeader);

  return h;
}

/**
 * Node request
 * @param opts
 * @param callback
 */
var http = function(uri, opts, callback){

  var http = require("http"),
      url = require("url");

  uri += querystring(opts.qs);

  var parsed = url.parse(uri, true, true);
  var reqOptions = {
    host : parsed.host,
    protocol : parsed.protocol,
    path : parsed.path,
    headers: opts.headers,
    method : opts.method
  };

  function httpResponse(res){

    var response = {
      body : "",
      status : res.statusCode,
      url : uri,
      headers : res.headers
    };

    function onData(chunk){
      response.body += chunk;
    }

    function onEnd(){
      try{
        var body = JSON.parse(response.body);
        response.body = body;
      }catch(e){}
      callback(null, response);
    }

    res.setEncoding("utf8");
    res.on("data", onData);
    res.on("end", onEnd);
  }

  function httpError(err){
    callback(err);
  }

  var req = http.request(reqOptions, httpResponse)
      .on("error", httpError);

  if( opts.data )
    req.write(JSON.stringify(opts.data));

  req.end();
};

/**
 * Generate a form data string body from a file or array of files
 * @param {object|array} files
 * @param {string} files.type
 * @param {Blob} files.data
 * @returns {string}
 */
function formData(files) {

  var sBoundary = "---------------------------" + Date.now().toString(16);
  var segments = [];

  if(files[0]){
    for(var i = 0; i < files.length; i++){

      segments[i] = "Content-Disposition: form-data; name=\"file\"; filename=\"" + files[i].path + "\"\r\nContent-Type: " + files[i].type + "\r\n\r\n";
      segments[i] += files[i].data + "\r\n";
    }
  }else{
    segments = ["Content-Disposition: form-data; name=\"file\"; filename=\"" + files.path + "\"\r\nContent-Type: " + files.type + "\r\n\r\n" + files.data + "\r\n"];
  }

  return { boundary: sBoundary, body: "--" + sBoundary + "\r\n" + segments.join("--" + sBoundary + "\r\n") + "--" + sBoundary + "--\r\n" };
}

// export request for node or the browser
if( typeof module !== "undefined" && module.exports )
  exports.request = module.exports = http; // node
else
  exports.request = xhr;