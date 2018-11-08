var fs, isBrowser = false;
try{
  should = should;
  reach = reach;
  if( window ) isBrowser = true;
}catch(e){
  should = require('should');
  //reach = require('../index.js');
  reach = require('../dist/reach.min.js');
  fs = require('fs');
  require('./config.js')(reach);
}

var activation = "1e637007-f4bc-4ad2-bc0c-386550df6662";

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
        reach.upload(activation, data, function(err, res){
          res.body[0].access.should.eql('public');
          /helios\/uploads\/test_hockey/.test(res.body[0].path).should.eql(true);
          done();
        });
      });
    });

  if(isBrowser )
    it("Should upload a private from canvas", function(done){

      this.timeout(5000);
      var canvas = document.getElementById("myCanvas");
      reach.image.fromCanvas(canvas, function(err, data){
        reach.upload(activation, data, {private:"true"}, function(err, res){
          res.body[0].access.should.eql('private');
          done();
        });
      });
    });

  if(isBrowser)
    it("Should upload a jpg", function(done){

      this.timeout(5000);
      var canvas = document.getElementById("myCanvas");
      reach.image.fromCanvas(canvas, "image/jpeg", function(err, data){
        reach.upload(activation, data, function(err, res){
          res.body[0].name.should.containEql('.jpg');
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
        reach.upload(activation, data, function(err, res){
          /helios\/uploads\/test_hockey/.test(res.body[0].path).should.eql(true);
          done();
        });
      });
    });

  if( !isBrowser )
    it("Should upload a photo from file", function(done){

      this.timeout(5000);

      reach.image.fromLocalPath(__dirname + "/reach.png", function(err, data){
        reach.upload(activation, data, function(err, res){

          /helios\/uploads\/test_hockey/.test(res.body[0].path).should.eql(true);
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
        var file = new File([data.data], "cat.jpg", {type: data.type});

        reach.image.fromFileInput(file, function (err, data) {
          reach.upload(activation, data, function (err, res) {
            /helios\/uploads\/test_hockey/.test(res.body[0].path).should.eql(true);
            done();
          });
        });
      });
    });



});