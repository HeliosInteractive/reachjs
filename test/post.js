var fs, isBrowser = false;
try{
  should = should;
  reach = reach;
  if( window ) isBrowser = true;
}catch(e){
  should = require('should');
  reach = require('../index.js');
  fs = require('fs');
}

reach.development(true);
reach.key = "helios_test";

describe('Reach POST', function() {

  it("Should create a guest", function(done){

    this.timeout(5000);

    var email = Math.random() * 100 + "@heliosinteractive.com";
    reach.post("guests", {email : email}, function reqListener (err, res) {
      res.body.email.should.eql(email);
      done();
    });
  });

  if(isBrowser )
    it("Should upload a photo from canvas", function(done){

      this.timeout(5000);
      var canvas = document.getElementById("myCanvas");
      reach.image.fromCanvas(canvas, function(err, data){
        reach.upload("test/reachjs/", data, function(err, res){
          /test\/reachjs\//.test(res.body.result.files.file[0].name).should.eql(true);
          done();
        });
      });
    });

  if(isBrowser )
    it("Should upload a photo from img", function(done){

      this.timeout(5000);
      var image = document.getElementById("myImage");
      reach.image.fromImage(image, function(err, data){
        reach.upload("test/reachjs/", data, function(err, res){
          /test\/reachjs\//.test(res.body.result.files.file[0].name).should.eql(true);
          done();
        });
      });
    });

  if( !isBrowser )
    it("Should upload a photo from file", function(done){

      this.timeout(5000);

      reach.image.fromLocalPath(__dirname + "/reach.png", function(err, data){
        reach.upload("test/reachjs/", data, function(err, res){

          /test\/reachjs\//.test(res.body.result.files.file[0].name).should.eql(true);
          done();
        });
      });
    });


  if(isBrowser )
    it("Should upload a photo from file input", function(done) {

      // spoof a file input with the File object
      var image = document.getElementById("myImage");
      reach.image.fromImage(image, function (err, data) {
        var file = new File([data.data], "cat.jpg");

        reach.image.fromFileInput(file, function (err, data) {
          reach.upload("test/reachjs/", data, function (err, res) {
            /test\/reachjs\//.test(res.body.result.files.file[0].name).should.eql(true);
            done();
          });
        });
      });
    });



});