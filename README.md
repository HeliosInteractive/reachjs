# Reach JS Client

Perform common actions with the Helios Reach API in Node and the browser.

---

Node

```
npm install git+helios-stash.heliosinteractive.com:7999/hi/reachjs.git --save
```

If you are not authenticated with stash through ssh then you can try the https path or clone the repo into node_modules
and manually run `npm install`.

```
var reach = require("reach");
reach.key = "helios_test";
reach.get("guests", function(err, res){
  console.log(err, res);
});
```

---

Browser

```
<script src="./dist/reach.min.js"></script>
<script>
    reach.key = "helios_test";
    reach.get("guests", function (err, res) {
      console.log(err, res);
    });
</script>
```

# Common Usage

Point to the staging server for testing. Defaults to production

```
var reach = require("reach");
reach.key = "helios_test";
reach.development(true); // point to reachstaging.herokuapp.com
```

Get a guest by email

```
reach.get("guests", {where : {email:"michael.neil@heliosinteractive.com"} }, function (err, res) {
  console.log(err, res.body[0] && res.body[0].email);
});
```

Update a guest by email

```
reach.put("guests", {email:"michael.neil@heliosinteractive.com", "firstName":"Michael"}, function (err, res) {
  console.log(err, res.body[0] && res.body[0].email);
});
```

Update a guest by id

```
// get guest.id from reach
reach.put("guests/"+guest.id, {"firstName":"Reach"}, function (err, res) {
  console.log(err, res);
});
```

Create an experience

```
reach.post("experiences", {"type":"reach_test", "activationId":"123", "eventId":"456"}, function (err, res) {
  console.log(err, res);
});
```

Upload a photo - 4 ways to handle this with the client

```
// from a canvas element (or Canvas object) https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
var canvas = document.getElementById("canvas-element-id");
reach.image.fromCanvas(canvas, function(err, data){

  reach.upload("test/reachjs/", data, function(err, res){
    console.log(err, res.body.result.files);
  });
});

// from an img tag (or Image object) https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
var image = document.getElementById("myImage");
reach.image.fromImage(image, function(err, data){

  reach.upload("test/reachjs/", data, function(err, res){
    console.log(err, res.body.result.files);
  });
});

// from a local file (Node only)
reach.image.fromLocalPath(require("path").join(__dirname, "reach.png"), function(err, data){

  reach.upload("test/reachjs/", data, function(err, res){
    console.log(err, res.body.result.files);
  });
});


// From a File object https://developer.mozilla.org/en-US/docs/Web/API/File
var file = new File([new Blob([""], {type : "image/png"})], "cat.png");
reach.image.fromFileInput(file, function (err, data) {

  reach.upload("test/reachjs/", data, function (err, res) {
    console.log(err, res.body.result.files);
  });
});


// Or a file input https://developer.mozilla.org/en-US/docs/Web/API/File
var file = document.getElementById("my-file-input");
reach.image.fromFileInput(file, function (err, data) {

  reach.upload("test/reachjs/", data, function (err, res) {
    console.log(err, res.body.result.files);
  });
});
 ````

Attach a file to an experience

```
var canvas = document.getElementById("canvas-element-id"); // first upload from canvas
reach.image.fromCanvas(canvas, function(err, data){

  reach.upload("test/reachjs/", data, function(err, res){

    var exp = {
      "type":"reach_test",
      "activationId":"123",
      "eventId":"456",
      "photos" : [{
        "imagePath" : res.body.result.files.file[0].name
      }]
    };
    reach.post("experiences", exp, function (err, res) {
      console.log(err, res);
    });
  });
});

```

### Dev

Setup and install

```
git clone ssh://git@helios-stash.heliosinteractive.com:7999/hi/reachjs.git
cd reachjs &&\
npm install && npm install grunt grunt-cli -g
```

**Development and testing**

```
grunt dev
```

The dev task will run watch and a connect static server on port 8000. Open `http://127.0.0.1:8000/test/html/test.html` to run
the automated browser tests.

Run `grunt mochaTest` to test the node components

---

When you're ready for release run

```
npm run build
```

Submit pull requests to the develop branch