"use strict";

var request, image;
var _url;
/**
 * Make HTTP requests to reach
 * @param {string|options} uri
 * @param {object|function} options
 * @param {string} options.uri
 * @param {object} options.headers
 * @param {string} options.qs
 * @callback done
 * @returns {*}
 */
var reach = function(uri, options, done) {// jshint ignore:line

  if( !_url )
    throw new Error("set the url for reach with reachjs.setUrl('')");

  if (typeof uri === "undefined")
    throw new Error("undefined is not a valid uri or options object.");

  if( !reach.key && (options.qs && !options.qs.access_token) )
    throw new Error("reach.key or token is required");

  if( typeof options === "function" )
    done = options;

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
  if( !options.qs ) options.qs = {};
  if( qs ) options.qs.filter = qs;

  !options.headers && (options.headers = {});
  if( reach.key ) options.headers["X-Helios-ID"] = reach.key;

  if( !options.headers["Content-Type"] )
    options.headers["Content-Type"] = "application/json";

  return new request(uri, options, done);
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

  var data = merge(true,options);// jshint ignore:line
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
  if(options.order) filter.order = options.order;

  var qs = false;
  // the options are just a query filter
  if(Object.keys(filter).length > 0){
    try{
      qs = JSON.stringify(filter);
      //qs = "filter=" + qs;
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

  return function (uri, options, done) {

    if( typeof options === "function"  ){
      done = options;
      options = {};
    }
    if( typeof uri === "object" )
      uri.method = method;
    else
      options.method = method;
    
    return reach(uri, options, done);
  };
}

reach.key = null;
reach.get = verbFunc("GET");
reach.post = verbFunc("POST");
reach.put = verbFunc("PUT");
reach.del = verbFunc("DELETE");
reach.request = request;
reach.image = image;
reach.upload = upload;


function upload(activationId, data, options, done){

  if( typeof options === "function" ){
    done = options;
    options = {};
  }

  if( data[0] )
    data = data.map(function(obj){
      obj.path = obj.name;
      return obj;
    });
  else
    data.path = data.name;

  reach("files/upload/"+activationId, {
    method : "POST",
    qs : {
      options: JSON.stringify(options)
    },
    headers : {
      "Content-Type" : "multipart/form-data"
    },
    data : data
  }, done);

}
reach.development = function(){
  console.error("reach.development is no longer supported. Set the url explicitly with reach.setUrl()");
};
// set your endpoint
reach.setUrl = function(pUrl) {
  if( pUrl.substr(-1) !== "/" ) pUrl += "/";
  if( pUrl.substr(-4) !== "api/" ) pUrl += "api/";
  if (pUrl) _url = pUrl;
};
