var image = (function() {// jshint ignore:line

  "use strict";

  var image = {}, perf = false;

/*

// export request for node or the browser
  if (typeof module !== "undefined" && module.exports)
    exports.image = module.exports = image; // node
  else
    exports.image = image;
*/


  try {
    if (window && window.performance && typeof window.performance.now === "function") {
      perf = window.performance; //use high-precision timer if available
    }
  } catch (e) {
  }

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

  try { // for node webkit
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
        value: function (done, type, quality) {

          var binStr = atob(this.toDataURL(type, quality).split(",")[1]),
              len = binStr.length,
              arr = new Uint8Array(len);

          for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }

          done(new Blob([arr], {type: type || "image/png"}));
        }
      });
    }
  } catch (e) {
  }

  /**
   * Get image buffer from html <canvas/> element
   * @param {object} canvas `document.getElementByTagName("canvas')[0];`
   * @param {object} options image options like mimetype and compression
   * @callback done
   * @return {Buffer}
   */
  image.fromCanvas = function (canvas, options, done) {

    if (typeof options === "function") {
      done = options;
      options = "image/png";
    }
    if (typeof options === "string")
      options = {type: options, quality: 1};
    if (!options.type) options.type = "image/png";
    if (!options.quality) options.quality = 1;

    toBlobOrBuffer(canvas, options, done);
  };
  /**
   * Get image buffer from html <img/> element
   * @param {object} img `document.getElementByTagName('img')[0];`
   * @param {object} options image options like mimetype and compression
   * @callback done
   * @return {Buffer}
   */
  image.fromImage = function (img, options, done) {

    var extension = "." + img.src.split(".").pop();

    if (typeof options === "function")
      done = options, options = {type: image.supportedMimeTypes[extension], quality: 1};

    if (typeof options === "string")
      options = {type: options, quality: 1};

    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    image.fromCanvas(canvas, options, done);
  };
  /**
   * Read file data to buffer from file input
   * @param {object} file input element `document.getElementByTagName('input')[0];`
   * @callback done
   * @param {object|null} error
   * @param {Buffer} data
   * @returns {*}
   */
  image.fromFileInput = function (file, done) {

    image.fromBuffer(file, file.name, done);
    return file;
  };
  /**
   * Read a local file to buffer for uploading to reach
   * @param {string} path
   * @callback done
   * @param {object|null} error
   * @param {Buffer} data
   * @returns {*}
   */
  image.fromLocalPath = function (path, done) {

    try {
      require("fs").readFile(path, function (err, data) {
        image.fromBuffer(data, path, done);
      });
    } catch (e) {
      throw new Error("reach.image.fromLocalPath only supported in node.");
    }
    return path;
  };
  /**
   * Setup data for uploads from buffer
   *
   * @param {Buffer|Blob} buffer
   * @param {string} path full path to file `path/to/folder`
   * @callback done
   */
  image.fromBuffer = function (buffer, path, done) {

    setTimeout(function () {
      var extension = "." + path.split(".").pop();
      done(null, buffer && {name: uuid() + extension, type: image.supportedMimeTypes[extension], data: buffer});
    }, 1);
  };
  /**
   * Generate uuid for filenames
   * @returns {string}
   */
  function uuid() {
    var d = new Date().getTime();
    if (perf)
      d += perf.now();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /**
   * Converts canvas to either blob or buffer if blob isn't supported
   * @param canvas
   * @param options
   * @callback done
   */
  function toBlobOrBuffer(canvas, options, done) {

    var filename = uuid() + image.supportedMimeTypes[options.type];
    try {
      // browser
      canvas.toBlob(function (blob) {
        done(null, {name: filename, type: options.type, data: blob});
      }, options.type, options.quality);
    } catch (e) {
      // node
      setTimeout(function () {
        var regex = new RegExp("data:" + options.type + ";base64,");
        var buffer = new Buffer(canvas.toDataURL(options.type, options.quality).replace(regex, ""), "base64");
        done(null, {name: filename, type: options.type, data: buffer});
      }, 1);
    }
  }

  return image;

})();