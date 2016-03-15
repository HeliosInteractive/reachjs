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

  it.skip("Should create a guest", function(done){

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


  if(isBrowser ){

    var file = document.getElementById("myFile");
    file.addEventListener("change", function(e){

      (function(done){
        //this.timeout(5000);
        reach.image.fromFileInput(e.target.files[0], function(err, data){

          reach.upload("test/reachjs/", data, function(err, res){

            try{
              /test\/reachjs\//.test(res.body.result.files.file[0].name).should.eql(true);
            }catch(e){
              return document.getElementById("uploadmessage").innerHTML = "failed<p>"+ e.message+"</p>";
            }
            document.getElementById("uploadmessage").innerHTML = "<p>success</p>";
            done();
          });
        });
      })(function(){});
    });
  }



});