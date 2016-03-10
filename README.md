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



# Dev

```
npm install && npm install grunt grunt-cli -g
grunt watch
```

Build for distribution `npm run build`