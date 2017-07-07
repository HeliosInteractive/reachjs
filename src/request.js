import merge from 'merge';

const Request = (() => {
  /**
   * Noop for catch
   */
  function noop() {

  }
  /**
   * Create formdata for node
   * @param data
   * @returns {FormData|exports|module.exports}
   */
  function getForm(data) {
    const FormData = require('form-data'); // eslint-disable-line global-require
    const form = new FormData();
    form.append('file', data.data, {
      filename: data.path,
      contentType: data.type,
      basename: false,
    });
    return form;
  }
  /**
   * Format a query string
   * @param obj
   * @returns {*}
   */
  function querystring(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return `?${obj}`;

    function toParam(a, k) {
      a.push(`${k}=${encodeURIComponent(obj[k])}`);
      return a;
    }

    return `?${Object.keys(obj)
            .reduce(toParam, [])
            .join('&')}`;
  }
  /**
   * Split string headers into key -> value pairs
   * @param headers
   * @returns {*}
   */
  function parseHeaders(headers) {
    if (!headers) return headers;

    const h = {};

    function foreachHeader(header) {
      if (!header) return;
      const a = header.split(':');
      h[a[0]] = a[1].trim();
    }

    headers
        .split('\r\n')
        .forEach(foreachHeader);

    return h;
  }
  /**
   * Browser request
   * @param opts
   * @callback done
   */
  const xhr = function xhr(base, opts, done) {
    this.oReq = new XMLHttpRequest();

    const options = merge(opts);
    const uri = `${base}${querystring(options.qs)}`;

    function xhrError(err) {
      // TODO: standardize error format
      done(err);
    }

    const xhrResponse = (res) => {
      const response = {
        body: res.target.response,
        status: res.target.status,
        url: res.target.responseURL,
        headers: parseHeaders(this.oReq.getAllResponseHeaders()),
      };

      try {
        const body = JSON.parse(res.target.response);
        response.body = body;
      } catch (e) { noop(); }

      done(null, response);
    };

    this.oReq.addEventListener('load', xhrResponse);
    this.oReq.addEventListener('error', xhrError);
    this.oReq.open((options.method && options.method.toUpperCase()) || 'GET', uri, true);

    let data = null;

    if (options.data) {
      if (options.headers && options.headers['Content-Type'] === 'multipart/form-data') {
        data = new FormData();
        data.append('file', options.data.data, options.data.path);
        delete options.headers['Content-Type'];
      } else {
        data = JSON.stringify(options.data);
      }
    }

    if (options.headers && typeof options.headers === 'object') {
      Object.keys(options.headers).forEach(this.setHeaders.bind(this, options.headers));
    }

    this.oReq.send(data);
  };
  /**
   * Convert keys of object to headers
   * @param headers
   * @param key
   */
  xhr.prototype.setHeaders = function setHeaders(headers, key) {
    this.oReq.setRequestHeader(key, headers[key]);
  };
  /**
   * Node request
   * @param opts
   * @callback done
   */
  const http = function http(base, opts, done) {
    const url = require('url'); // eslint-disable-line global-require
    const uri = `${base}${querystring(opts.qs)}`;
    const parsed = url.parse(uri, true, true);
    let httpMod;
    if (parsed.protocol === 'https:') {
      httpMod = require('https');// eslint-disable-line global-require
    } else {
      httpMod = require('http');// eslint-disable-line global-require
    }

    const reqOptions = {
      host: parsed.hostname,
      protocol: parsed.protocol,
      port: parsed.port,
      path: parsed.path,
      headers: opts.headers,
      method: opts.method,
    };

    function httpResponse(res) {
      const response = {
        body: '',
        status: res.statusCode,
        url: uri,
        headers: res.headers,
      };

      function onData(chunk) {
        response.body += chunk;
      }

      function onEnd() {
        try {
          const body = JSON.parse(response.body);
          response.body = body;
        } catch (e) { noop(); }
        done(null, response);
      }

      res.setEncoding('utf8');
      res.on('data', onData);
      res.on('end', onEnd);
    }

    function httpError(err) {
      // TODO: coerce error to standard format
      done(err);
    }

    let form = false;
    if (opts.headers && opts.headers['Content-Type'] === 'multipart/form-data') {
      form = getForm(opts.data);
      reqOptions.headers['Content-Type'] = form.getHeaders()['content-type'];
    }

    const req = httpMod.request(reqOptions, httpResponse)
        .on('error', httpError);

    if (form) {
      form.pipe(req);
    } else if (opts.data) {
      req.write(JSON.stringify(opts.data));
    }
    req.end();
  };

  if (typeof XMLHttpRequest !== 'undefined') { // browser
    return xhr;
  }
  return http;
})();

export default Request;
