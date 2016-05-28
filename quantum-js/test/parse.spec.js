var chai = require('chai')
var should = chai.should()
var parse = require('../lib').parse
var tokenize = parse.tokenize
var ast = parse.ast

function selection (x) {
  return {
    content: x
  }
}

describe('parse', function () {
  describe('tokenize', function () {
    it('should detect a type correctly', function () {
      tokenize('@type').should.eql([
        { type: 'TYPE', value: 'type'}
      ])
    })

    it('should detect a type with params', function () {
      tokenize('@fruits apple kiwi cherry lime').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'apple kiwi cherry lime'}
      ])
    })

    it('should detect a type with params (followed by colon)', function () {
      tokenize('@fruits apple kiwi cherry:').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'apple kiwi cherry'},
        { type: 'START_SAME_LINE_CONTENT'}
      ])
    })

    it('should detect a type with params (followed by colon)', function () {
      tokenize('@fruits apple kiwi cherry:\n@veg').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'apple kiwi cherry'},
        { type: 'START_SAME_LINE_CONTENT'},
        { type: 'END_SAME_LINE_CONTENT'},
        { type: 'TYPE', value: 'veg'}
      ])
    })

    it('should detect a type with params (followed by newline)', function () {
      tokenize('@fruits apple kiwi cherry\n').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'apple kiwi cherry'}
      ])
    })

    it('should detect a type with params (in parenths)', function () {
      tokenize('@fruits(apple kiwi cherry)').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'apple kiwi cherry'}
      ])
    })

    it('should throw an error for incomplete param brackets', function () {
      chai.expect(function () {tokenize('@fruits(apple kiwi cherry')}).to.throw()
    })

    it('should detect a type with content (in parenths)', function () {
      tokenize('@fruits[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry'},
        { type: 'END_INLINE_CONTENT'}
      ])
    })

    it('should detect a type with content (in parenths)', function () {
      tokenize('@fruits[apple kiwi cherry]  @fruits[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry'},
        { type: 'END_INLINE_CONTENT'},
        { type: 'CONTENT', value: '  '},
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry'},
        { type: 'END_INLINE_CONTENT'}
      ])
    })

    it('inline should ignore @', function () {
      tokenize('@fruits[apple kiwi cherry @fruits]').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry @fruits'},
        { type: 'END_INLINE_CONTENT'}
      ])
    })

    it('inline should handle escaped brackets in content', function () {
      tokenize('@fruits[apple kiwi cherry @fruits[apple kiwi cherry\\]]').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry @fruits[apple kiwi cherry]'},
        { type: 'END_INLINE_CONTENT'}
      ])
    })

    it('should detect a type with content (in parenths)', function () {
      tokenize('@fruits(lemon lime)[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'lemon lime'},
        { type: 'START_INLINE_CONTENT'},
        { type: 'CONTENT', value: 'apple kiwi cherry'},
        { type: 'END_INLINE_CONTENT'}
      ])
    })

    it('should throw an error for incomplete content brackets', function () {
      chai.expect(function () {tokenize('@fruits[juice')}).to.throw()
    })

    it('should throw an error for incomplete content brackets', function () {
      chai.expect(function () {tokenize('@fruits(apple)[juice')}).to.throw()
    })

    it('should detect an indent after an entity', function () {
      tokenize('@fruits\n  @veg').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'}
      ])
    })

    it('should detect a dedent after an entity', function () {
      tokenize('@fruits\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'},
        { type: 'DEDENT', value: 2},
        { type: 'TYPE', value: 'pudding'}
      ])
    })

    it('should not mind how much indentation is used', function () {
      tokenize('@fruits\n        @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 8},
        { type: 'TYPE', value: 'veg'},
        { type: 'DEDENT', value: 8},
        { type: 'TYPE', value: 'pudding'}
      ])
    })

    it('when indentation stays the same, no INDENT or DEDENT should be emitted', function () {
      tokenize('@fruits\n  @veg\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'},
        { type: 'TYPE', value: 'veg'},
        { type: 'DEDENT', value: 2},
        { type: 'TYPE', value: 'pudding'}
      ])
    })

    it('the correct number of dedents should be emitted when dropping back multiple levels', function () {
      tokenize('@fruits\n  @veg\n    @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'},
        { type: 'DEDENT', value: 2},
        { type: 'DEDENT', value: 2},
        { type: 'TYPE', value: 'pudding'}
      ])
    })

    it('indent should not be called for non entity content (except when directly following an entity tag)', function () {
      tokenize('@fruits\n  indent\n    indent\n       alsoindent\n  dedent\ndedent').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'indent'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'indent'},
        { type: 'INDENT', value: 3},
        { type: 'CONTENT', value: 'alsoindent'},
        { type: 'DEDENT', value: 3},
        { type: 'DEDENT', value: 2},
        { type: 'CONTENT', value: 'dedent'},
        { type: 'DEDENT', value: 2},
        { type: 'CONTENT', value: 'dedent'}
      ])
    })

    it('indent should be able to drop back through multiple indent levels', function () {
      tokenize('@fruits\n  indent\n    indent\n       alsoindent\ndedent').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'indent'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'indent'},
        { type: 'INDENT', value: 3},
        { type: 'CONTENT', value: 'alsoindent'},
        { type: 'DEDENT', value: 3},
        { type: 'DEDENT', value: 2},
        { type: 'DEDENT', value: 2},
        { type: 'CONTENT', value: 'dedent'}
      ])
    })

    it('messed up indentation should throw an error', function () {
      chai.expect(function () {tokenize('@fruits\n  indent\n    indent\n       alsoindent\n dedent')}).to.throw()
    })

    it('should parse comments correctly', function () {
      tokenize('@fruits\n  #comment\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'COMMENT', value: 'comment'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'indent'}
      ])
    })

    it('comment escaping should work correctly', function () {
      tokenize('@fruits\n  \\#content\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: '#content'},
        { type: 'CONTENT', value: 'indent'}
      ])
    })

    it('at this stage should not care about parameter grouping', function () {
      tokenize('@fruits [one two three] four').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: '[one two three] four'}
      ])
    })

    it('should handle same line content', function () {
      tokenize('@fruits: kiwi lemon orange').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'kiwi lemon orange'}
      ])
    })

    it('should handle same line content', function () {
      tokenize('@fruits: orange\n  quince').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange'},
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'quince'}
      ])
    })

    it('should inline followed by a newline', function () {
      tokenize('@fruits: @ripe[banana]\n  @veg: parsnip').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'ripe'},
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'banana'},
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'parsnip'}
      ])
    })

    it('should handle empty lines correctly', function () {
      tokenize('@fruits ripe\n\n  @banana\n  \n  @lychee').should.eql([
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'ripe'},
        { type: 'EMPTY_CONTENT', value: ''},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'banana'},
        { type: 'EMPTY_CONTENT', value: '  '},
        { type: 'TYPE', value: 'lychee'},
      ])
    })

    it('should emit the correct type for escaping', function () {
      tokenize('@(@escaped)').should.eql([
        {type: 'TYPE', value: ''},
        {type: 'PARAMS', value: '@escaped'}
      ])
    })

    it('two inline, then indented newline', function () {
      tokenize('@one: @two\n  @three').should.eql([
        {type: 'TYPE', value: 'one'},
        { type: 'START_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'two'},
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        {type: 'TYPE', value: 'three'}
      ])
    })

    it('three inline, then newline', function () {
      tokenize('@one: @two: @three\n@four').should.eql([
        {type: 'TYPE', value: 'one'},
        { type: 'START_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'two'},
        { type: 'START_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'three'},
        { type: 'END_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'four'}
      ])
    })

    it('three inline, then params, then newline', function () {
      tokenize('@one: @two: @three params!\n@four').should.eql([
        {type: 'TYPE', value: 'one'},
        { type: 'START_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'two'},
        { type: 'START_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'three'},
        {type: 'PARAMS', value: 'params!'},
        { type: 'END_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'four'}
      ])
    })

    it('two entities not indented', function () {
      tokenize('@one\n@two').should.eql([
        {type: 'TYPE', value: 'one'},
        {type: 'TYPE', value: 'two'}
      ])
    })

    it('two entities not indented with colon', function () {
      tokenize('@one:\n@two').should.eql([
        {type: 'TYPE', value: 'one'},
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        {type: 'TYPE', value: 'two'}
      ])
    })

    it('@@ should not parse any of the content', function () {
      tokenize('@@one\n  @two').should.eql([
        { type: 'TYPE', value: 'one'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: '@two'}
      ])
    })

    it('it should resume parsing like normal after an @@ block', function () {
      tokenize('@@one\n  @two\n@three').should.eql([
        { type: 'TYPE', value: 'one'},
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '@two'},
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'three' },
      ])
    })

  })

  describe('ast', function () {
    it('should build a basic type entity', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'}
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: [],
        content: []
      }]))

    })

    it('basic entities one after another', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'TYPE', value: 'veg'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: []
        },
        {
          type: 'veg',
          params: [],
          content: []
        }
      ]))

    })

    it('basic entity with params', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'kiwi lemon'}
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: ['kiwi', 'lemon'],
        content: []
      }]))

    })

    it('basic indented entities', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'}
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: [],
        content: [{
          type: 'veg',
          params: [],
          content: []
        }]
      }]))

    })

    it('basic indented then dedented entities', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg'},
        { type: 'DEDENT', value: 2},
        { type: 'TYPE', value: 'meat'},
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [{
            type: 'veg',
            params: [],
            content: []
          }]
        },
        {
          type: 'meat',
          params: [],
          content: []
        }
      ]))

    })

    it('non type indentations should be ignored', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'banana'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'kiwi'},
        { type: 'DEDENT', value: 2},
        { type: 'CONTENT', value: 'lime'},
        { type: 'TYPE', value: 'veg'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'carrots'},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'brocolli'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            'banana',
            '  kiwi',
            'lime',
            {
              type: 'veg',
              params: [],
              content: [
                'carrots',
                '  brocolli'
              ]
            }
          ]
        }
      ]))
    })

    it('non type indentations should be ignored', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { 'type': 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange'},
        { 'type': 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'quince'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            'orange',
            'quince'
          ]
        }
      ]))
    })

    // @fruits: @ripe[banana]\n  @veg: parsnip

    it('inline followed by indented newline', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'ripe'},
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'banana'},
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'veg' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'parsnip'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            {
              type: 'ripe',
              params: [],
              content: ['banana']
            },
            {
              type: 'veg',
              params: [],
              content: ['parsnip']
            }
          ]
        }
      ]))
    })

    it('empty line following newline', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'CONTENT', value: ''},
        { type: 'INDENT', value: 2},
        { type: 'CONTENT', value: 'banana'},
        { type: 'DEDENT', value: 2},
        { type: 'CONTENT', value: ''},
        { type: 'CONTENT', value: 'strawberry'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            '',
            'banana'
          ]
        },
        '',
        'strawberry'
      ]))
    })

    it('should emit the correct tokens for escaping', function () {
      tokens = [
        { type: 'TYPE', value: ''},
        { type: 'PARAMS', value: '@escaped'}
      ]

      ast(tokens).should.eql(selection([
        '@escaped'
      ]))
    })

    it('should emit the correct tokens for escaping 2', function () {
      tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: ''},
        { type: 'PARAMS', value: '@escaped'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            '@escaped'
          ]
        }
      ]))
    })

    it('three inline, then newline entity', function () {
      tokens = [
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'three' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'four' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'one',
          params: [],
          content: [
            {
              type: 'two',
              params: [],
              content: [
                {
                  type: 'three',
                  params: [],
                  content: []
                }
              ]
            }
          ]
        },
        {
          type: 'four',
          params: [],
          content: []
        }
      ]))
    })

    it('three inline, then parameter then newline entity', function () {
      tokens = [
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'three' },
        { type: 'PARAMS', value: 'params!' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'four' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'one',
          params: [],
          content: [
            {
              type: 'two',
              params: [],
              content: [
                {
                  type: 'three',
                  params: ['params!'],
                  content: []
                }
              ]
            }
          ]
        },
        {
          type: 'four',
          params: [],
          content: []
        }
      ]))
    })

    it('should handle empty lines correctly', function () {
      var tokens = [
        { type: 'TYPE', value: 'fruits'},
        { type: 'PARAMS', value: 'ripe'},
        { type: 'EMPTY_CONTENT', value: ''},
        { type: 'INDENT', value: 2},
        { type: 'TYPE', value: 'banana'},
        { type: 'EMPTY_CONTENT', value: '  '},
        { type: 'TYPE', value: 'lychee'}
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: ['ripe'],
          content: [
            '',
            {
              type: 'banana',
              params: [],
              content: []
            },
            '  ',
            {
              type: 'lychee',
              params: [],
              content: []
            }
          ]
        }
      ]))
    })

  })

  describe('full parse', function () {
    it('should parse a tag with no parameters', function () {
      var expected, source
      source = '@button'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should include whitespace only lines when parsing', function () {
      var expected, source
      source = '@button\n\n@button'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': []
        }, '', {
          'type': 'button',
          'params': [],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse a single paramter correctly', function () {
      var expected, source
      source = '@button positive'
      expected = selection([
        {
          'type': 'button',
          'params': ['positive'],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse a multiple paramters correctly', function () {
      var expected, source
      source = '@tags bug enhancement feature-request'
      expected = selection([
        {
          'type': 'tags',
          'params': ['bug', 'enhancement', 'feature-request'],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should ignore lines starting with # (by default)', function () {
      var expected, source
      source = '# @tags bug enhancement feature-request'
      expected = selection([])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse text as text', function () {
      var expected, source
      source = '@tags\n  line 1\n    line 2\n  line 3'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': ['line 1', '  line 2', 'line 3']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse nested types', function () {
      var expected, source
      source = '@tags\n  @tag a\n    line 1\n  @tag b'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': ['a'],
              'content': ['line 1']
            }, {
              'type': 'tag',
              'params': ['b'],
              'content': []
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse nested types with inconsistent indentation levels', function () {
      var expected, source
      source = '@tags\n  @tag a\n          @tag b\n            bcontent\n          @tag c\n              content1\n                content2\n              content3'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': ['a'],
              'content': [
                {
                  'type': 'tag',
                  'params': ['b'],
                  'content': ['bcontent']
                }, {
                  'type': 'tag',
                  'params': ['c'],
                  'content': ['content1', '  content2', 'content3']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content', function () {
      var expected, source
      source = '@tags: content'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content a parameter', function () {
      var expected, source
      source = '@tags param: content'
      expected = selection([
        {
          'type': 'tags',
          'params': ['param'],
          'content': ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content with parameters', function () {
      var expected, source
      source = '@tags param1 param2: content'
      expected = selection([
        {
          'type': 'tags',
          'params': ['param1', 'param2'],
          'content': ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple parameters', function () {
      var expected, source
      source = '@tags [[param1] [param2 param3]]'
      expected = selection([
        {
          'type': 'tags',
          'params': ['[param1] [param2 param3]'],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should ignore whitespace between type and params', function () {
      var expected, source
      source = '@tags     param'
      expected = selection([
        {
          'type': 'tags',
          'params': ['param'],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse mixed single line content and multiple line content', function () {
      var expected, source
      source = '@tags: content1\n  content2'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': ['content1', 'content2']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should pass the mega test', function () {
      var expected, source
      source = '@tags\n  @tag a\n    line 1\n    @t a\n    @t: b\n  @tag b\n    @x y z: a\n      b\n        c\n      d\n\n          e'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': ['a'],
              'content': [
                'line 1', {
                  'type': 't',
                  'params': ['a'],
                  'content': []
                }, {
                  'type': 't',
                  'params': [],
                  'content': ['b']
                }
              ]
            }, {
              'type': 'tag',
              'params': ['b'],
              'content': [
                {
                  'type': 'x',
                  'params': ['y', 'z'],
                  'content': ['a', 'b', '  c', 'd', '', '    e']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('multiple tags at the same level', function () {
      var expected, source
      source = '@tags\n  @taga\n  @tagb\n  @tagc\n  @taga'
      expected = selection([
        {
          'type': 'tags',
          'params': [],
          'content': [
            {
              'type': 'taga',
              'params': [],
              'content': []
            }, {
              'type': 'tagb',
              'params': [],
              'content': []
            }, {
              'type': 'tagc',
              'params': [],
              'content': []
            }, {
              'type': 'taga',
              'params': [],
              'content': []
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple entities that start on the same line', function () {
      var expected, source
      source = '@button: @tag: content'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': [],
              'content': ['content']
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple entities that start on the same line, then continue parsing content on the next line', function () {
      var expected, source
      source = '@button: @tag: content\n  @tag2: content2'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': [],
              'content': [
                'content', {
                  'type': 'tag2',
                  'params': [],
                  'content': ['content2']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse an inline entity, followed by a new line entity correctly', function () {
      var expected, source
      source = '@button: @tag[content]\n  @tag2: content2'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            {
              'type': 'tag',
              'params': [],
              'content': ['content']
            }, {
              'type': 'tag2',
              'params': [],
              'content': ['content2']
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities (just single param)', function () {
      var expected, source
      source = "@button: Click this: @button(positive) Or don't."
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            'Click this: ', {
              'type': 'button',
              'params': ['positive'],
              'content': []
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities (multiple params)', function () {
      var expected, source
      source = "@button: Click this: @button(positive inverse) Or don't."
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            'Click this: ', {
              'type': 'button',
              'params': ['positive', 'inverse'],
              'content': []
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities', function () {
      var expected, source
      source = "@button: Click this: @button(positive)[content] Or don't."
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': [
            'Click this: ', {
              'type': 'button',
              'params': ['positive'],
              'content': ['content']
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse array parameters', function () {
      var expected, source
      source = '@button a [b c] d [e f g]'
      expected = selection([
        {
          'type': 'button',
          'params': ['a', 'b c', 'd', 'e f g'],
          'content': []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should throw warning when the indentation is messed up', function () {
      var source
      source = '@button\n      @button\n    @button\n  @button\n@button'
      chai.expect(function () {
        return parse(source)
      }).to.throw()
    })

    it('should handle dropping back indentation before an entity with newlines', function () {
      var expected, source
      source = '@button\n\n  some content\n\nmore content'
      expected = selection([
        {
          'type': 'button',
          'params': [],
          'content': ['', 'some content']
        }, '', 'more content'
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle escaping', function () {
      var expected, source
      source = '@fruits\n  @(@escaped)'
      expected = selection([
        {
          'type': 'fruits',
          'params': [],
          'content': ['@escaped']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should detect newlines after inline entities', function () {
      var expected, source
      source = '@titlebar: @title(Test)\n\n@js\n  hx.notify().info("Hi");'
      expected = selection([
        {
          type: 'titlebar',
          params: [],
          content: [
            {
              type: 'title',
              params: ['Test'],
              content: []
            }
          ]
        }, '', {
          type: 'js',
          params: [],
          content: ['hx.notify().info("Hi");']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle content with square bracket followed by non whitespace', function () {
      var expected, source
      source = '[] this is fine'
      expected = {
        content: ['[] this is fine']
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle content with square bracket followed by non whitespace', function () {
      var expected, source
      source = '@content\n  [] this is fine'
      expected = {
        content: [
          {
            type: 'content',
            params: [],
            content: ['[] this is fine']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle content with square bracket followed by non whitespace', function () {
      var expected, source
      source = '] ;'
      expected = {
        content: ['] ;']
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('inline should work with square brackets after', function () {
      var expected, source
      source = '@type[content] []'
      expected = {
        content: [
          {
            type: 'type',
            params: [],
            content: ['content']
          }, ' []'
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('colon in an escaped parameter should be fine', function () {
      var expected, source
      source = '@link [http://example.com]: example.com'
      expected = {
        content: [
          {
            type: 'link',
            params: ['http://example.com'],
            content: ['example.com']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('colon in an escaped parameter should be fine (newline content)', function () {
      var expected, source
      source = '@link [http://example.com]\n  example.com'
      expected = {
        content: [
          {
            type: 'link',
            params: ['http://example.com'],
            content: ['example.com']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('colon in an inline escaped parameter should be fine', function () {
      var expected, source
      source = '@link([http://example.com])[example.com]'
      expected = {
        content: [
          {
            type: 'link',
            params: ['http://example.com'],
            content: ['example.com']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('colon in an inline parameter list should be fine', function () {
      var expected, source
      source = '@link(http://example.com)[example.com]'
      expected = {
        content: [
          {
            type: 'link',
            params: ['http://example.com'],
            content: ['example.com']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should be able to parse parameter strings containing brackets', function () {
      var expected, source
      source = '@default [rgba(255, 255, 255, 0.5)]: Content'
      expected = {
        content: [
          {
            type: 'default',
            params: ['rgba(255, 255, 255, 0.5)'],
            content: ['Content']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should be able to parse parameter strings containing brackets', function () {
      var expected, source
      source = '@default rgba(255, 255, 255, 0.5): Content'
      expected = {
        content: [
          {
            type: 'default',
            params: ['rgba(255,', '255,', '255,', '0.5)'],
            content: ['Content']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('escaping should work for nested closing square brackets', function () {
      var expected, source
      source = '@thing[[1, 2, 3\\]]'
      expected = {
        content: [
          {
            type: 'thing',
            params: [],
            content: ['[1, 2, 3]']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('nested square brackets should be allowed', function () {
      var expected, source
      source = '@thing: [1, 2, 3]'
      expected = {
        content: [
          {
            type: 'thing',
            params: [],
            content: ['[1, 2, 3]']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('square brackets should be allowed in regular content', function () {
      var expected, source
      source = '@thing: 1, [2, 3]'
      expected = {
        content: [
          {
            type: 'thing',
            params: [],
            content: ['1, [2, 3]']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('deal with empty newlines', function () {
      var source = '@tag hello\n\n  @tag-a\n  \n  @tag-b'
      var expected = {
        content: [
          {
            type: 'tag',
            params: ['hello'],
            content: [
              '',
              {
                type: 'tag-a',
                params: [],
                content: []
              },
              '  ',
              {
                type: 'tag-b',
                params: [],
                content: []
              }
            ]
          }
        ]
      }

      chai.expect(parse(source)).to.eql(expected)
    })

    it('should have correct indentation when multiple entities on the same line are followed by another line', function () {
      var source = '@one: @two\n@three'
      var expected = {
        content: [
          {
            type: 'one',
            params: [],
            content: [
              {
                type: 'two',
                params: [],
                content: []
              }
            ]
          },
          {
            type: 'three',
            params: [],
            content: []
          }
        ]
      }

      chai.expect(parse(source)).to.eql(expected)
    })

  })

})
