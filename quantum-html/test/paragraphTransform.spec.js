const quantum = require('quantum-js')
const dom = require('quantum-dom')
const path = require('path')
const { paragraphTransform } = require('..')

describe('paragraphTransform', () => {
  function transformer (selection) {
    return dom.create(selection.type() || 'div').text(selection.cs ? selection.cs() : selection)
  }

  const stylesheetAsset = dom.asset({
    url: '/quantum-html.css',
    file: path.join(__dirname, '../assets/quantum-html.css'),
    shared: true
  })

  it('makes multiple paragraphs', () => {
    const selection = quantum.select({
      type: 'div',
      params: [],
      content: [
        'Line 1.',
        'Part of same paragraph',
        '',
        'New Paragraph'
      ]
    })

    paragraphTransform(selection, transformer)
      .should.eql([
        stylesheetAsset,
        dom.create('div').class('qm-html-paragraph').add(dom.textNode('Line 1. ')).add(dom.textNode('Part of same paragraph ')),
        dom.create('div').class('qm-html-paragraph').add(dom.textNode('New Paragraph '))
      ])
  })

  it('no content should be fine', () => {
    const selection = quantum.select({
      type: 'whatever',
      params: [],
      content: []
    })

    return paragraphTransform(selection, transformer).should.eql([
      dom.asset({url: '/quantum-html.css', file: path.resolve(__dirname, '../assets/quantum-html.css'), shared: true})
    ])
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
        'new paragraph'
      ]
    })

    return Promise.all(paragraphTransform(selection, transformer)).then(res => {
      res.should.eql([
        dom.asset({url: '/quantum-html.css', file: path.resolve(__dirname, '../assets/quantum-html.css'), shared: true}),
        dom.create('div').class('qm-html-paragraph')
          .add(dom.textNode('some text '))
          .add(dom.textNode('some more text '))
          .add(dom.create('b').add('bold text'))
          .add(dom.textNode(' '))
          .add(dom.textNode('more text ')),
        dom.create('div').class('qm-html-paragraph')
          .add(dom.create('b').add('new paragraph'))
          .add(dom.textNode(' '))
          .add(dom.textNode('new paragraph '))
      ])
    })
  })
})
