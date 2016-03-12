try{
  should = should;
  reach = reach;
}catch(e){
  should = require('should');
  reach = require('../index.js');
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


  it("Should upload a photo", function(done){

    this.timeout(5000);


    var canvas = document.getElementById('myCanvas');
    reach.image.fromCanvas(canvas, function(err, data){
      console.log("data", data);

      reach.upload("test/reachjs/", data, function(){
        done();
      });
    });



  });




});