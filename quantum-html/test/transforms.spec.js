'use strict'

const html = require('..')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const path = require('path')

describe('transforms', () => {
  function transformEntity () {
    function defaultTransform (selection) {
      return dom.textNode(quantum.select.isSelection(selection) ? selection.cs() : selection)
    }
    return function transformer (selection) {
      var type = quantum.select.isSelection(selection) ? selection.type() : undefined
      if (type in html.transforms) {
        return html.transforms[type](selection, transformer)
      } else {
        return defaultTransform(selection)
      }
    }
  }

  function elementSpec (type) {
    describe(type, () => {
      it('should the correct element', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: []
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type))
        })
      })

      it('should parse the parameter string correctly (id only)', () => {
        const selection = quantum.select({
          type: type,
          params: ['#id'],
          content: ['content']
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).id('id').add(dom.textNode('content')))
        })
      })

      it('should parse the parameter string correctly (class only)', () => {
        const selection = quantum.select({
          type: type,
          params: ['.class.class2'],
          content: ['content']
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).class('class class2').add(dom.textNode('content')))
        })
      })

      it('should parse the parameter string correctly (id+class)', () => {
        const selection = quantum.select({
          type: type,
          params: ['.class#id.class2'],
          content: ['content']
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).class('class class2').id('id').add(dom.textNode('content')))
        })
      })

      it('should use the attr property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'attr',
            params: ['x'],
            content: ['0']
          }]
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).attr('x', '0'))
        })
      })

      it('should use the id property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'id',
            params: ['id'],
            content: []
          }]
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).id('id'))
        })
      })

      it('should use the class property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'class',
            params: ['class'],
            content: []
          }]
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).class('class'))
        })
      })

      it('should render children', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: type,
            params: ['.x'],
            content: ['content']
          }]
        })

        return html.transforms[type](selection, transformEntity()).then((res) => {
          res.should.eql(dom.create(type).add(dom.create(type).class('x').add(dom.textNode('content'))))
        })
      })

    })
  }

  var elementTypes = [
    'a',
    'b',
    'br',
    'button',
    'div',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'input',
    'label',
    'li',
    'link',
    'ol',
    'option',
    'p',
    'pre',
    'select',
    'span',
    'style',
    'table',
    'tbody',
    'td',
    'textarea',
    'th',
    'thead',
    'tr',
    'ul',
    'vr',
    'meta'
  ]

  elementTypes.forEach(elementSpec)

  it('bodyClassed should add a class to the body (default to true)', function () {
    const selection = quantum.select({
      type: 'bodyClassed',
      params: ['body-class'],
      content: []
    })

    html.transforms.bodyClassed(selection, transformEntity())
      .should.eql(dom.bodyClassed('body-class', true))
  })

  it('bodyClassed should add a class to the body', function () {
    const selection = quantum.select({
      type: 'bodyClassed',
      params: ['body-class'],
      content: ['true']
    })

    html.transforms.bodyClassed(selection, transformEntity())
      .should.eql(dom.bodyClassed('body-class', true))
  })

  it('bodyClassed should be able to remove a class from the body', function () {
    const selection = quantum.select({
      type: 'bodyClassed',
      params: ['body-class'],
      content: ['false']
    })

    html.transforms.bodyClassed(selection, transformEntity())
      .should.eql(dom.bodyClassed('body-class', false))
  })

  describe('hyperlink', () => {
    it('should the correct element', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: ['my-link'],
        content: ['Text']
      })

      return html.transforms.hyperlink(selection, transformEntity()).then((res) => {
        res.should.eql(dom.create('a').attr('href', 'my-link').add(dom.textNode('Text')))
      })
    })

    it('should use the attr property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'attr',
          params: ['x'],
          content: ['0']
        }]
      })

      return html.transforms.hyperlink(selection, transformEntity()).then((res) => {
        res.should.eql(dom.create('a').attr('x', '0').attr('href', ''))
      })
    })

    it('should use the id property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'id',
          params: ['id'],
          content: []
        }]
      })

      return html.transforms.hyperlink(selection, transformEntity()).then((res) => {
        res.should.eql(dom.create('a').id('id').attr('href', ''))
      })
    })

    it('should use the class property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'class',
          params: ['class'],
          content: []
        }]
      })

      return html.transforms.hyperlink(selection, transformEntity()).then((res) => {
        res.should.eql(dom.create('a').class('class').attr('href', ''))
      })
    })

    it('should render children', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'div',
          params: ['.x'],
          content: ['content']
        }]
      })

      return html.transforms.hyperlink(selection, transformEntity()).then((res) => {
        res.should.eql(dom.create('a').attr('href', '').add(dom.create('div').class('x').add(dom.textNode('content'))))
      })
    })

  })

  describe('title', () => {
    it('should create a title element in the head', () => {
      const selection = quantum.select({
        type: 'title',
        params: ['My Title'],
        content: []
      })

      html.transforms.title(selection, transformEntity())
        .should.eql(dom.head(dom.create('title').attr('name', 'My Title'), {id: 'title'}))
    })
  })

  describe('head', () => {
    it('should add elements to the head', () => {
      const selection = quantum.select({
        type: 'head',
        params: ['My Title'],
        content: [
          {
            type: 'meta',
            params: [],
            content: [{
              type: 'attr',
              params: ['name'],
              content: ['value']
            }]
          },
          {
            type: 'meta',
            params: [],
            content: [{
              type: 'attr',
              params: ['name2'],
              content: ['value2']
            }]
          }
        ]
      })

      return html.transforms.head(selection, transformEntity()).then((res) => {
        res.should.eql(
          dom.arrayNode([
            dom.head(dom.create('meta').attr('name', 'value')),
            dom.head(dom.create('meta').attr('name2', 'value2'))
          ]))
      })
    })
  })

  describe('html', () => {
    it('should become an unescaped text node', () => {
      const selection = quantum.select({
        type: 'html',
        params: [],
        content: ['<div></div>']
      })

      html.transforms.html(selection, transformEntity()).should.eql(
        dom.textNode('<div></div>', {escape: false})
      )
    })
  })

  describe('script', () => {
    it('should become an script node', () => {
      const selection = quantum.select({
        type: 'script',
        params: ['/content/file.js'],
        content: []
      })

      html.transforms.script(selection, transformEntity()).should.eql(
        dom.create('script').attr('src', '/content/file.js')
      )
    })
  })

  describe('stylesheet', () => {
    it('should create a link tag', () => {
      const selection = quantum.select({
        type: 'stylesheet',
        params: ['/content/file.css'],
        content: []
      })

      html.transforms.stylesheet(selection, transformEntity()).should.eql(
        dom.head(dom.create('link').attr('href', '/content/file.css').attr('rel', 'stylesheet'))
      )
    })
  })

  describe('js', () => {
    it('should become an script node', () => {
      const selection = quantum.select({
        type: 'js',
        params: [],
        content: ['function (x) { return x < 100}']
      })

      html.transforms.js(selection, transformEntity()).should.eql(
        dom.create('script').text('function (x) { return x < 100}', {escape: false})
      )
    })
  })

  describe('css', () => {
    it('should become an style node', () => {
      const selection = quantum.select({
        type: 'css',
        params: [],
        content: ['.class { color: red; }']
      })

      html.transforms.css(selection, transformEntity()).should.eql(
        dom.head(dom.create('style').text('.class { color: red; }', {escape: false}))
      )
    })
  })

  describe('prepareTransforms', () => {
    const f1 = function () {}
    const f2 = function () {}
    const f3 = function () {}
    const f4 = function () {}
    const f5 = function () {}

    html.prepareTransforms({
      html: {
        div: f1,
        span: f2
      },
      docs: {
        div: f3,
        title: f4
      },
      override: {
        docs: {
          div: f5
        }
      }
    }).should.eql({
      'html.div': f1,
      'html.span': f2,
      'docs.div': f3,
      'override.docs.div': f5,
      'docs.title': f4,
      'div': f5,
      'span': f2,
      'title': f4
    })
  })

  describe('paragraphTransform', () => {
    it('no content should be fine', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: []
      })

      return html.paragraphTransform(selection, transformEntity()).should.eql(
        dom.arrayNode([
          dom.asset({url: '/assets/quantum-html.css', file: path.resolve(__dirname, '../client/quantum-html.css'), shared: true})
        ])
      )
    })

    it('split paragraphs on double newlines', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          '',
          'some text',
          'some more text',
          {type: 'b', params: [], content: ['bold text']},
          'more text',
          '',
          {type: 'b', params: [], content: ['new paragraph']},
          'new paragraph',
        ]
      })

      return html.paragraphTransform(selection, transformEntity()).then(res => {
        res.should.eql(
          dom.arrayNode([
            dom.asset({url: '/assets/quantum-html.css', file: path.resolve(__dirname, '../client/quantum-html.css'), shared: true}),
            dom.create('div').class('qm-html-paragraph')
              .add(dom.textNode('some text '))
              .add(dom.textNode('some more text '))
              .add(dom.create('b').add(dom.textNode('bold text')))
              .add(dom.textNode(' '))
              .add(dom.textNode('more text ')),
            dom.create('div').class('qm-html-paragraph')
              .add(dom.create('b').add(dom.textNode('new paragraph')))
              .add(dom.textNode(' '))
              .add(dom.textNode('new paragraph '))
          ])
        )
      })
    })

  })

})
