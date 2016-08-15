var chai = require('chai')
var template = require('..')
var should = chai.should()
var quantum = require('quantum-js')

describe('Template', function () {
  // promise friendly version of 'it'
  function pit (desc, f) {
    it(desc, function (done) {
      f().then(function () {
        done()
      }).done(null, done)
    })
  }

  function compare (input, source, expected) {
    return quantum.read(source)
      .map(template({variables: input}))
      .map(function (result) {
        return quantum.read(expected)
          .map(function (expct) {
            result.content.should.eql(expct.content)
          })
      })
  }

  describe('Api', function () {
    it('should return a function when just the options are passed in', function () {
      var options = {}
      template({}).should.not.equal(options)
      template({}).should.be.a.function
    })
  })

  describe('Variable Replacement', function () {
    // basic-content
    pit('should replace a variable within the content of a entity', function () {
      return compare({name: 'Barry'}, 'test/um/basic-content/source.um', 'test/um/basic-content/expected-1.um')
    })

    pit('should replace a variable within the content of a entity with another value', function () {
      return compare({name: 'Bob'}, 'test/um/basic-content/source.um', 'test/um/basic-content/expected-2.um')
    })

    // basic-params
    pit('should replace a variable within the params of a entity', function () {
      return compare({name: 'Barry'}, 'test/um/basic-params/source.um', 'test/um/basic-params/expected-1.um')
    })

    pit('should replace a variable within the params of a entity with another value', function () {
      return compare({name: 'Bob'}, 'test/um/basic-params/source.um', 'test/um/basic-params/expected-2.um')
    })

    // multi-content
    pit('should replace multiple variable with the in the content of a entity', function () {
      return compare({name: 'Barry', named: 'Bob'}, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-1.um')
    })

    pit('should replace muleiplt variable with the in the content of a entity with another value', function () {
      return compare({name: 'Bob'}, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-2.um')
    })

    pit('should replace multiple variable with the in the content of a entity with another value', function () {
      return compare({named: 'Bob'}, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-3.um')
    })

    // multi-params
    pit('should replace multiple variables with the in the params of a entity', function () {
      return compare({name: 'Barry', named: 'Bob'}, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-1.um')
    })

    pit('should replace multiple variables with the in the params of a entity with another value', function () {
      return compare({name: 'Bob'}, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-2.um')
    })

    pit('should replace multiple variables with the in the params of a entity with another value', function () {
      return compare({named: 'Bob'}, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-3.um')
    })

    // deep-variable
    pit('should replace a variable with the in the content of a entity', function () {
      return compare({person: {name: { first: 'Barry'}}}, 'test/um/deep-variable/source.um', 'test/um/deep-variable/expected-1.um')
    })

    pit('should replace a variable with the in the content of a entity with another value', function () {
      return compare({person: {name: { first: 'Bob'}}}, 'test/um/deep-variable/source.um', 'test/um/deep-variable/expected-2.um')
    })
  })

  describe('For Loop', function () {
    pit('should handle for loops with no content', function () {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-empty.um', 'test/um/for-loop/expected-empty.um')
    })

    pit('should handle for loops with basic content', function () {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-simple.um', 'test/um/for-loop/expected-simple.um')
    })

    pit('should handle for loops with more entity content', function () {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-advanced.um', 'test/um/for-loop/expected-advanced.um')
    })

    pit('should handle nested for loops with more entity content', function () {
      return compare({items: ['one', 'two', 'three'], name: 'bob'}, 'test/um/for-loop/source-nested.um', 'test/um/for-loop/expected-nested.um')
    })

    pit('should handle for loops on objects', function () {
      return compare({obj: {Bob: 21, Jan: 24, Dan: 16}}, 'test/um/for-loop/source-object.um', 'test/um/for-loop/expected-object.um')
    })

    pit('should throw when the wrong syntax is used', function () {
      return quantum.read('test/um/for-loop/source-incomplete.um')
        .then(template({}))
        .then(function (res) {
          res.should.not.be.defined
        })
        .catch(function (err) {
          err.should.be.defined
        })
    })

  })

  describe('If Statements', function () {
    pit('should handle if with no content', function () {
      return compare({}, 'test/um/if/source-empty.um', 'test/um/if/expected-empty.um')
    })

    pit('should handle if with no content', function () {
      return compare({}, 'test/um/if/source-invalid.um', 'test/um/if/expected-empty.um')
    })

    pit('should handle if with basic content: true', function () {
      return compare({'public': true}, 'test/um/if/source-simple.um', 'test/um/if/expected-nonempty.um')
    })

    pit('should handle if with basic content: false', function () {
      return compare({'public': false}, 'test/um/if/source-simple.um', 'test/um/if/expected-empty.um')
    })

    pit('should handle if with basic content: undefined', function () {
      return compare({}, 'test/um/if/source-simple.um', 'test/um/if/expected-empty.um')
    })

    pit('should handle if with nested key', function () {
      return compare({site: {'public': true}}, 'test/um/if/source-subproperty.um', 'test/um/if/expected-nonempty.um')
    })

  })

  describe('Ifnot Statements', function () {
    pit('should handle ifnot with no content', function () {
      return compare({}, 'test/um/ifnot/source-empty.um', 'test/um/ifnot/expected-empty.um')
    })

    pit('should handle ifnot with no content', function () {
      return compare({}, 'test/um/ifnot/source-invalid.um', 'test/um/ifnot/expected-nonempty.um')
    })

    pit('should handle ifnot with basic content: true', function () {
      return compare({'public': true}, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-empty.um')
    })

    pit('should handle ifnot with basic content: false', function () {
      return compare({'public': false}, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-nonempty.um')
    })

    pit('should handle ifnot with basic content: undefined', function () {
      return compare({}, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-nonempty.um')
    })

    pit('should handle ifnot with nested key', function () {
      return compare({site: {'public': true}}, 'test/um/ifnot/source-subproperty.um', 'test/um/ifnot/expected-empty.um')
    })

  })

  describe('transclude', function () {
    pit('should transclude {{content}} correctly', function () {
      return compare({}, 'test/um/transclude/source.um', 'test/um/transclude/expected.um')
    })
  })

})
