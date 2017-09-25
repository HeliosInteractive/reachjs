# Reach JS Client

Perform common actions with the Loopback API in Node and the browser.

---

Node / Commonjs

```
npm install @helios-interactive/reachjs --save
```

Helios uses a custom header for authentication. You can also pass in an access token in the request query string for
loopback apps.

```
var reach = require('reach');
reach.setUrl('');
reach.key = '';
reach.get('guests', function(err, res){
  console.log(err, res);
});
```

---

Browser

```
<script src="./dist/reach.min.js"></script>
<script>
  reach.setUrl('');
  reach.key = '';
  reach.get('guests', function (err, res) {
    console.log(err, res);
  });
</script>
```

AMD
```
define(['reach'], function (reach) {
  reach.setUrl('');
  reach.key = '';
});
```

Module
```
import reach from '@helios-interactive/reachjs';

reach.setUrl('');
reach.key = '';
```

# Properties

### Key

Set the key (api or public) for authenticating requests.

_usage_
```
reach.key = 'some_api_key';
```

> This key is used for all requests

# Methods

### get

Makes a get request to an endpoint with options and a callback

**parameters**

 - uri {string} the endpoint to request
 - options {object} optional parameters /filters @see [options](#options)
 - done {function} called with err, res prameters @see [done](#done

_usage_
```
// get 1 guest
reach.get('guests', {limit:1}, function reqListener (err, res) {
  res.body.length.should.eql(1);
});

// get a guest by id
reach.get(`guests/${id}`, function reqListener (err, res) {
  res.body.name.should.eql('Michael');
});
```

### post

Makes a postt request to an endpoint with options and a callback

**parameters**

 - uri {string} the endpoint to request
 - options {object} optional parameters /filters @see [options](#options)
 - done {function} called with err, res prameters @see [done](#done)

_usage_
```
// create a guest
reach.post('guests', {name: 'Test', email : 'fakeemail@fake.com'}, function reqListener (err, res) {
  res.body.email.should.eql('fakeemail@fake.com');
});
```

### put

Makes a put request to an endpoint with options and a callback

**parameters**

 - uri {string} the endpoint to request
 - options {object} optional parameters /filters @see [options](#options)
 - done {callback} called with err, res prameters @see [done](#done)

_usage_
```
// update a guest
reach.put('guests', {id:'guestId', name: 'Test Test'}, function reqListener (err, res) {
  res.body.email.should.eql('fakeemail@fake.com');
});
```

### setUrl

Sets the base URL for Reach.

_usage_
```
reach.setUrl('http://localhost/api');
```

> This url is used for all requests

### upload

Uploads a file

**parameters**

 - activation {string} an activation id
 - data {object} form data object returned from reach.image
 - options {object} addtional options for files
 - done {callback} called with err, res prameters @see [done](#done)

_usage_
```
// upload a file and specify an event. private : false is the default
reach.upload(`${activationId}`, data, {private: false, eventId: 'someid'}, function(err, res){
});
// upload a signature to a private bucket for security
reach.upload(`${activationId}`, data, {private: true}, function(err, res){
});
```

# Other methods

### image

Reach helps you convert file data to images to upload. You can create file objects from <canvas/>, <img/>, <input type="file"/>, and fs.readFile.

_example usage_
```
var image = document.getElementById('myImage');
reach.image.fromImage(image, function(err, data){
    reach.upload(`${activationId}`, data, function(err, res){});
});
```

**fromCanvas**

 - canvas {Canvas} HTML canvas element
 - options {object}
   - quality {integer} (0-1)
   - type {string} 'image/png', 'image/jpeg', 'image/gif'
 - done {function} err, data

**fromImage**

 - image {Image} HTMl Image element
 - options {object}
   - quality {integer} (0-1)
   - type {string} 'image/png', 'image/jpeg', 'image/gif'
 - done {function} err, data

**fromFileInput**

 - file {FileInput} HTML file imput element
 - done {function} err, data

**fromLocalPath**

 - file {string} path to file on on disk (nodejs only)
 - done {function} err, data

**fromBuffer**

 - buffer {Buffer} Buffer object
 - name {string} filename.extension
 - done {function} err, data

### request

Underlying call to the request object. Must make a new request object for each call. You can make a request to any url with this method. Reach client wraps this exposed method.

 - uri {string} The full uri to request
 - opts {object} Options object
   - data : request data to use in the body of the request
   - qs : serializable query string data or a string
   - method : request method
   - headers : request headers
 - done {function} called with err, res prameters @see [done](#done)

```
new reach.request('http://localhost', {}, (err, res) => {});
```

---

# Notes

### Options

All requests accept an options object. The properties of this object are

 - data : request data to use in the body of the request
 - qs : serializable query string data or a string
 - method : request method
 - headers : request headers

If you are only setting the data property you may omit it. The following are equivelant.
```
{id:'1', name:'Michael', random:'value', boolean: true}
{data: {id:'1', name:'Michael', random:'value', boolean: true} }
```

As long as your payload does not need to set one of the reserved properties you may omit the data property. For example the following are equivelant.
```
{id:'1', name:'Michael', random:'value', boolean: true, qs: {test:true}}
{data: {id:'1', name:'Michael', random:'value', boolean: true}, qs: {test:true} }
```

However, if you payload needs to specify a reserved property you need to place it inside the data object. In the following case test:true will be set as query string parameters while 'ok':'ok' will be in the request body.
```
{data: {id:'1', name:'Michael', random:'value', boolean: true, qs: {'ok':'ok'}}, qs: {test:true} }
```

#### Query Options

**include**
Use the include option to include related content.
```
reach.get('experiences', {
   include: 'files',
   ...
}
```

**order**
Add the order option to have the content returned with a specific sort order.
```
reach.get('experiences', {
   order: 'created desc'
   ...
}
```

**limit**
Limit the number of results returned. By default this is set to 50.
```
reach.get('experiences', {
   limit: 100
   ...
}
```

**where**
Provide a where clause to further filter down the result set.
```
reach.get('experiences', {
  where: {
    activationId: "120398-jsao0j-1n093-1n23098",
  },
  ...
}
```


### Done

All requests expect an error first callback as the last argument. The error is reserved for network issues. For example, if there is no internet you may recieve an error object with `E_CONNREFUSED`. The response object is the parsable json response from the server. If you make a bad request you will receive no error object, but the response will contain a status of 401 and a body with additional data.

Do not assume that because no error was returned that your request was ok.

**The response object**
 - body {object} the response body parsed
 - headers {object} the response headers
 - status {integer} the response code
 - url {string} the full url of the request

Inspecting the response object will help you debug your requests. You should always verify a 200 level response from your request. Anything other than that is likely an error with your request. Inspect the response for details.

---


# Common Usage

Point to the staging server for testing. Defaults to production

```
var reach = require('reach');
reach.key = ''; // set your api key
reach.setUrl('http://domainorip.com/api/');
```

Get a guest by email

```
reach.get('guests', {where : {email:'test@heliosinteractive.com'} }, function (err, res) {
  console.log(err, res.body[0] && res.body[0].email);
});
```

Update a guest by email

```
reach.put('guests', {email:'test@heliosinteractive.com', 'firstName':'Michael'}, function (err, res) {
  console.log(err, res.body[0] && res.body[0].email);
});
```

Update a guest by id

```
// get guest.id from reach
reach.put(`guests/${guest.id}`, {'firstName':'Reach'}, function (err, res) {
  console.log(err, res);
});
```

Create an experience

```
reach.post('experiences', {'type':'reach_test', 'activationId':'123', 'eventId':'456'}, function (err, res) {
  console.log(err, res);
});
```

Upload a photo - 4 ways to handle this with the client

```
// from a canvas element (or Canvas object) https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
var canvas = document.getElementById('canvas-element-id');
reach.image.fromCanvas(canvas, function(err, data){

  reach.upload(`${activationId}`, data, function(err, res){
    console.log(err, res.body.result.files);
  });
});

// from an img tag (or Image object) https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
var image = document.getElementById('myImage');
reach.image.fromImage(image, function(err, data){

  reach.upload(`${activationId}`, data, function(err, res){
    console.log(err, res.body.result.files);
  });
});

// from a local file (Node only)
reach.image.fromLocalPath(require('path').join(__dirname, 'reach.png'), function(err, data){

  reach.upload(`${activationId}`, data, function(err, res){
    console.log(err, res.body.result.files);
  });
});


// From a File object https://developer.mozilla.org/en-US/docs/Web/API/File
var file = new File([new Blob([''], {type : 'image/png'})], 'cat.png');
reach.image.fromFileInput(file, function (err, data) {

  reach.upload(`${activationId}`, data, function (err, res) {
    console.log(err, res.body.result.files);
  });
});


// Or a file input https://developer.mozilla.org/en-US/docs/Web/API/File
var file = document.getElementById('my-file-input');
reach.image.fromFileInput(file, function (err, data) {

  reach.upload(`${activationId}`, data, function (err, res) {
    console.log(err, res.body.result.files);
  });
});
```

Manually adding a photo - none of the above methods work for your situation

```
var data =  {
  name: 'myimage.gif',
  type: 'image/gif',
  data: [new Blob([''], {type : 'image/gif'})] // any binary array, Buffer, Blob
}
reach.upload(`${activationId}`, data, function (err, res) {
  console.log(err, res.body.result.files);
});
```

Set image type and/or quality. Quality is a value between 0 and 1 and can be set in `fromCanvas` or `fromImage`

```
var canvas = document.getElementById('myCanvas');
reach.image.fromCanvas(canvas, {type:'image/jpeg',quality:0.1},function(err, data){
  // upload image
});
```

 > quality only works for `image/jpeg`

Attach a file to an experience

```
var canvas = document.getElementById('canvas-element-id'); // first upload from canvas
reach.image.fromCanvas(canvas, function(err, data){

  reach.upload(`${activationId}`, data, function(err, res){

    var exp = {
      'type':'reach_test',
      'activationId':'123',
      'eventId':'456',
      'photos' : [{
        'id' : res.body.result.files.file[0].id
      }]
    };
    reach.post('experiences', exp, function (err, res) {
      console.log(err, res);
    });
  });
});

```

### Dev

Setup and install

```
git clone ssh+git@github.com:HeliosInteractive/reachjs.git
cd reachjs &&\
npm install && npm install grunt grunt-cli -g
```

**Development and testing**

```
grunt dev
```

The dev task will run watch and a connect static server on port 8000. Open `http://127.0.0.1:8000/test/html/test.html` to run
the automated browser tests.

> copy test/config.dist.js to test/config.js and set your api key for testing

Run `grunt mochaTest` to test the node components

---

When you're ready for release run

```
npm run build
```

Submit pull requests to the develop branch
