chai     = require('chai')
dom      = require('quantum-dom')
html     = require('..')
should   = chai.should()

describe('element', function() {

  // promised friendly version of 'it'
  var pit = function(desc, f) {
    it(desc, function(done){
      f().then(function(){
        done()
      }).done(null, done)
    })
  }

  pit('basic div should get generated properly', function(){

    var obj = {
      filename: 'filename.um',
      content: {
        content: [{
          type: 'div',
          params: [],
          content: []
        }]
      }
    }

    return html()(obj)
      .then(function(res){
        res.filename.should.equal('filename.um')
        res.content.body.content[0].type.should.equal('div')
        res.content.body.content.length.should.equal(1)
      })
  })

  describe('shorthand:', function() {
    pit('single class', function(){

      var obj = {
        filename: 'filename.um',
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry'],
            content: []
          }]
        }
      }

      return html()(obj)
        .then(function(res){
          res.filename.should.equal('filename.um')
          res.content.body.content[0].type.should.equal('div')
          res.content.body.content[0].attrs['class'].should.equal('strawberry')
          res.content.body.content.length.should.equal(1)
        })
    })


    pit('multiple of the same class should be coalsed', function(){

      var obj = {
        filename: 'filename.um',
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.strawberry'],
            content: []
          }]
        }
      }

      return html()(obj)
        .then(function(res){
          res.filename.should.equal('filename.um')
          res.content.body.content[0].type.should.equal('div')
          res.content.body.content[0].attrs['class'].should.equal('strawberry')
          res.content.body.content.length.should.equal(1)
        })
    })

    pit('multiple classes', function(){

      var obj = {
        filename: 'filename.um',
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.banana'],
            content: []
          }]
        }
      }

      return html()(obj)
        .then(function(res){
          res.filename.should.equal('filename.um')
          res.content.body.content[0].type.should.equal('div')
          res.content.body.content[0].attrs['class'].should.equal('strawberry banana')
          res.content.body.content.length.should.equal(1)
        })
    })

    pit('id', function(){

      var obj = {
        filename: 'filename.um',
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry'],
            content: []
          }]
        }
      }

      return html()(obj)
        .then(function(res){
          res.filename.should.equal('filename.um')
          res.content.body.content[0].type.should.equal('div')
          res.content.body.content[0].attrs['id'].should.equal('strawberry')
          res.content.body.content.length.should.equal(1)
        })
    })

    pit('mixed classes and id', function(){

      var obj = {
        filename: 'filename.um',
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry.banana'],
            content: []
          }]
        }
      }

      return html()(obj)
        .then(function(res){
          res.filename.should.equal('filename.um')
          res.content.body.content[0].type.should.equal('div')
          res.content.body.content[0].attrs['id'].should.equal('strawberry')
          res.content.body.content[0].attrs['class'].should.equal('banana')
          res.content.body.content.length.should.equal(1)
        })
    })
  })



})