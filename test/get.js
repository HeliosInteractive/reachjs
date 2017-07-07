try {
  should = should;
  reach = reach;
} catch(e) {
  should = require('should');
  reach = require('../dist/reach.min.js');
  require('./config.js')(reach);
}
describe('Reach GET', function() {
  it('Should get an array of guests', function(done) {
    this.timeout(4000);
    reach.get('guests', {}, function reqListener(err, res) {
      res.status.should.eql(200);
      done();
    });
  });
  it('Should get one guest by limit', function(done) {
    reach.get('guests', {limit: 1}, function reqListener(err, res) {
      res.body.length.should.eql(1);
      done();
    });
  });
  it('Should get one guest by limit', function(done) {
    reach.get('guests', {where: {email: 'michael.neil@heliosinteractive.com'}}, function(err, res) {
      res.body[0].email.should.eql('michael.neil@heliosinteractive.com');
      done();
    });
  });
});