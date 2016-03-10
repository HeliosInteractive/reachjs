try{
  should = should;
  reach = reach;
}catch(e){
  should = require('should');
  reach = require('../index.js');
}



describe('Reach GET', function() {


  it("Should get an array of guests", function(done){

    reach.get({uri:"guests"}, function reqListener (err, res) {

      res.target.status.should.eql(200);
      done();
    });

  });


});