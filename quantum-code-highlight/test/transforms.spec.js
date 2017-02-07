describe('transforms', () => {
  const path = require('path')
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const { transforms } = require('..')

  it('not highlight some inline code', () => {
    const selection = quantum.select({
      type: 'code',
      params: [],
      content: ['function (x) { return x * x }']
    })

    transforms().code(selection).should.eql(
      dom.create('code')
        .class('qm-code-highlight-code qm-code-font')
        .text('function (x) { return x * x }', {escape: false})
        .add(dom.asset({
          url: '/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight a codeblock', () => {
    const selection = quantum.select({
      type: 'codeblock',
      params: ['js'],
      content: ['function (x) { return x * x }']
    })

    transforms().codeblock(selection).should.eql(
      dom.create('div')
        .class('qm-code-highlight-codeblock language-js')
        .add(dom.create('pre')
          .add(dom.create('code').class('qm-code-font')
            .text('<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">x</span>) </span>{ <span class="hljs-keyword">return</span> x * x }', {escape: false})))
        .add(dom.asset({
          url: '/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight a codeblock (invalid language)', () => {
    const selection = quantum.select({
      type: 'codeblock',
      params: ['notalanguage'],
      content: ['function (x) { return x * x }']
    })

    transforms().codeblock(selection).should.eql(
      dom.create('div')
        .class('qm-code-highlight-codeblock language-notalanguage')
        .add(dom.create('pre')
          .add(dom.create('code').class('qm-code-font')
            .text('function (x) { return x * x }', {escape: false})))
        .add(dom.asset({
          url: '/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight a codeblock (auto highlight)', () => {
    const selection = quantum.select({
      type: 'codeblock',
      params: [],
      content: ['function (x) { return x * x }']
    })

    transforms().codeblock(selection).should.eql(
      dom.create('div')
        .class('qm-code-highlight-codeblock')
        .add(dom.create('pre')
            .add(dom.create('code').class('qm-code-font')
              .text('<span class="hljs-keyword">function</span> <span class="hljs-title"></span>(x) { <span class="hljs-keyword">return</span> <span class="hljs-type">x</span> * x }', {escape: false})))
        .add(dom.asset({
          url: '/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })
})
