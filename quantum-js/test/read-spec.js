var read = require('../lib').read
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var should = chai.should()

describe('read', function () {
  var filename = 'test/um/source1.um'

  it('should work', function () {
    var expected = [{
      filename: filename,
      content: {
        'content': [
          {
            'type': 'test',
            'params': [],
            'content': [
              {
                'type': 'button',
                'params': [],
                'content': ['Hello World']
              }, {
                'type': 'inlinedContent',
                'params': [],
                'content': [
                  {
                    'type': 'button',
                    'params': [],
                    'content': ['Hello 2']
                  }, {
                    'type': 'last',
                    'params': ['end', 'of', 'the', 'chain'],
                    'content': ['Some content']
                  }
                ]
              }, {
                'type': 'altinline',
                'params': ['source2.um'],
                'content': []
              }, {
                'type': 'button',
                'params': [],
                'content': ['Hello World 2']
              }
            ]
          }
        ]
      }
    }]

    return read(filename).should.eventually.eql(expected)

  })

  it('different entity tag kind', function () {
    var filename = 'test/um/source1.um'

    var expected = [{
      filename: filename,
      content: {
        'content': [
          {
            'type': 'test',
            'params': [],
            'content': [
              {
                'type': 'button',
                'params': [],
                'content': ['Hello World']
              }, {
                'type': 'inline',
                'params': ['source2.um'],
                'content': []
              }, {
                'type': 'inlinedContent',
                'params': [],
                'content': [
                  {
                    'type': 'button',
                    'params': [],
                    'content': ['Hello 2']
                  }, {
                    'type': 'inline',
                    'params': ['source3.um'],
                    'content': []
                  }
                ]
              }, {
                'type': 'button',
                'params': [],
                'content': ['Hello World 2']
              }
            ]
          }
        ]
      }
    }]

    return read(filename, { inlineEntityType: 'altinline' }).should.eventually.eql(expected)

  })

  it('should read non um files as content', function () {
    var filename = 'test/um/source4.um'

    var expected = [{
      filename: filename,
      content: {
        'content': [
          {
            'type': 'test',
            'params': [],
            'content': [
              {
                'type': 'button',
                'params': [],
                'content': ['Hello World']
              }, 'Expect', 'These', 'Lines', '@inline source6.um', {
                'type': 'altinline',
                'params': ['source2.um'],
                'content': []
              }, {
                'type': 'button',
                'params': [],
                'content': ['Hello World 2']
              }
            ]
          }
        ]
      }
    }]

    return read(filename).should.eventually.eql(expected)

  })

  it('should be able to read non um files as um files with parse specified as the second parameter', function () {
    var filename = 'test/um/source7.um'

    var expected = [{
      filename: filename,
      content: {
        'content': [
          {
            'type': 'test',
            'params': [],
            'content': [
              {
                'type': 'button',
                'params': [],
                'content': ['Hello World']
              },
              {
                'type': 'inlinedContent',
                'params': [],
                'content': [
                  {
                    'type': 'button',
                    'params': [],
                    'content': ['Hello 2']
                  }
                ]
              },
              '@inlinedContent',
              '  @button: Hello 2',
              {
                'type': 'button',
                'params': [],
                'content': ['Hello World 2']
              }
            ]
          }
        ]
      }
    }]

    return read(filename).should.eventually.eql(expected)

  })

  it('should return an error when a file is not found', function () {
    return read.single('test/um/not-a-source.um').should.be.rejected
  })

  it('should return an empty array when a file is not found - when using glob', function () {
    return read('test/um/not-a-source.um').should.eventually.eql([])
  })

  it('should not inline if inline is false', function () {
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

    return read(filename, {inline: false}).should.eventually.eql(expected)

  })
})
