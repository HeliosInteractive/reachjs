var request = (function(){// jshint ignore:line

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

    function xhrError(err){
      //TODO: standardize error format
      callback(err);
    }

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
    self.oReq.addEventListener("error", xhrError);
    self.oReq.open((opts.method && opts.method.toUpperCase()) || "GET", uri, true );

    var data = null;

    if( opts.data ){
      if( opts.headers && opts.headers["Content-Type"] === "multipart/form-data" ){
        data = new FormData();
        data.append("file", opts.data.data, opts.data.path);
        delete opts.headers["Content-Type"];
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

    var url = require("url");

    uri += querystring(opts.qs);
    var parsed = url.parse(uri, true, true);
    var http = require(parsed.protocol === "https:" ? "https" : "http");

    var reqOptions = {
      host : parsed.hostname,
      protocol : parsed.protocol,
      port : parsed.port,
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
      //TODO: coerce error to starndard format
      callback(err);
    }

    var form = false;
    if( opts.headers && opts.headers["Content-Type"] === "multipart/form-data" ) {
      form = getForm(opts.data);
      reqOptions.headers["Content-Type"] = form.getHeaders()["content-type"];
    }

    var req = http.request(reqOptions, httpResponse)
        .on("error", httpError);

    if( form )
      form.pipe(req);

    else if( opts.data )
      req.write(JSON.stringify(opts.data));

    req.end();
  };
  /**
   * Create formdata for node
   * @param data
   * @returns {FormData|exports|module.exports}
   */
  function getForm(data){

    var FormData = require("form-data");
    var form = new FormData();
    form.append("file", data.data, {
      filename: data.path,
      contentType: data.type,
      basename: false
    });
    return form;
  }
  if(typeof XMLHttpRequest !== "undefined") // browser
    return xhr;

  return http;
})();
