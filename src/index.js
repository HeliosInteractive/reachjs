import merge from 'merge';
import Request from './request';
import image from './image';

let internalUrl;

/**
 * No op to get around jshint empty catch statement warnings
 */
function noop() {
}

/**
 * Format request options data
 * @param options
 * @returns {*}
 */
function formatData(options) {
  if (options.method !== 'POST' && options.method !== 'PUT') {
    return options;
  }

  if (options.headers && options.headers['Content-Type'] === 'multipart/form-data') {
    return options;
  }

  const copy = merge(options);
  const data = merge(true, options);
  delete data.headers;
  delete data.uri;
  delete data.data;
  delete data.method;
  copy.data = data;

  return copy;
}

/**
 * Turn options arguments into loopback filter string
 * @param fil
 * @param options
 * @returns {boolean}
 */
function filter(fil, options) {
  const query = merge(fil);
  if (options.where) {
    query.where = options.where;
  }
  if (options.limit) {
    query.limit = options.limit;
  }
  if (options.include) {
    query.include = options.include;
  }
  if (options.skip) {
    query.skip = options.skip;
  }
  if (options.fields) {
    query.fields = options.fields;
  }
  if (options.order) {
    query.order = options.order;
  }

  let qs = false;
  // the options are just a query filter
  if (Object.keys(query).length > 0) {
    try {
      qs = JSON.stringify(query);
    } catch (e) {
      noop();
    }
  }
  return qs;
}

/**
 * Make HTTP requests to reach
 * @param {string|options} url
 * @param {object|function} data
 * @param {string} options.uri
 * @param {object} options.headers
 * @param {string} options.qs
 * @callback callback
 * @returns {*}
 */
const reach = function reach(url, data, callback) {
  if (!internalUrl) {
    throw new Error('set the url for reach with reachjs.setUrl()');
  }
  if (typeof url === 'undefined') {
    throw new Error('undefined is not a valid url or options object.');
  }
  if (!reach.key && (data.qs && !data.qs.access_token)) {
    throw new Error('reach.key or token is required');
  }
  let done = callback;
  let options = data;
  let uri = url;

  if (typeof options === 'function') {
    done = options;
  }

  if (typeof options === 'object') {
    options.uri = uri;
  } else if (typeof uri === 'string') {
    options = { uri };
  } else {
    options = uri;
  }

  if (options.uri.substr(0, 1) === '/') {
    options.uri = options.uri.substr(1);
  }
  options = formatData(options);

  uri = internalUrl + options.uri;
  delete options.uri;

  const qs = filter({}, options);
  if (!options.qs) {
    options.qs = {};
  }
  if (qs) {
    options.qs.filter = qs;
  }
  if (!options.headers) {
    options.headers = {};
  }
  if (reach.key && !options.headers['X-Helios-ID']) {
    options.headers['X-Helios-ID'] = reach.key;
  }

  if (!options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/json';
  }

  return new Request(uri, options, done);
};
/**
 * Shortcut methods for HTTP verbs
 * @param verb
 * @returns {Function}
 */
function verbFunc(method) {
  return function verbFuncInternal(url, data, callback) {
    const uri = url;
    let done = callback;
    let options = data;
    if (typeof options === 'function') {
      done = options;
      options = {};
    }
    if (typeof uri === 'object') {
      uri.method = method;
    } else {
      options.method = method;
    }
    return reach(uri, options, done);
  };
}

function upload(activationId, file, args, callback) {
  let data = file;
  let options = args;
  let done = callback;
  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  if (data[0]) {
    data = data.map((o) => {
      const obj = merge(true, o);
      obj.path = obj.name;
      return obj;
    });
  } else {
    data.path = data.name;
  }

  reach(`files/upload/${activationId}`, {
    method: 'POST',
    qs: {
      options: JSON.stringify(options),
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  }, done);
}

reach.key = null;
reach.get = verbFunc('GET');
reach.post = verbFunc('POST');
reach.put = verbFunc('PUT');
reach.del = verbFunc('DELETE');
reach.request = Request;
reach.image = image;
reach.upload = upload;

reach.development = function reachDevelopment() {
  throw new Error('reach.development is no longer supported. Set the url explicitly with reach.setUrl()');
};

// set your endpoint
reach.setUrl = function reachSetUrl(uri) {
  let url = uri;
  if (uri.substr(-1) !== '/') {
    url = `${url}/`;
  }
  if (uri.substr(-4) !== 'api/') {
    url = `${url}api/`;
  }
  if (url) {
    internalUrl = url;
  }
};

export default reach;
