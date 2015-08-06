
var read = require('../lib').read

describe('read', function() {

  // promise friendly version of 'it'
  var pit = function(desc, f) {
    it(desc, function(done){
      f().then(function(){
        done()
      }).done(null, done)
    })
  }

  var filename = 'test/um/source1.um'

  pit('should work', function() {
    var expected = [{
      filename: filename,
      content: {
        "content": [
          {
            "type": "test",
            "params": [],
            "content": [
              {
                "type": "button",
                "params": [],
                "content": ["Hello World"]
              }, {
                "type": "inlinedContent",
                "params": [],
                "content": [
                  {
                    "type": "button",
                    "params": [],
                    "content": ["Hello 2"]
                  }, {
                    "type": "last",
                    "params": ["end", "of", "the", "chain"],
                    "content": ["Some content"]
                  }
                ]
              }, {
                "type": "altinline",
                "params": ['source2.um'],
                "content": []
              }, {
                "type": "button",
                "params": [],
                "content": ["Hello World 2"]
              }
            ]
          }
        ]
      }
    }]

    return read(filename)
      .then(function(parsed){
        parsed.should.eql(expected)
      })

  })


  pit('different entity tag kind', function() {
    var filename = 'test/um/source1.um'

    var expected = [{
      filename: filename,
      content: {
        "content": [
          {
            "type": "test",
            "params": [],
            "content": [
              {
                "type": "button",
                "params": [],
                "content": ["Hello World"]
              }, {
                "type": "inline",
                "params": ['source2.um'],
                "content": []
              }, {
                "type": "inlinedContent",
                "params": [],
                "content": [
                  {
                    "type": "button",
                    "params": [],
                    "content": ["Hello 2"]
                  }, {
                    "type": "inline",
                    "params": ["source3.um"],
                    "content": []
                  }
                ]
              }, {
                "type": "button",
                "params": [],
                "content": ["Hello World 2"]
              }
            ]
          }
        ]
      }
    }]

    return read(filename, { entityType: 'altinline' })
      .then(function(parsed){
        parsed.should.eql(expected)
      })

  });


  pit('should read non um files as content', function() {
    var filename = 'test/um/source4.um'

    var expected = [{
      filename: filename,
      content: {
        "content": [
          {
            "type": "test",
            "params": [],
            "content": [
              {
                "type": "button",
                "params": [],
                "content": ["Hello World"]
              }, "Expect", "These", "Lines", "@inline source6.um", {
                "type": "altinline",
                "params": ['source2.um'],
                "content": []
              }, {
                "type": "button",
                "params": [],
                "content": ["Hello World 2"]
              }
            ]
          }
        ]
      }
    }]

    return read(filename)
      .then(function(parsed){
        parsed.should.eql(expected)
      })

  })

  pit('should be able to read non um files as um files with parse specified as the second parameter', function() {
    var filename = 'test/um/source7.um'

    var expected = [{
      filename: filename,
      content: {
        "content": [
          {
            "type": "test",
            "params": [],
            "content": [
              {
                "type": "button",
                "params": [],
                "content": ["Hello World"]
              },
              {
                "type": "inlinedContent",
                "params": [],
                "content": [
                  {
                    "type": "button",
                    "params": [],
                    "content": ["Hello 2"]
                  }
                ]
              },
              "@inlinedContent",
              "  @button: Hello 2",
              {
                "type": "button",
                "params": [],
                "content": ["Hello World 2"]
              }
            ]
          }
        ]
      }
    }]

    return read(filename)
      .then(function(parsed){
        parsed.should.eql(expected)
      })

  })

  pit('should return an error when a file is not found', function() {
    var called = false
    return read('test/um/not-a-source.um')
      .then(function(result){
        // shouldn't even get in here
        result.should.not.be.defined
        called = true
      })
      .catch(function(error) {
        error.should.be.defined
      })
      .then(function() {
        called.should.be.false
      })
  })

  pit('should not inline if inline is false', function() {
    var filename = 'test/um/source2.um'

    var expected = [{
      filename: filename,
      content: {
        content: [
          {
            type: 'inlinedContent',
            params: [],
            content: [
              {
                type: 'button',
                params: [],
                content: ['Hello 2']
              },
              {
                type: 'inline',
                params: ['source3.um'],
                content: []
              }
            ]
          }
        ]
      }
    }]

    return read(filename, {inline: false})
      .then(function(result){
        result.should.eql(expected)
      })
  })
})
