var fs, isBrowser = false;
try{
  should = should;
  reach = reach;
  if( window ) isBrowser = true;
}catch(e){
  should = require('should');
  //reach = require('../index.js');
  reach = require('../dist/reach.js');
  fs = require('fs');
  require('./config.js')(reach);
}

reach.development(true);
reach.key = "helios_test";

describe('Reach PUT', function() {

  it("Should update a guest", function(done){

    this.timeout(5000);

    var email = Math.random() * 100 + "@heliosinteractive.com";
    reach.post("guests", {email : email}, function reqListener (err, res) {

      var id = res.body.id;

      reach.put("guests/"+res.body.id, {test: 'yes'}, function reqListener (err, res) {
        res.body.id.should.eql(id);
        res.body.test.should.eql('yes');
        done();
      });
    });
  });

  it("Should update update an experience", function(done){

    this.timeout(5000);

    reach.post("experiences", {type : "mocha_test"}, function reqListener (err, res) {

      var id = res.body.id;

      reach.put("experiences/"+res.body.id, {meta: [{test:'yes'}]}, function reqListener (err, res) {
        res.body.id.should.eql(id);
        res.body.meta[0].test.should.eql('yes');
        done();
      });
    });
  });

});