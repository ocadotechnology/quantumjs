blanket  = require('blanket')('../')
chai     = require('chai')
api = require('..')
should = chai.should()

describe('api', function() {

  // promised friendly version of 'it'
  var pit = function(desc, f) {
    it(desc, function(done){
      f().then(function(){
        done()
      }).done(null, done)
    })
  }

  pit('do something', function(){

  })

})