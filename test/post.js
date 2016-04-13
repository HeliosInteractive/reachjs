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

  if(isBrowser)
    it("Should upload a jpg", function(done){

      this.timeout(5000);
      var canvas = document.getElementById("myCanvas");
      reach.image.fromCanvas(canvas, "image/jpg", function(err, data){
        reach.upload("test/reachjs/", data, function(err, res){
          res.body.result.files.file[0].name.should.containEql('.jpg');
          done();
        });
      });
    });

  if(isBrowser)
    it("Should upload a jpg with low quality", function(done){

      this.timeout(5000);
      var image = document.getElementById("myImage");
      reach.image.fromImage(image, {type:"image/jpeg",quality:.1},function(err, data){
        data.data.size.should.be.lessThan(4000);
        done();
      });
    });

  if(isBrowser)
    it("Should ignore quality if png", function(done){

      this.timeout(5000);
      var image = document.getElementById("myImage");
      reach.image.fromImage(image, {quality:.1},function(err, data){
        data.data.size.should.eql(60490); // full quality size
        done();
      });
    });

  if(isBrowser)
    it("Should set as jpeg", function(done){

      this.timeout(5000);
      var image = document.getElementById("myImage");
      reach.image.fromImage(image, {type:"image/jpeg"},function(err, data){
        data.name.should.containEql('.jpg');
        done();
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

      this.timeout(5000);
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