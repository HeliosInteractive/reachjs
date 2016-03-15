"use strict";

//var DEVURL = "http://reachstaging.herokuapp.com/api/";
var DEVURL = "http://192.168.248.2:3005/api/";
var PRODURL = "http://reachstadiums.herokuapp.com/api/";

var request, image;
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

  options = formatData(options);

  uri = _url + options.uri;
  delete options.uri;

  var qs = filter({}, options);
  if( qs ) options.qs = qs;

  !options.headers && (options.headers = {});
  options.headers["X-Helios-ID"] = reach.key;

  if( !options.headers["Content-Type"] )
    options.headers["Content-Type"] = "application/json";

  return new request(uri, options, callback);
};
/**
 * Format request options data
 * @param options
 * @returns {*}
 */
function formatData(options){

  if( options.method !== "POST" && options.method !== "PUT" )
    return options;

  if( options.headers && options.headers["Content-Type"] === "multipart/form-data")
    return options;

  var data = exports.merge(true,options);
  delete data.headers;
  delete data.uri;
  delete data.data;
  delete data.method;
  options.data = data;

  return options;
}
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
image = ( exports && exports.image ) ? exports.image : require("./lib/image");
if( !exports || !exports.merge )
  exports.merge = require("./lib/merge");

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
reach.request = request;
reach.image = image;
reach.upload = upload;


function upload(path, data, callback){

  if( data[0] )
    data = data.map(function(obj){
      obj.path = path + obj.name;
      return obj;
    });
  else
    data.path = path + data.name;

  // image - canvas, <img/>, <input/>
  if( path.substr(0, 1) === "/" )
    path = path.substr(1);

  reach("containers/reachdata/upload", {
    method : "POST",
    headers : {
      "Content-Type" : "multipart/form-data"
    },
    data : data
  }, callback);
}