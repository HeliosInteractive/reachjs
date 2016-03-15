try{
  should = should;
  reach = reach;
}catch(e){
  should = require('should');
  reach = require('../index.js');
}

reach.development(true);
reach.key = "helios_test";

describe('Reach GET', function() {


  it("Should get an array of guests", function(done){

    this.timeout(5000);
    reach.get("guests", {}, function reqListener (err, res) {

      res.status.should.eql(200);
      done();
    });

  });


  it("Should get one guest by limit", function(done){

    this.timeout(5000);
    reach.get("guests", {limit:1}, function reqListener (err, res) {

      res.body.length.should.eql(1);
      done();
    });

  });

});