const html = require('..')
const quantum = require('quantum-js')
const dom = require('quantum-dom')

describe('transforms', () => {
  function transformEntity () {
    function defaultTransform (selection) {
      return dom.textNode(quantum.isSelection(selection) ? selection.cs() : selection)
    }
    return function transformer (selection) {
      const t = quantum.isSelection(selection) ? selection.type() : undefined
      if (t in html.transforms()) {
        return html.transforms()[t](selection, transformer)
      } else {
        return defaultTransform(selection)
      }
    }
  }

  function promiseTransformEntity () {
    function defaultTransform (selection) {
      return Promise.resolve(dom.textNode(quantum.isSelection(selection) ? selection.cs() : selection))
    }
    return function transformer (selection) {
      const t = quantum.isSelection(selection) ? selection.type() : undefined
      if (t in html.transforms()) {
        return Promise.resolve(html.transforms()[t](selection, transformer))
      } else {
        return defaultTransform(selection)
      }
    }
  }

  function elementSpec (type) {
    describe(type, () => {
      it('renders the correct element', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: []
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type))
      })

      it('parses the parameter string correctly (id only)', () => {
        const selection = quantum.select({
          type: type,
          params: ['#id'],
          content: ['content']
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).id('id').add(dom.textNode('content')))
      })

      it('parses the parameter string correctly (class only)', () => {
        const selection = quantum.select({
          type: type,
          params: ['.class.class2'],
          content: ['content']
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).class('class class2').add(dom.textNode('content')))
      })

      it('parses the parameter string correctly (id+class)', () => {
        const selection = quantum.select({
          type: type,
          params: ['.class#id.class2'],
          content: ['content']
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).class('class class2').id('id').add(dom.textNode('content')))
      })

      it('uses the attr property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'attr',
            params: ['x'],
            content: ['0']
          }]
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).attr('x', '0'))
      })

      it('uses the id property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'id',
            params: ['id'],
            content: []
          }]
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).id('id'))
      })

      it('uses the class property', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: 'class',
            params: ['class'],
            content: []
          }]
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).class('class'))
      })

      it('renders children', () => {
        const selection = quantum.select({
          type: type,
          params: [],
          content: [{
            type: type,
            params: ['.x'],
            content: ['content']
          }]
        })

        html.transforms()[type](selection, transformEntity())
          .should.eql(dom.create(type).add(dom.create(type).class('x').add(dom.textNode('content'))))
      })
    })
  }

  const elementTypes = [
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

  describe('bodyClassed', () => {
    it('adds a class to the body (default to true)', () => {
      const selection = quantum.select({
        type: 'bodyClassed',
        params: ['body-class'],
        content: []
      })

      html.transforms().bodyClassed(selection, transformEntity())
        .should.eql(dom.bodyClassed('body-class', true))
    })

    it('adds a class to the body', () => {
      const selection = quantum.select({
        type: 'bodyClassed',
        params: ['body-class'],
        content: ['true']
      })

      html.transforms().bodyClassed(selection, transformEntity())
        .should.eql(dom.bodyClassed('body-class', true))
    })

    it('removes a class from the body', () => {
      const selection = quantum.select({
        type: 'bodyClassed',
        params: ['body-class'],
        content: ['false']
      })

      html.transforms().bodyClassed(selection, transformEntity())
        .should.eql(dom.bodyClassed('body-class', false))
    })
  })

  describe('hyperlink', () => {
    it('renders the correct element', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: ['my-link'],
        content: ['Text']
      })

      return html.transforms().hyperlink(selection, transformEntity())
        .should.eql(dom.create('a').attr('href', 'my-link').add(dom.textNode('Text')))
    })

    it('uses the attr property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'attr',
          params: ['x'],
          content: ['0']
        }]
      })

      return html.transforms().hyperlink(selection, transformEntity())
        .should.eql(dom.create('a').attr('x', '0').attr('href', ''))
    })

    it('uses the id property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'id',
          params: ['id'],
          content: []
        }]
      })

      return html.transforms().hyperlink(selection, transformEntity())
        .should.eql(dom.create('a').id('id').attr('href', ''))
    })

    it('uses the class property', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'class',
          params: ['class'],
          content: []
        }]
      })

      return html.transforms().hyperlink(selection, transformEntity())
        .should.eql(dom.create('a').class('class').attr('href', ''))
    })

    it('renders children', () => {
      const selection = quantum.select({
        type: 'hyperlink',
        params: [],
        content: [{
          type: 'div',
          params: ['.x'],
          content: ['content']
        }]
      })

      return html.transforms().hyperlink(selection, transformEntity())
        .should.eql(dom.create('a').attr('href', '').add(dom.create('div').class('x').add(dom.textNode('content'))))
    })
  })

  describe('title', () => {
    it('creates a title element in the head', () => {
      const selection = quantum.select({
        type: 'title',
        params: ['My Title'],
        content: []
      })

      html.transforms().title(selection, transformEntity())
        .should.eql(dom.head(dom.create('title').text('My Title'), {id: 'title'}))
    })
  })

  describe('head', () => {
    it('adds elements to the head', () => {
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

      return html.transforms().head(selection, transformEntity()).should.eql([
        dom.head(dom.create('meta').attr('name', 'value')),
        dom.head(dom.create('meta').attr('name2', 'value2'))
      ])
    })

    it('adds elements to the head (promise)', () => {
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

      return html.transforms().head(selection, promiseTransformEntity()).should.eventually.eql([
        dom.head(dom.create('meta').attr('name', 'value')),
        dom.head(dom.create('meta').attr('name2', 'value2'))
      ])
    })
  })

  describe('html', () => {
    it('becomes a unescaped text node', () => {
      const selection = quantum.select({
        type: 'html',
        params: [],
        content: ['<div></div>']
      })

      html.transforms().html(selection, transformEntity()).should.eql(
        dom.textNode('<div></div>', {escape: false})
      )
    })
  })

  describe('script', () => {
    it('becomes a script node', () => {
      const selection = quantum.select({
        type: 'script',
        params: ['/content/file.js'],
        content: []
      })

      html.transforms().script(selection, transformEntity()).should.eql(
        dom.create('script').attr('src', '/content/file.js')
      )
    })
  })

  describe('stylesheet', () => {
    it('creates a link tag', () => {
      const selection = quantum.select({
        type: 'stylesheet',
        params: ['/content/file.css'],
        content: []
      })

      html.transforms().stylesheet(selection, transformEntity()).should.eql(
        dom.head(dom.create('link').attr('href', '/content/file.css').attr('rel', 'stylesheet'))
      )
    })
  })

  describe('js', () => {
    it('becomes a script node', () => {
      const selection = quantum.select({
        type: 'js',
        params: [],
        content: ['function (x) { return x < 100}']
      })

      html.transforms().js(selection, transformEntity()).should.eql(
        dom.create('script').text('function (x) { return x < 100}', {escape: false})
      )
    })
  })

  describe('css', () => {
    it('becomes a style node', () => {
      const selection = quantum.select({
        type: 'css',
        params: [],
        content: ['.class { color: red; }']
      })

      html.transforms().css(selection, transformEntity()).should.eql(
        dom.head(dom.create('style').text('.class { color: red; }', {escape: false}))
      )
    })
  })
})
