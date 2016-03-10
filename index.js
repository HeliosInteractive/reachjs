"use strict";

var DEVURL = "http://reachstaging.herokuapp.com/api/";
var PRODURL = "http://reachstadiums.herokuapp.com/api/";

var request;
var _devel = false;
var _url = PRODURL;
/**
 * Make HTTP requests to reach
 * @param uri
 * @param options
 * @param callback
 * @returns {*}
 */
var reach = function(uri, options, callback) {

  if (typeof uri === "undefined")
    throw new Error("undefined is not a valid uri or options object.");

  if( typeof options === "function" )
    callback = options;

  if (typeof options === "object")
    options.uri = uri;
  else if (typeof uri === "string")
    options = {uri : uri};
  else
    options = uri;

  if( options.uri.substr(0, 1) === "/" )
    options.uri = options.uri.substr(1);

  options.uri = _url + options.uri;

  return new request(options, callback);
};
/**
 * Shortcut methods for HTTP verbs
 * @param verb
 * @returns {Function}
 */
function verbFunc (method) {

  return function (uri, options, callback) {

    if( typeof options === "object" )
      options.method = method;
    else if( typeof uri === "object" )
      uri.method = method;

    return reach(uri, options, callback);
  };
}

if( typeof module !== "undefined" && module.exports )
  module.exports = reach; // node
else
  global.reach = exports.reach = reach;

request = ( exports && exports.request ) ? exports.request : require("./lib/request");

reach.request = request;
reach.development = function(val){
  if(!val) return _devel;
  _devel = !!val;

  _url = _devel ? DEVURL : PRODURL;

};
reach.key = null;
reach.get = verbFunc("GET");
reach.post = verbFunc("POST");
reach.put = verbFunc("PUT");
reach.del = verbFunc("DELETE");