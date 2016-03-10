"use strict";

/**
 * Browser request
 * @param opts
 * @param callback
 */
var xhr = function(opts, callback){

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(res){

    callback(null, res);
  });
  oReq.open((opts.method && opts.method.toUpperCase()) || "GET", "http://local.reach.com/ping");
  oReq.send();

};
/**
 * Node request
 * @param opts
 * @param callback
 */
var http = function(opts, callback){

  var http = require("http");

  http.get("http://0.0.0.0:3005/ping", function(res){
    callback(null, res);
    //res.resume();
  }).on("error", callback);

};

// export request for node or the browser
if( typeof module !== "undefined" && module.exports ) {
  exports.request = module.exports = http; // node
}else{
  exports.request = xhr;
}