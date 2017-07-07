const image = (() => { // jshint ignore:line
  const Image = {};
  let perf = false;

  function noop() {
  }

  try {
    if (window && window.performance && typeof window.performance.now === 'function') {
      perf = window.performance; // use high-precision timer if available
    }
  } catch (e) {
    noop();
  }

  Image.supportedMimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
  };

  try { // for node webkit
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value(done, type, quality) {
          const binStr = atob(this.toDataURL(type, quality).split(',')[1]);
          const len = binStr.length;
          const arr = new Uint8Array(len);

          for (let i = 0; i < len; i += 1) {
            arr[i] = binStr.charCodeAt(i);
          }

          done(new Blob([arr], {
            type: type || 'image/png',
          }));
        },
      });
    }
  } catch (e) {
    noop();
  }
  /**
   * Generate uuid for filenames
   * @returns {string}
   */
  function uuid() {
    let d = new Date().getTime();
    if (perf) {
      d += perf.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (d + (Math.random() * 16)) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
  }
  /**
   * Converts canvas to either blob or buffer if blob isn't supported
   * @param canvas
   * @param options
   * @callback done
   */
  function toBlobOrBuffer(canvas, options, done) {
    const filename = uuid() + Image.supportedMimeTypes[options.type];
    try {
      // browser
      canvas.toBlob((blob) => {
        done(null, {
          name: filename,
          type: options.type,
          data: blob,
        });
      }, options.type, options.quality);
    } catch (e) {
      // node
      setTimeout(() => {
        const regex = new RegExp(`data:${options.type};base64,`);
        const buffer = new Buffer(canvas.toDataURL(options.type, options.quality).replace(regex, ''), 'base64');
        done(null, {
          name: filename,
          type: options.type,
          data: buffer,
        });
      }, 1);
    }
  }
  /**
   * Get image buffer from html <canvas/> element
   * @param {object} canvas `document.getElementByTagName("canvas')[0];`
   * @param {object} data image options like mimetype and compression
   * @callback callback
   * @return {Buffer}
   */
  Image.fromCanvas = function fromCanvas(canvas, data, callback) {
    let done = callback;
    let options = data;
    if (typeof options === 'function') {
      done = options;
      options = 'image/png';
    }
    if (typeof options === 'string') {
      options = {
        type: options,
        quality: 1,
      };
    }
    if (!options.type) options.type = 'image/png';
    if (!options.quality) options.quality = 1;

    toBlobOrBuffer(canvas, options, done);
  };
  /**
   * Get image buffer from html <img/> element
   * @param {object} img `document.getElementByTagName('img')[0];`
   * @param {object} data image options like mimetype and compression
   * @callback callback
   * @return {Buffer}
   */
  Image.fromImage = function fromImage(img, data, callback) {
    const extension = `.${img.src.split('.').pop()}`;
    let done = callback;
    let options = data;
    if (typeof options === 'function') {
      done = options;
      options = {
        type: Image.supportedMimeTypes[extension],
        quality: 1,
      };
    }
    if (typeof options === 'string') {
      options = {
        type: options,
        quality: 1,
      };
    }
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    Image.fromCanvas(canvas, options, done);
  };
  /**
   * Read file data to buffer from file input
   * @param {object} file input element `document.getElementByTagName('input')[0];`
   * @callback done
   * @param {object|null} error
   * @param {Buffer} data
   * @returns {*}
   */
  Image.fromFileInput = function fromFileInput(file, done) {
    Image.fromBuffer(file, file.name, done);
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
  Image.fromLocalPath = function fromLocalPath(path, done) {
    try {
      require('fs').readFile(path, (err, data) => { // eslint-disable-line global-require
        Image.fromBuffer(data, path, done);
      });
    } catch (e) {
      throw new Error('reach.image.fromLocalPath only supported in node.');
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
  Image.fromBuffer = function fromBuffer(buffer, path, done) {
    setTimeout(() => {
      const extension = `.${path.split('.').pop()}`;
      done(null, buffer && {
        name: uuid() + extension,
        type: Image.supportedMimeTypes[extension],
        data: buffer,
      });
    }, 1);
  };

  return Image;
})();

export default image;
