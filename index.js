"use strict";

var DEVURL = "http://reachstaging.herokuapp.com/api/";
var PRODURL = "http://reachstadiums.herokuapp.com/api/";

var request;
var _devel = false;
var _url = PRODURL;
/**
 * Make HTTP requests to reach
 * @param {string|options} uri
 * @param {object|function} options
 * @param {string} options.uri
 * @param {object} options.headers
 * @param {string} options.qs
 * @callback callback
 * @returns {*}
 */
var reach = function(uri, options, callback) {

  if (typeof uri === "undefined")
    throw new Error("undefined is not a valid uri or options object.");

  if( !reach.key )
    throw new Error("reach.key is required");

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

  if( options.method === "POST" || options.method === "PUT" ) {
    var data = exports.merge(true,options);
    delete data.headers;
    delete data.uri;
    delete data.data;
    delete data.method;
    options.data = data;
  }

  uri = _url + options.uri;
  delete options.uri;

  var qs = filter({}, options);
  if( qs ) options.qs = qs;

  !options.headers && (options.headers = {});
  options.headers["X-Helios-ID"] = reach.key;
  options.headers["Content-Type"] = "application/json";

  return new request(uri, options, callback);
};
/**
 * Turn options arguments into loopback filter string
 * @param filter
 * @param options
 * @returns {boolean}
 */
function filter(filter, options){

  if(options.where) filter.where = options.where;
  if(options.limit) filter.limit = options.limit;
  if(options.include) filter.include = options.include;
  if(options.skip) filter.skip = options.skip;
  if(options.fields) filter.fields = options.fields;

  var qs = false;
  // the options are just a query filter
  if(Object.keys(filter).length > 0){
    try{
      qs = JSON.stringify(filter);
      qs = "filter=" + qs;
    }catch(e){}
  }
  return qs;
}
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
if( !exports || !exports.merge )
  exports.merge = require("./lib/merge");

reach.request = request;
/**
 * Get environment or
 * Set reach into development or production mode
 * @param {boolean} val
 * @returns {boolean}
 */
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

reach.upload = function(path, data){

}