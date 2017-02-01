'use strict'

const chai = require('chai')
const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const codeHighlight = require('quantum-code-highlight')
const markdown = require('..').transforms

chai.should()

describe('transforms', () => {
  it('render some basic markdown', () => {
    const selection = quantum.select({
      type: 'markdown',
      params: [],
      content: [
        '# H1',
        '## H2',
        '### H3',
        '#### H4',
        '##### H5',
        '###### H6'
      ]
    })

    markdown().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<h1 id="h1">H1</h1>\n<h2 id="h2">H2</h2>\n<h3 id="h3">H3</h3>\n<h4 id="h4">H4</h4>\n<h5 id="h5">H5</h5>\n<h6 id="h6">H6</h6>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          file: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(codeHighlight.stylesheetAsset)
    )
  })

  it('render highlighted code', () => {
    const selection = quantum.select({
      type: 'markdown',
      params: [],
      content: [
        '`inline code`',
        '```js',
        'const thing = 1;',
        '```'
      ]
    })

    markdown().markdown(selection).should.eql(
      dom.create('div').class('qm-markdown')
        .add('<p><code class="qm-code-font">inline code</code></p>\n<pre><code class="lang-js"><span class="hljs-keyword">const</span> thing = <span class="hljs-number">1</span>;\n</code></pre>\n')
        .add(dom.asset({
          url: '/quantum-markdown.css',
          file: path.join(__dirname, '../assets/quantum-markdown.css'),
          shared: true
        }))
        .add(codeHighlight.stylesheetAsset)
    )
  })
})
