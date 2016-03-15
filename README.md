# Reach JS Client

Perform common actions with the Helios Reach API in Node and the browser.

---

Node

```
npm install git@helios-stash.heliosinteractive.com:7999/hi/reachjs.git --save
```

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