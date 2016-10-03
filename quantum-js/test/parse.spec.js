'use strict'
const chai = require('chai')
chai.should()

const quantum = require('..')
const parse = quantum.parse
const tokenize = parse.tokenize
const ast = parse.ast

function selection (x) {
  return {
    content: x
  }
}

describe('parse', () => {
  describe('tokenize', () => {
    it('should detect a type correctly', () => {
      tokenize('@type').should.eql([
        { type: 'TYPE', value: 'type' }
      ])
    })

    it('should detect a type with params', () => {
      tokenize('@fruits apple kiwi cherry lime').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry lime' }
      ])
    })

    it('should detect a type with params (followed by colon)', () => {
      tokenize('@fruits apple kiwi cherry:').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' },
        { type: 'START_SAME_LINE_CONTENT' }
      ])
    })

    it('should detect a type with params (followed by colon)', () => {
      tokenize('@fruits apple kiwi cherry:\n@veg').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'veg' }
      ])
    })

    it('should detect a type with params (followed by newline)', () => {
      tokenize('@fruits apple kiwi cherry\n').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' }
      ])
    })

    it('should detect a type with params (in parenths)', () => {
      tokenize('@fruits(apple kiwi cherry)').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' }
      ])
    })

    it('should throw an error for incomplete param brackets', () => {
      chai.expect(() => {
        tokenize('@fruits(apple kiwi cherry')
      }).to.throw()
    })

    it('should detect a type with content (in parenths)', () => {
      tokenize('@fruits[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('should detect a type with content (in parenths)', () => {
      tokenize('@fruits[apple kiwi cherry]  @fruits[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: '  ' },
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('inline should ignore @', () => {
      tokenize('@fruits[apple kiwi cherry @fruits]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry @fruits' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('inline should handle escaped brackets in content', () => {
      tokenize('@fruits[apple kiwi cherry @fruits\\[apple kiwi cherry\\]]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry @fruits[apple kiwi cherry]' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('should detect a type with content (in parenths)', () => {
      tokenize('@fruits(lemon lime)[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'lemon lime' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('should throw an error for incomplete content brackets', () => {
      chai.expect(() => {
        tokenize('@fruits[juice')
      }).to.throw()
    })

    it('should throw an error for incomplete content brackets', () => {
      chai.expect(() => {
        tokenize('@fruits(apple)[juice')
      }).to.throw()
    })

    it('should detect an indent after an entity', () => {
      tokenize('@fruits\n  @veg').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' }
      ])
    })

    it('should detect a dedent after an entity', () => {
      tokenize('@fruits\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('should not mind how much indentation is used', () => {
      tokenize('@fruits\n        @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 8 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 8 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('when indentation stays the same, no INDENT or DEDENT should be emitted', () => {
      tokenize('@fruits\n  @veg\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('the correct number of dedents should be emitted when dropping back multiple levels', () => {
      tokenize('@fruits\n  @veg\n    @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('indent should not be called for non entity content (except when directly following an entity tag)', () => {
      tokenize('@fruits\n  indent\n    indent\n       alsoindent\n  dedent\ndedent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' },
        { type: 'INDENT', value: 3 },
        { type: 'CONTENT', value: 'alsoindent' },
        { type: 'DEDENT', value: 3 },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'dedent' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'dedent' }
      ])
    })

    it('indent should be able to drop back through multiple indent levels', () => {
      tokenize('@fruits\n  indent\n    indent\n       alsoindent\ndedent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' },
        { type: 'INDENT', value: 3 },
        { type: 'CONTENT', value: 'alsoindent' },
        { type: 'DEDENT', value: 3 },
        { type: 'DEDENT', value: 2 },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'dedent' }
      ])
    })

    it('messed up indentation should throw an error', () => {
      chai.expect(() => {
        tokenize('@fruits\n  indent\n    indent\n       alsoindent\n dedent\ndedent\ndedent\ndedent')
      }).to.throw()
    })

    it('messed up indentation should throw an error (should show the surrounding lines)', () => {
      chai.expect(() => {
        tokenize('@fruits\n  indent\n    indent\n       alsoindent\n dedent\ndedent\ndedent\ndedent\ndedent')
      }).to.throw()
    })

    it('should parse comments correctly', () => {
      tokenize('@fruits\n  #comment\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'COMMENT', value: 'comment' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' }
      ])
    })

    it('comment escaping should work correctly', () => {
      tokenize('@fruits\n  \\#content\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '#content' },
        { type: 'CONTENT', value: 'indent' }
      ])
    })

    it('at this stage should not care about parameter grouping', () => {
      tokenize('@fruits [one two three] four').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: '[one two three] four' }
      ])
    })

    it('should handle same line content', () => {
      tokenize('@fruits: kiwi lemon orange').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'kiwi lemon orange' }
      ])
    })

    it('should handle same line content', () => {
      tokenize('@fruits: orange\n  quince').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'quince' }
      ])
    })

    it('should inline followed by a newline', () => {
      tokenize('@fruits: @ripe[banana]\n  @veg: parsnip').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'ripe' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'banana' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'parsnip' }
      ])
    })

    it('should inline followed by a newline', () => {
      tokenize('@container\n  @fruits: @ripe[banana]\n    @veg: parsnip').should.eql([
        { type: 'TYPE', value: 'container' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'ripe' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'banana' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'parsnip' }
      ])
    })

    it('should handle empty lines correctly', () => {
      tokenize('@fruits ripe\n\n  @banana\n  \n  @lychee').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'ripe' },
        { type: 'EMPTY_CONTENT', value: '' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'banana' },
        { type: 'EMPTY_CONTENT', value: '  ' },
        { type: 'TYPE', value: 'lychee' }
      ])
    })

    it('should emit the correct type for escaping', () => {
      tokenize('@(@escaped)').should.eql([
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' }
      ])
    })

    it('should emit the correct type for escaping', () => {
      tokenize('person@(@example).com').should.eql([
        { type: 'CONTENT', value: 'person' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@example' },
        { type: 'CONTENT', value: '.com' }
      ])
    })

    it('should emit the correct type for escaping', () => {
      tokenize('person@(@example)\n.com').should.eql([
        { type: 'CONTENT', value: 'person' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@example' },
        { type: 'CONTENT', value: '.com' }
      ])
    })

    it('escaped mode should exit when dedenting', () => {
      tokenize('content\n  @@thing\n@outdented').should.eql([
        { type: 'CONTENT', value: 'content' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'thing' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'outdented' }
      ])
    })

    it('two inline, then indented newline', () => {
      tokenize('@one: @two\n  @three').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'three' }
      ])
    })

    it('three inline, then newline', () => {
      tokenize('@one: @two: @three\n@four').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'three' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'four' }
      ])
    })

    it('three inline, then params, then newline', () => {
      tokenize('@one: @two: @three params!\n@four').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'three' },
        { type: 'PARAMS', value: 'params!' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'four' }
      ])
    })

    it('two entities not indented', () => {
      tokenize('@one\n@two').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'TYPE', value: 'two' }
      ])
    })

    it('two entities not indented with colon', () => {
      tokenize('@one:\n@two').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'two' }
      ])
    })

    it('@@ should not parse any of the content', () => {
      tokenize('@@one\n  @two').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '@two' }
      ])
    })

    it('it should resume parsing like normal after an @@ block', () => {
      tokenize('@@one\n  @two\n@three').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '@two' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'three' }
      ])
    })

    it('should handle a multiline @@ block followed by a single line one', () => {
      tokenize('@@codeblock js\n  () => { return 0 }\n@@codeblock js: () => { return 0 }\n').should.eql([
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '() => { return 0 }' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: '() => { return 0 }' },
        { type: 'END_SAME_LINE_CONTENT' }
      ])
    })

    it('should handle multiple single line @@ blocks', () => {
      tokenize('@@codeblock js: () => { return 0 }\n@@codeblock js: () => { return 0 }\n').should.eql([
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: '() => { return 0 }' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: '() => { return 0 }' },
        { type: 'END_SAME_LINE_CONTENT' }
      ])
    })

    it('it should emit the right tokens for parsing nested square brackets', () => {
      tokenize('@thing[[1, 2, 3]]').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: '[1, 2, 3]' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('it should escape within inline content correctly ([)', () => {
      tokenize('@thing[\\[1, 2, 3] bob').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: '[1, 2, 3' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: ' bob' }
      ])
    })

    it('it should escape within inline content correctly (])', () => {
      tokenize('@thing[\\]1, 2, 3] bob').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: ']1, 2, 3' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: ' bob' }
      ])
    })

    it('newlines should be allowed in inline content', () => {
      tokenize('@thing[very\nlong\ncontent]').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'very' },
        { type: 'CONTENT', value: 'long' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('should handle newlines after inline content correctly', () => {
      tokenize('Some @thing[content]\nSome more content').should.eql([
        { type: 'CONTENT', value: 'Some ' },
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'Some more content' }
      ])
    })

    it('should handle newlines after inline content correctly', () => {
      tokenize('@container\n  Some @thing[content]\n  Some more content').should.eql([
        { type: 'TYPE', value: 'container' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'Some ' },
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'Some more content' }
      ])
    })

    it('should handle inline content in same line content (ending on a newline)', () => {
      tokenize('@italic: @bold[test]\nContent').should.eql([
        { type: 'TYPE', value: 'italic' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'bold' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'test' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'Content' }
      ])
    })

    it('should handle inline and sameline content that end at a newline with indentations', () => {
      tokenize('@container\n  @italic: @bold[test]\nContent').should.eql([
        { type: 'TYPE', value: 'container' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'italic' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'bold' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'test' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'Content' }
      ])
    })
  })

  describe('ast', () => {
    it('should build a basic type entity', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' }
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: [],
        content: []
      }]))
    })

    it('basic entities one after another', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'TYPE', value: 'veg' }
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

    it('basic entity with params', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'kiwi lemon' }
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: ['kiwi', 'lemon'],
        content: []
      }]))
    })

    it('escaped params should work', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: '[one two three] four' }
      ]

      ast(tokens).should.eql(selection([{
        type: 'fruits',
        params: ['one two three', 'four'],
        content: []
      }]))
    })

    it('basic indented entities', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' }
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

    it('basic indented then dedented entities', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'meat' }
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

    it('non type indentations should be ignored', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'banana' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'kiwi' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'lime' },
        { type: 'TYPE', value: 'veg' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'carrots' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'brocolli' }
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

    it('non type indentations should be ignored', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'quince' }
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

    it('inline followed by indented newline', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'ripe' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'banana' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'parsnip' }
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

    it('empty line following newline', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'CONTENT', value: '' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'banana' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '' },
        { type: 'CONTENT', value: 'strawberry' }
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

    it('should emit the correct tokens for escaping', () => {
      const tokens = [
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' }
      ]

      ast(tokens).should.eql(selection([
        '@escaped'
      ]))
    })

    it('should handle a more complex escaping', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'something' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            'something@escaped.com'
          ]
        }
      ]))
    })

    it('should handle empty excaped sections', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            '.com'
          ]
        }
      ]))
    })

    it('should handle a more escaping that ends on a newline', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'something' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' },
        { type: 'CONTENT', value: '' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'fruits',
          params: [],
          content: [
            'something@escaped',
            '.com'
          ]
        }
      ]))
    })

    it('should handle inline and sameline content that end at a newline', () => {
      const tokens = [
        { type: 'TYPE', value: 'italic' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'bold' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'test' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'Content' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'italic',
          params: [],
          content: [
            {
              type: 'bold',
              params: [],
              content: [
                'test'
              ]
            }
          ]
        },
        'Content'
      ]))
    })

    it('should handle inline and sameline content that end at a newline with indentations', () => {
      const tokens = [
        { type: 'TYPE', value: 'container' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'italic' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'bold' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'test' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'Content' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'container',
          params: [],
          content: [
            {
              type: 'italic',
              params: [],
              content: [
                {
                  type: 'bold',
                  params: [],
                  content: [
                    'test'
                  ]
                }
              ]
            }
          ]
        },
        'Content'
      ]))
    })

    it('three inline, then newline entity', () => {
      const tokens = [
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

    it('three inline, then parameter then newline entity', () => {
      const tokens = [
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

    it('should handle empty lines correctly', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'ripe' },
        { type: 'EMPTY_CONTENT', value: '' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'banana' },
        { type: 'EMPTY_CONTENT', value: '  ' },
        { type: 'TYPE', value: 'lychee' }
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

    it('newlines should be allowed in inline content', () => {
      const tokens = [
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'very' },
        { type: 'CONTENT', value: 'long' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' }
      ]

      ast(tokens).should.eql(selection([
        {
          type: 'thing',
          params: [],
          content: ['very long content']
        }
      ]))
    })
  })

  describe('full parse', () => {
    it('should parse a tag with no parameters', () => {
      const source = '@button'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should include whitespace only lines when parsing', () => {
      const source = '@button\n\n@button'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: []
        }, '', {
          type: 'button',
          params: [],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse a single paramter correctly', () => {
      const source = '@button positive'
      const expected = selection([
        {
          type: 'button',
          params: ['positive'],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse a multiple paramters correctly', () => {
      const source = '@tags bug enhancement feature-request'
      const expected = selection([
        {
          type: 'tags',
          params: ['bug', 'enhancement', 'feature-request'],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should ignore lines starting with # (by default)', () => {
      const source = '# @tags bug enhancement feature-request'
      const expected = selection([])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse text as text', () => {
      const source = '@tags\n  line 1\n    line 2\n  line 3'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['line 1', '  line 2', 'line 3']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse nested types', () => {
      const source = '@tags\n  @tag a\n    line 1\n  @tag b'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: [
            {
              type: 'tag',
              params: ['a'],
              content: ['line 1']
            }, {
              type: 'tag',
              params: ['b'],
              content: []
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse nested types with inconsistent indentation levels', () => {
      const source = '@tags\n  @tag a\n          @tag b\n            bcontent\n          @tag c\n              content1\n                content2\n              content3'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: [
            {
              type: 'tag',
              params: ['a'],
              content: [
                {
                  type: 'tag',
                  params: ['b'],
                  content: ['bcontent']
                }, {
                  type: 'tag',
                  params: ['c'],
                  content: ['content1', '  content2', 'content3']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content', () => {
      const source = '@tags: content'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content a parameter', () => {
      const source = '@tags param: content'
      const expected = selection([
        {
          type: 'tags',
          params: ['param'],
          content: ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse single line content with parameters', () => {
      const source = '@tags param1 param2: content'
      const expected = selection([
        {
          type: 'tags',
          params: ['param1', 'param2'],
          content: ['content']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple parameters', () => {
      const source = '@tags [[param1] [param2 param3]]'
      const expected = selection([
        {
          type: 'tags',
          params: ['[param1] [param2 param3]'],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should ignore whitespace between type and params', () => {
      const source = '@tags     param'
      const expected = selection([
        {
          type: 'tags',
          params: ['param'],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse mixed single line content and multiple line content', () => {
      const source = '@tags: content1\n  content2'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['content1', 'content2']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should pass the mega test', () => {
      const source = '@tags\n  @tag a\n    line 1\n    @t a\n    @t: b\n  @tag b\n    @x y z: a\n      b\n        c\n      d\n\n          e'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: [
            {
              type: 'tag',
              params: ['a'],
              content: [
                'line 1', {
                  type: 't',
                  params: ['a'],
                  content: []
                }, {
                  type: 't',
                  params: [],
                  content: ['b']
                }
              ]
            }, {
              type: 'tag',
              params: ['b'],
              content: [
                {
                  type: 'x',
                  params: ['y', 'z'],
                  content: ['a', 'b', '  c', 'd', '', '    e']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('multiple tags at the same level', () => {
      const source = '@tags\n  @taga\n  @tagb\n  @tagc\n  @taga'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: [
            {
              type: 'taga',
              params: [],
              content: []
            }, {
              type: 'tagb',
              params: [],
              content: []
            }, {
              type: 'tagc',
              params: [],
              content: []
            }, {
              type: 'taga',
              params: [],
              content: []
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple entities that start on the same line', () => {
      const source = '@button: @tag: content'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            {
              type: 'tag',
              params: [],
              content: ['content']
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse multiple entities that start on the same line, then continue parsing content on the next line', () => {
      const source = '@button: @tag: content\n  @tag2: content2'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            {
              type: 'tag',
              params: [],
              content: [
                'content', {
                  type: 'tag2',
                  params: [],
                  content: ['content2']
                }
              ]
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse an inline entity, followed by a new line entity correctly', () => {
      const source = '@button: @tag[content]\n  @tag2: content2'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            {
              type: 'tag',
              params: [],
              content: ['content']
            }, {
              type: 'tag2',
              params: [],
              content: ['content2']
            }
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities (just single param)', () => {
      const source = "@button: Click this: @button(positive) Or don't."
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            'Click this: ', {
              type: 'button',
              params: ['positive'],
              content: []
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities (multiple params)', () => {
      const source = "@button: Click this: @button(positive inverse) Or don't."
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            'Click this: ', {
              type: 'button',
              params: ['positive', 'inverse'],
              content: []
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse inline entities', () => {
      const source = "@button: Click this: @button(positive)[content] Or don't."
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: [
            'Click this: ', {
              type: 'button',
              params: ['positive'],
              content: ['content']
            }, " Or don't."
          ]
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should parse array parameters', () => {
      const source = '@button a [b c] d [e f g]'
      const expected = selection([
        {
          type: 'button',
          params: ['a', 'b c', 'd', 'e f g'],
          content: []
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should throw warning when the indentation is messed up', () => {
      const source = '@button\n      @button\n    @button\n  @button\n@button'
      chai.expect(() => {
        return parse(source)
      }).to.throw()
    })

    it('should handle dropping back indentation before an entity with newlines', () => {
      const source = '@button\n\n  some content\n\nmore content'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: ['', 'some content']
        }, '', 'more content'
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle escaping', () => {
      const source = '@fruits\n  @(@escaped)'
      const expected = selection([
        {
          type: 'fruits',
          params: [],
          content: ['@escaped']
        }
      ])
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should detect newlines after inline entities', () => {
      const source = '@titlebar: @title(Test)\n\n@js\n  hx.notify().info("Hi");'
      const expected = selection([
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

    it('should handle content with square bracket followed by non whitespace', () => {
      const source = '[] this is fine'
      const expected = {
        content: ['[] this is fine']
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('should handle content with square bracket followed by non whitespace', () => {
      const source = '@content\n  [] this is fine'
      const expected = {
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

    it('should handle content with square bracket followed by non whitespace', () => {
      const source = '] ;'
      const expected = {
        content: ['] ;']
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('inline should work with square brackets after', () => {
      const source = '@type[content] []'
      const expected = {
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

    it('colon in an escaped parameter should be fine', () => {
      const source = '@link [http://example.com]: example.com'
      const expected = {
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

    it('colon in an escaped parameter should be fine (newline content)', () => {
      const source = '@link [http://example.com]\n  example.com'
      const expected = {
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

    it('colon in an inline escaped parameter should be fine', () => {
      const source = '@link([http://example.com])[example.com]'
      const expected = {
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

    it('empty inline parameter should be fine', () => {
      const source = '@link()[example.com]'
      const expected = {
        content: [
          {
            type: 'link',
            params: [],
            content: ['example.com']
          }
        ]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('colon in an inline parameter list should be fine', () => {
      const source = '@link(http://example.com)[example.com]'
      const expected = {
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

    it('should be able to parse parameter strings containing brackets', () => {
      const source = '@default [rgba(255, 255, 255, 0.5)]: Content'
      const expected = {
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

    it('should be able to parse parameter strings containing brackets', () => {
      const source = '@default rgba(255, 255, 255, 0.5): Content'
      const expected = {
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

    it('escaping should work for nested closing square brackets', () => {
      const source = '@thing[\\[1, 2, 3\\]]'
      const expected = {
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

    it('should parse nested square brackets correctly for inline content', () => {
      const source = '@thing[[1, 2, 3]]'
      const expected = {
        content: [{
          type: 'thing',
          params: [],
          content: ['[1, 2, 3]']
        }]
      }
      chai.expect(parse(source)).to.eql(expected)
    })

    it('nested square brackets should be allowed', () => {
      const source = '@thing: [1, 2, 3]'
      const expected = {
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

    it('square brackets should be allowed in regular content', () => {
      const source = '@thing: 1, [2, 3]'
      const expected = {
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

    it('deal with empty newlines', () => {
      const source = '@tag hello\n\n  @tag-a\n  \n  @tag-b'
      const expected = {
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

    it('should have correct indentation when multiple entities on the same line are followed by another line', () => {
      const source = '@one: @two\n@three'
      const expected = {
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

    it('newlines should be allowed in inline content', () => {
      parse('@thing[very\nlong\ncontent]').should.eql(selection([
        {
          type: 'thing',
          params: [],
          content: ['very long content']
        }
      ]))
    })
  })
})
