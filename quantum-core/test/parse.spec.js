const chai = require('chai')
const { parse, tokenize, ast } = require('..')

const expect = chai.expect

describe('parse', () => {
  describe('tokenize', () => {
    it('detects a type correctly', () => {
      tokenize('@type').should.eql([
        { type: 'TYPE', value: 'type' }
      ])
    })

    it('detects a type with params', () => {
      tokenize('@fruits apple kiwi cherry lime').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry lime' }
      ])
    })

    it('detects a type with params (followed by colon)', () => {
      tokenize('@fruits apple kiwi cherry:').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' },
        { type: 'START_SAME_LINE_CONTENT' }
      ])
    })

    it('detects a type with params (followed by colon)', () => {
      tokenize('@fruits apple kiwi cherry:\n@veg').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'TYPE', value: 'veg' }
      ])
    })

    it('detects a type with params (followed by newline)', () => {
      tokenize('@fruits apple kiwi cherry\n').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' }
      ])
    })

    it('detects a type with params (in parenths)', () => {
      tokenize('@fruits(apple kiwi cherry)').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'apple kiwi cherry' }
      ])
    })

    it('throws an error for incomplete param brackets', () => {
      expect(() => {
        tokenize('@fruits(apple kiwi cherry')
      }).to.throw()
    })

    it('detects a type with content (in parenths)', () => {
      tokenize('@fruits[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('detects a type with content (in parenths)', () => {
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

    describe('inline', () => {
      it('ignore @', () => {
        tokenize('@fruits[apple kiwi cherry @fruits]').should.eql([
          { type: 'TYPE', value: 'fruits' },
          { type: 'START_INLINE_CONTENT' },
          { type: 'CONTENT', value: 'apple kiwi cherry @fruits' },
          { type: 'END_INLINE_CONTENT' }
        ])
      })

      it('handles escaped brackets in content', () => {
        tokenize('@fruits[apple kiwi cherry @fruits\\[apple kiwi cherry\\]]').should.eql([
          { type: 'TYPE', value: 'fruits' },
          { type: 'START_INLINE_CONTENT' },
          { type: 'CONTENT', value: 'apple kiwi cherry @fruits[apple kiwi cherry]' },
          { type: 'END_INLINE_CONTENT' }
        ])
      })

      it('inlines followed by a newline', () => {
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

      it('inlines followed by a whitespace newline', () => {
        tokenize('@fruits: @ripe[banana]\n  \nSomething').should.eql([
          { type: 'TYPE', value: 'fruits' },
          { type: 'START_SAME_LINE_CONTENT' },
          { type: 'TYPE', value: 'ripe' },
          { type: 'START_INLINE_CONTENT' },
          { type: 'CONTENT', value: 'banana' },
          { type: 'END_INLINE_CONTENT' },
          { type: 'END_SAME_LINE_CONTENT' },
          { type: 'EMPTY_CONTENT', value: '  ' },
          { type: 'CONTENT', value: 'Something' }
        ])
      })

      it('inlines followed by a newline in a container', () => {
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
    })

    it('detects a type with content (in parenths)', () => {
      tokenize('@fruits(lemon lime)[apple kiwi cherry]').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'lemon lime' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'apple kiwi cherry' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('throws an error for incomplete content brackets', () => {
      expect(() => {
        tokenize('@fruits[juice')
      }).to.throw()
    })

    it('throws an error for incomplete content brackets', () => {
      expect(() => {
        tokenize('@fruits(apple)[juice')
      }).to.throw()
    })

    it('detects an indent after an entity', () => {
      tokenize('@fruits\n  @veg').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' }
      ])
    })

    it('detects a dedent after an entity', () => {
      tokenize('@fruits\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('doesnt mind how much indentation is used', () => {
      tokenize('@fruits\n        @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 8 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 8 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('doesnt emit INDENT or DEDENT when indentation stays the same', () => {
      tokenize('@fruits\n  @veg\n  @veg\n@pudding').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'pudding' }
      ])
    })

    it('emits the correct number of dedents when dropping back multiple levels', () => {
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

    describe('indent', () => {
      it('isnt called for non entity content (except when directly following an entity tag)', () => {
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

      it('drops back through multiple indent levels', () => {
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
    })

    it('messed up indentation throws an error', () => {
      expect(() => {
        tokenize('@fruits\n  indent\n    indent\n       alsoindent\n dedent\ndedent\ndedent\ndedent')
      }).to.throw()
    })

    it('messed up indentation throws an error (shows the surrounding lines)', () => {
      expect(() => {
        tokenize('@fruits\n  indent\n    indent\n       alsoindent\n dedent\ndedent\ndedent\ndedent\ndedent')
      }).to.throw()
    })

    it('parses comments correctly', () => {
      tokenize('@fruits\n  #comment\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'COMMENT', value: 'comment' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'indent' }
      ])
    })

    it('doesnt parse comments inside escaped blocks', () => {
      tokenize('@@fruits\n  #comment\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '#comment' },
        { type: 'CONTENT', value: 'indent' }
      ])
    })

    it('comment escaping works correctly', () => {
      tokenize('@fruits\n  \\#content\n  indent').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '#content' },
        { type: 'CONTENT', value: 'indent' }
      ])
    })

    it('at this stage doesnt care about parameter grouping', () => {
      tokenize('@fruits [one two three] four').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: '[one two three] four' }
      ])
    })

    it('handles same line content', () => {
      tokenize('@fruits: kiwi lemon orange').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'kiwi lemon orange' }
      ])
    })

    it('handles same line content', () => {
      tokenize('@fruits: orange\n  quince').should.eql([
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'quince' }
      ])
    })

    it('handles empty lines correctly', () => {
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

    it('emits the correct type for escaping', () => {
      tokenize('@(@escaped)').should.eql([
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' }
      ])
    })

    it('emits the correct type for escaping', () => {
      tokenize('person@(@example).com').should.eql([
        { type: 'CONTENT', value: 'person' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@example' },
        { type: 'CONTENT', value: '.com' }
      ])
    })

    it('emits the correct type for escaping', () => {
      tokenize('person@(@example)\n.com').should.eql([
        { type: 'CONTENT', value: 'person' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@example' },
        { type: 'CONTENT', value: '.com' }
      ])
    })

    it('escaped mode exits when dedenting', () => {
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

    it('@@ doesnt parse any of the content', () => {
      tokenize('@@one\n  @two').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '@two' }
      ])
    })

    it('resumes parsing like normal after an @@ block', () => {
      tokenize('@@one\n  @two\n@three').should.eql([
        { type: 'TYPE', value: 'one' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '@two' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'three' }
      ])
    })

    it('handles a multiline @@ block followed by a single line one', () => {
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

    it('handles multiple single line @@ blocks', () => {
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

    it('emits the right tokens for parsing nested square brackets', () => {
      tokenize('@thing[[1, 2, 3]]').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: '[1, 2, 3]' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('escapes within inline content correctly ([)', () => {
      tokenize('@thing[\\[1, 2, 3] bob').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: '[1, 2, 3' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: ' bob' }
      ])
    })

    it('escapes within inline content correctly (])', () => {
      tokenize('@thing[\\]1, 2, 3] bob').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: ']1, 2, 3' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: ' bob' }
      ])
    })

    it('allows newlines in inline content', () => {
      tokenize('@thing[very\nlong\ncontent]').should.eql([
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'very' },
        { type: 'CONTENT', value: 'long' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' }
      ])
    })

    it('handles newlines after inline content correctly', () => {
      tokenize('Some @thing[content]\nSome more content').should.eql([
        { type: 'CONTENT', value: 'Some ' },
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'Some more content' }
      ])
    })

    it('handles newlines after inline content correctly', () => {
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

    it('handles inline content in same line content (ending on a newline)', () => {
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

    it('handles inline and sameline content that end at a newline with indentations', () => {
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

    it('indenting in plain content after an indent works', () => {
      tokenize("@codeblock js\n  console.log('one')\n\nfunction test () {\n  console.log('two')\n}").should.eql([
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: "console.log('one')" },
        { type: 'EMPTY_CONTENT', value: '' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'function test () {' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: "console.log('two')" },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '}' }
      ])
    })

    it('Should handle multiple levels of indentation in content', () => {
      tokenize('@example\n  @@html\n    <div>\n      <div>\n        <div></div>\n      </div>\n    </div>\n').should.eql([
        { type: 'TYPE', value: 'example' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'html' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div>' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div>' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div></div>' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '</div>' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '</div>' }
      ])
    })
  })

  describe('ast', () => {
    it('builds a basic type entity', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' }
      ]

      ast(tokens).should.eql([{
        type: 'fruits',
        params: [],
        content: []
      }])
    })

    it('basic entities one after another', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'TYPE', value: 'veg' }
      ]

      ast(tokens).should.eql([
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
      ])
    })

    it('basic entity with params', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'kiwi lemon' }
      ]

      ast(tokens).should.eql([{
        type: 'fruits',
        params: ['kiwi', 'lemon'],
        content: []
      }])
    })

    it('handles escaped params', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: '[one two three] four' }
      ]

      ast(tokens).should.eql([{
        type: 'fruits',
        params: ['one two three', 'four'],
        content: []
      }])
    })

    it('basic indented entities', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' }
      ]

      ast(tokens).should.eql([{
        type: 'fruits',
        params: [],
        content: [{
          type: 'veg',
          params: [],
          content: []
        }]
      }])
    })

    it('basic indented then dedented entities', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'veg' },
        { type: 'DEDENT', value: 2 },
        { type: 'TYPE', value: 'meat' }
      ]

      ast(tokens).should.eql([
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
      ])
    })

    it('ignores non type indentations', () => {
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

      ast(tokens).should.eql([
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
      ])
    })

    it('ignores non type indentations', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'START_SAME_LINE_CONTENT' },
        { type: 'CONTENT', value: 'orange' },
        { type: 'END_SAME_LINE_CONTENT' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'quince' }
      ]

      ast(tokens).should.eql([
        {
          type: 'fruits',
          params: [],
          content: [
            'orange',
            'quince'
          ]
        }
      ])
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

      ast(tokens).should.eql([
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
      ])
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

      ast(tokens).should.eql([
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
      ])
    })

    it('emits the correct tokens for escaping', () => {
      const tokens = [
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' }
      ]

      ast(tokens).should.eql([
        '@escaped'
      ])
    })

    it('handles a more complex escaping', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'something' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql([
        {
          type: 'fruits',
          params: [],
          content: [
            'something@escaped.com'
          ]
        }
      ])
    })

    it('handles empty escaped sections', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql([
        {
          type: 'fruits',
          params: [],
          content: [
            '.com'
          ]
        }
      ])
    })

    it('handles a more escaping that ends on a newline', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: 'something' },
        { type: 'TYPE', value: '' },
        { type: 'PARAMS', value: '@escaped' },
        { type: 'CONTENT', value: '' },
        { type: 'CONTENT', value: '.com' }
      ]

      ast(tokens).should.eql([
        {
          type: 'fruits',
          params: [],
          content: [
            'something@escaped',
            '.com'
          ]
        }
      ])
    })

    it('handles inline and sameline content that end at a newline', () => {
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

      ast(tokens).should.eql([
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
      ])
    })

    it('handles inline and sameline content that end at a newline with indentations', () => {
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

      ast(tokens).should.eql([
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
      ])
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

      ast(tokens).should.eql([
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
      ])
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

      ast(tokens).should.eql([
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
      ])
    })

    it('handles empty lines correctly', () => {
      const tokens = [
        { type: 'TYPE', value: 'fruits' },
        { type: 'PARAMS', value: 'ripe' },
        { type: 'EMPTY_CONTENT', value: '' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'banana' },
        { type: 'EMPTY_CONTENT', value: '  ' },
        { type: 'TYPE', value: 'lychee' }
      ]

      ast(tokens).should.eql([
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
      ])
    })

    it('allows newlines in inline content', () => {
      const tokens = [
        { type: 'TYPE', value: 'thing' },
        { type: 'START_INLINE_CONTENT' },
        { type: 'CONTENT', value: 'very' },
        { type: 'CONTENT', value: 'long' },
        { type: 'CONTENT', value: 'content' },
        { type: 'END_INLINE_CONTENT' }
      ]

      ast(tokens).should.eql([
        {
          type: 'thing',
          params: [],
          content: ['very long content']
        }
      ])
    })

    it('indenting in plain content after an indent works', () => {
      const tokens = [
        { type: 'TYPE', value: 'codeblock' },
        { type: 'PARAMS', value: 'js' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: "console.log('one')" },
        { type: 'EMPTY_CONTENT', value: '' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: 'function test () {' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: "console.log('two')" },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '}' }
      ]

      ast(tokens).should.eql([
        {
          type: 'codeblock',
          params: ['js'],
          content: [
            "console.log('one')"
          ]
        },
        '',
        'function test () {',
        "  console.log('two')",
        '}'
      ])
    })

    it('Should handle multiple levels of indentation in content', () => {
      ast([
        { type: 'TYPE', value: 'example' },
        { type: 'INDENT', value: 2 },
        { type: 'TYPE', value: 'html' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div>' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div>' },
        { type: 'INDENT', value: 2 },
        { type: 'CONTENT', value: '<div></div>' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '</div>' },
        { type: 'DEDENT', value: 2 },
        { type: 'CONTENT', value: '</div>' }
      ]).should.eql([
        {
          type: 'example',
          params: [],
          content: [
            {
              type: 'html',
              params: [],
              content: [
                '<div>',
                '  <div>',
                '    <div></div>',
                '  </div>',
                '</div>'
              ]
            }
          ]
        }
      ])
    })
  })

  describe('full parse', () => {
    function selection (content) {
      return {
        type: '',
        params: [],
        content: content
      }
    }

    it('parses a tag with no parameters', () => {
      const source = '@button'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('includes whitespace only lines when parsing', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses a single paramter correctly', () => {
      const source = '@button positive'
      const expected = selection([
        {
          type: 'button',
          params: ['positive'],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses a multiple paramters correctly', () => {
      const source = '@tags bug enhancement feature-request'
      const expected = selection([
        {
          type: 'tags',
          params: ['bug', 'enhancement', 'feature-request'],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('ignores lines starting with # (by default)', () => {
      const source = '# @tags bug enhancement feature-request'
      const expected = selection([])
      expect(parse(source)).to.eql(expected)
    })

    it('parses text as text', () => {
      const source = '@tags\n  line 1\n    line 2\n  line 3'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['line 1', '  line 2', 'line 3']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses nested types', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses nested types with inconsistent indentation levels', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses single line content', () => {
      const source = '@tags: content'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['content']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses single line content a parameter', () => {
      const source = '@tags param: content'
      const expected = selection([
        {
          type: 'tags',
          params: ['param'],
          content: ['content']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses single line content with parameters', () => {
      const source = '@tags param1 param2: content'
      const expected = selection([
        {
          type: 'tags',
          params: ['param1', 'param2'],
          content: ['content']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses multiple parameters', () => {
      const source = '@tags [[param1] [param2 param3]]'
      const expected = selection([
        {
          type: 'tags',
          params: ['[param1] [param2 param3]'],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('ignores whitespace between type and params', () => {
      const source = '@tags     param'
      const expected = selection([
        {
          type: 'tags',
          params: ['param'],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses mixed single line content and multiple line content', () => {
      const source = '@tags: content1\n  content2'
      const expected = selection([
        {
          type: 'tags',
          params: [],
          content: ['content1', 'content2']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('passes the mega test', () => {
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
      expect(parse(source)).to.eql(expected)
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses multiple entities that start on the same line', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses multiple entities that start on the same line, then continue parsing content on the next line', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses an inline entity, followed by a new line entity correctly', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses inline entities (just single param)', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses inline entities (multiple params)', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses inline entities', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('parses array parameters', () => {
      const source = '@button a [b c] d [e f g]'
      const expected = selection([
        {
          type: 'button',
          params: ['a', 'b c', 'd', 'e f g'],
          content: []
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('throws warning when the indentation is messed up', () => {
      const source = '@button\n      @button\n    @button\n  @button\n@button'
      expect(() => {
        return parse(source)
      }).to.throw()
    })

    it('handles dropping back indentation before an entity with newlines', () => {
      const source = '@button\n\n  some content\n\nmore content'
      const expected = selection([
        {
          type: 'button',
          params: [],
          content: ['', 'some content']
        }, '', 'more content'
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('handles escaping', () => {
      const source = '@fruits\n  @(@escaped)'
      const expected = selection([
        {
          type: 'fruits',
          params: [],
          content: ['@escaped']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('detects newlines after inline entities', () => {
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
      expect(parse(source)).to.eql(expected)
    })

    it('handles content with square bracket followed by non whitespace', () => {
      const source = '[] this is fine'
      const expected = selection(['[] this is fine'])
      expect(parse(source)).to.eql(expected)
    })

    it('handles content with square bracket followed by non whitespace', () => {
      const source = '@content\n  [] this is fine'
      const expected = selection([
        {
          type: 'content',
          params: [],
          content: ['[] this is fine']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('handles content with square bracket followed by non whitespace', () => {
      const source = '] ;'
      const expected = selection(['] ;'])
      expect(parse(source)).to.eql(expected)
    })

    it('inline works with square brackets after', () => {
      const source = '@type[content] []'
      const expected = selection([
        {
          type: 'type',
          params: [],
          content: ['content']
        },
        ' []'
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('colon in an escaped parameter works', () => {
      const source = '@link [http://example.com]: example.com'
      const expected = selection([
        {
          type: 'link',
          params: ['http://example.com'],
          content: ['example.com']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('colon in an escaped parameter works (newline content)', () => {
      const source = '@link [http://example.com]\n  example.com'
      const expected = selection([
        {
          type: 'link',
          params: ['http://example.com'],
          content: ['example.com']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('colon in an inline escaped parameter works', () => {
      const source = '@link([http://example.com])[example.com]'
      const expected = selection([
        {
          type: 'link',
          params: ['http://example.com'],
          content: ['example.com']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('empty inline parameter works', () => {
      const source = '@link()[example.com]'
      const expected = selection([
        {
          type: 'link',
          params: [],
          content: ['example.com']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('colon in an inline parameter list works', () => {
      const source = '@link(http://example.com)[example.com]'
      const expected = selection([
        {
          type: 'link',
          params: ['http://example.com'],
          content: ['example.com']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses parameter strings containing brackets', () => {
      const source = '@default [rgba(255, 255, 255, 0.5)]: Content'
      const expected = selection([
        {
          type: 'default',
          params: ['rgba(255, 255, 255, 0.5)'],
          content: ['Content']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses parameter strings containing brackets', () => {
      const source = '@default rgba(255, 255, 255, 0.5): Content'
      const expected = selection([
        {
          type: 'default',
          params: ['rgba(255,', '255,', '255,', '0.5)'],
          content: ['Content']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('escapes nested closing square brackets', () => {
      const source = '@thing[\\[1, 2, 3\\]]'
      const expected = selection([
        {
          type: 'thing',
          params: [],
          content: ['[1, 2, 3]']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('parses nested square brackets correctly for inline content', () => {
      const source = '@thing[[1, 2, 3]]'
      const expected = selection([
        {
          type: 'thing',
          params: [],
          content: ['[1, 2, 3]']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('nested square brackets work', () => {
      const source = '@thing: [1, 2, 3]'
      const expected = selection([
        {
          type: 'thing',
          params: [],
          content: ['[1, 2, 3]']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('square brackets work in regular content', () => {
      const source = '@thing: 1, [2, 3]'
      const expected = selection([
        {
          type: 'thing',
          params: [],
          content: ['1, [2, 3]']
        }
      ])
      expect(parse(source)).to.eql(expected)
    })

    it('deal with empty newlines', () => {
      const source = '@tag hello\n\n  @tag-a\n  \n  @tag-b'
      const expected = selection([
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
      ])

      expect(parse(source)).to.eql(expected)
    })

    it('has correct indentation when multiple entities on the same line are followed by another line', () => {
      const source = '@one: @two\n@three'
      const expected = selection([
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
      ])

      expect(parse(source)).to.eql(expected)
    })

    it('newlines work in inline content', () => {
      parse('@thing[very\nlong\ncontent]').should.eql(selection([
        {
          type: 'thing',
          params: [],
          content: ['very long content']
        }
      ]))
    })

    it('handles newlines when an inline entity is at the end of a line', () => {
      parse('Some @code[Inline] Code\n\nSome inline code at the end of a @code[line]\n\nSome text').should.eql(selection([
        'Some ',
        {
          type: 'code',
          params: [],
          content: ['Inline']
        },
        ' Code',
        '',
        'Some inline code at the end of a ',
        {
          type: 'code',
          params: [],
          content: ['line']
        },
        '',
        'Some text'
      ]))
    })

    it('handles newlines when an inline entity is at the end of a line with spaces on the next line', () => {
      parse('Some @code[Inline] Code\n\nSome inline code at the end of a @code[line]\n  \nSome text').should.eql(selection([
        'Some ',
        {
          type: 'code',
          params: [],
          content: ['Inline']
        },
        ' Code',
        '',
        'Some inline code at the end of a ',
        {
          type: 'code',
          params: [],
          content: ['line']
        },
        '  ',
        'Some text'
      ]))
    })

    it('Should handle multiple levels of indentation in content', () => {
      parse('@example\n  @@html\n    <div>\n      <div>\n        <div></div>\n      </div>\n    </div>\n').should.eql(selection([
        {
          type: 'example',
          params: [],
          content: [
            {
              type: 'html',
              params: [],
              content: [
                '<div>',
                '  <div>',
                '    <div></div>',
                '  </div>',
                '</div>'
              ]
            }
          ]
        }
      ]))
    })
  })
})
