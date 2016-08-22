const chai = require('chai')
const template = require('..')
const quantum = require('quantum-js')

const should = chai.should()

describe('Template', () => {
  function compare (input, source, expected) {
    return quantum.read.page(source)
      .then(template({variables: input}))
      .then((result) => {
        return quantum.read(expected)
          .then((expct) => {
            result.content.should.eql(expct)
          })
      })
  }

  describe('Api', () => {
    it('should return a function when just the options are passed in', () => {
      const options = {}
      template({}).should.not.equal(options)
      template({}).should.be.a.function
    })
  })

  describe('Variable Replacement', () => {
    // basic-content
    it('should replace a variable within the content of a entity', () => {
      return compare({name: 'Barry'}, 'test/um/basic-content/source.um', 'test/um/basic-content/expected-1.um')
    })

    it('should replace a variable within the content of a entity with another value', () => {
      return compare({name: 'Bob'}, 'test/um/basic-content/source.um', 'test/um/basic-content/expected-2.um')
    })

    // basic-params
    it('should replace a variable within the params of a entity', () => {
      return compare({name: 'Barry'}, 'test/um/basic-params/source.um', 'test/um/basic-params/expected-1.um')
    })

    it('should replace a variable within the params of a entity with another value', () => {
      return compare({name: 'Bob'}, 'test/um/basic-params/source.um', 'test/um/basic-params/expected-2.um')
    })

    // multi-content
    it('should replace multiple variable with the in the content of a entity', () => {
      return compare({ name: 'Barry', named: 'Bob' }, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-1.um')
    })

    it('should replace muleiplt variable with the in the content of a entity with another value', () => {
      return compare({ name: 'Bob' }, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-2.um')
    })

    it('should replace multiple variable with the in the content of a entity with another value', () => {
      return compare({ named: 'Bob' }, 'test/um/multi-content/source.um', 'test/um/multi-content/expected-3.um')
    })

    // multi-params
    it('should replace multiple variables with the in the params of a entity', () => {
      return compare({ name: 'Barry', named: 'Bob' }, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-1.um')
    })

    it('should replace multiple variables with the in the params of a entity with another value', () => {
      return compare({ name: 'Bob' }, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-2.um')
    })

    it('should replace multiple variables with the in the params of a entity with another value', () => {
      return compare({ named: 'Bob' }, 'test/um/multi-params/source.um', 'test/um/multi-params/expected-3.um')
    })

    // deep-variable
    it('should replace a variable with the in the content of a entity', () => {
      return compare({ person: { name: { first: 'Barry' } } }, 'test/um/deep-variable/source.um', 'test/um/deep-variable/expected-1.um')
    })

    it('should replace a variable with the in the content of a entity with another value', () => {
      return compare({ person: { name: { first: 'Bob' } } }, 'test/um/deep-variable/source.um', 'test/um/deep-variable/expected-2.um')
    })
  })

  describe('For Loop', () => {
    it('should handle for loops with no content', () => {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-empty.um', 'test/um/for-loop/expected-empty.um')
    })

    it('should handle for loops with basic content', () => {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-simple.um', 'test/um/for-loop/expected-simple.um')
    })

    it('should handle for loops with more entity content', () => {
      return compare({items: ['one', 'two', 'three']}, 'test/um/for-loop/source-advanced.um', 'test/um/for-loop/expected-advanced.um')
    })

    it('should handle nested for loops with more entity content', () => {
      return compare({items: ['one', 'two', 'three'], name: 'bob'}, 'test/um/for-loop/source-nested.um', 'test/um/for-loop/expected-nested.um')
    })

    it('should handle for loops on objects', () => {
      return compare({obj: {Bob: 21, Jan: 24, Dan: 16}}, 'test/um/for-loop/source-object.um', 'test/um/for-loop/expected-object.um')
    })

    it('should throw when the wrong syntax is used', () => {
      return quantum.read('test/um/for-loop/source-incomplete.um')
        .then(template({}))
        .then((res) => {
          should.not.exist(res)
        })
        .catch((err) => {
          err.should.be.defined
        })
    })
  })

  describe('If Statements', () => {
    it('should handle if with no content', () => {
      return compare({}, 'test/um/if/source-empty.um', 'test/um/if/expected-empty.um')
    })

    it('should handle if with no content', () => {
      return compare({}, 'test/um/if/source-invalid.um', 'test/um/if/expected-empty.um')
    })

    it('should handle if with basic content: true', () => {
      return compare({ public: true }, 'test/um/if/source-simple.um', 'test/um/if/expected-nonempty.um')
    })

    it('should handle if with basic content: false', () => {
      return compare({ public: false }, 'test/um/if/source-simple.um', 'test/um/if/expected-empty.um')
    })

    it('should handle if with basic content: undefined', () => {
      return compare({}, 'test/um/if/source-simple.um', 'test/um/if/expected-empty.um')
    })

    it('should handle if with nested key', () => {
      return compare({site: { public: true }}, 'test/um/if/source-subproperty.um', 'test/um/if/expected-nonempty.um')
    })
  })

  describe('Ifnot Statements', () => {
    it('should handle ifnot with no content', () => {
      return compare({}, 'test/um/ifnot/source-empty.um', 'test/um/ifnot/expected-empty.um')
    })

    it('should handle ifnot with no content', () => {
      return compare({}, 'test/um/ifnot/source-invalid.um', 'test/um/ifnot/expected-nonempty.um')
    })

    it('should handle ifnot with basic content: true', () => {
      return compare({ public: true }, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-empty.um')
    })

    it('should handle ifnot with basic content: false', () => {
      return compare({ public: false }, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-nonempty.um')
    })

    it('should handle ifnot with basic content: undefined', () => {
      return compare({}, 'test/um/ifnot/source-simple.um', 'test/um/ifnot/expected-nonempty.um')
    })

    it('should handle ifnot with nested key', () => {
      return compare({site: { public: true }}, 'test/um/ifnot/source-subproperty.um', 'test/um/ifnot/expected-empty.um')
    })
  })

  describe('Param indexing', () => {
    it('should handle indexed parameters', () => {
      return compare({}, 'test/um/param-indexing/source.um', 'test/um/param-indexing/expected-1.um')
    })
  })

  describe('Content indexing', () => {
    it('should handle indexed content', () => {
      return compare({}, 'test/um/content-indexing/source.um', 'test/um/content-indexing/expected-1.um')
    })
  })
})
