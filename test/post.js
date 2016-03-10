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


  it("Should create a guest", function(done){

    this.timeout(5000);

    var email = Math.random() * 100 + "@heliosinteractive.com";
    reach.post("guests", {email : email}, function reqListener (err, res) {
      res.body.email.should.eql(email);
      done();
    });

  });


});