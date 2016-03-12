"use strict";

var image = {};

// export request for node or the browser
if( typeof module !== "undefined" && module.exports )
  exports.image = module.exports = image; // node
else
  exports.image = image;

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

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    value: function (callback, type, quality) {

      var binStr = atob( this.toDataURL(type, quality).split(",")[1] ),
          len = binStr.length,
          arr = new Uint8Array(len);

      for (var i=0; i<len; i++ ) {
        arr[i] = binStr.charCodeAt(i);
      }

      callback( new Blob( [arr], {type: type || "image/png"} ) );
    }
  });
}

/**
 * Get image buffer from html <canvas/> element
 * @param {object} image `document.getElementByTagName('canvas')[0];`
 * @return {Buffer}
 */
image.fromCanvas = function(image, callback){




  image.toBlob(function(){
    var filename = uuid() + ".png";
    callback(null, {name: filename, type: "image/png", data: image.toDataURL().replace(/data:image\/png;base64,/,"")});
  });

  /*var filename = uuid() + ".png";
  return {name: filename, type: "image/png", data: base64ToBinary(image.toDataURL())};*/
};
/**
 * Get image buffer from html <img/> element
 * @param {object} image `document.getElementByTagName('img')[0];`
 * @return {Buffer}
 */
image.fromImage = function(image){

  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  var ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  var filename = uuid() + ".png";

  return {name: filename, type: "image/png", data: base64ToBinary(canvas.toDataURL("image/png"))};
};
/**
 * Read file data to buffer from file input
 * @param {object} file input element `document.getElementByTagName('input')[0];`
 * @callback callback
 * @param {object|null} error
 * @param {Buffer} data
 * @returns {*}
 */
image.fromFileInput = function(file, callback){

  if( typeof FileReader === "undefined" ){
    throw new Error("reach.image.fromFileInput not supported in node. If you are using node " +
        "webkit make sure you are running in window context. Or, pass your own Buffer or array data to reach.upload");
  }
  // FileReader not supported in node webkit
  var reader = new FileReader();
  reader.onload = function (event) {
    // TODO: preserve mimetype
    var filename = uuid() + ".png";
    callback(null, {name: filename, type: "image/png", data: event.target.result});
  };
  reader.onerror = reader.onabort = callback;
  reader.readAsArrayBuffer(file);

  return file;
};
/**
 * Read a local file to buffer for uploading to reach
 * @param {string} path
 * @callback callback
 * @param {object|null} error
 * @param {Buffer} data
 * @returns {*}
 */
image.fromLocalPath = function(path, callback){
  try{
    require("fs").readFile(path, function(err, data){
      var extension = "." +  path.split(".").pop();
      var filename = uuid() + extension;
      callback(err, data && {name: filename, type: image.supportedMimeTypes[extension], data: data});
    });
  }catch(e){
    throw new Error("reach.image.fromLocalPath only supported in node.");
  }
  return path;
};
/**
 * Converts base64 to binary form data for browser and node webkit
 * @param data
 * @return {Buffer|Blob}
 */
function base64ToBinary(base64){

  var data = base64.replace(/data:image\/png;base64,/,"");
  var b;
  try{
    // for the browser
    b = b64toBlob(data, "image/png");
  }catch(e){
    // for node webkit...
    b = new Buffer(data);
  }
  return b;
}
/**
 * Convert base64 data to blob
 * @param b64Data
 * @param contentType
 * @param sliceSize
 * @returns {*}
 */
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
/**
 * Generate uuid for filenames
 * @returns {string}
 */
function uuid(){
  var d = new Date().getTime();
  if(window && window.performance && typeof window.performance.now === "function"){
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c === "x" ? r : (r&0x3|0x8)).toString(16);
  });
}

/*function blobToUint8Array(b) {
  var uri = URL.createObjectURL(b),
      xhr = new XMLHttpRequest(),
      i,
      ui8;

  xhr.open("GET", uri, false);
  xhr.send();
  URL.revokeObjectURL(uri);

  ui8 = new Uint8Array(xhr.response.length);

  for (i = 0; i < xhr.response.length; ++i) {
    ui8[i] = xhr.response.charCodeAt(i);
  }

  return ui8.join(" ");
}*/
