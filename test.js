var reach = require("./index");

reach.get({}, function reqListener (err, res) {

  console.log(err, res);
});