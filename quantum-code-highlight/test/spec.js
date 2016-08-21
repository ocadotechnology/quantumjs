const path = require('path')
const chai = require('chai')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const codeHighlight = require('..')
const should = chai.should()

const Page = quantum.Page
const File = quantum.File

describe('quantum-code-highlight', () => {
  it('highlight some inline code', () => {
    const selection = quantum.select({
      type: 'code',
      params: ['js'],
      content: ['function (x) { return x * x }']
    })

    codeHighlight().code(selection).should.eql(
      dom.create('code')
        .class('quantum-code-highlight-code language-js')
        .text('<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">x</span>) </span>{ <span class="hljs-keyword">return</span> x * x }', {escape: false})
        .add(dom.asset({
          url: '/assets/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight some inline code (auto highlight)', () => {
    const selection = quantum.select({
      type: 'code',
      params: [],
      content: ['function (x) { return x * x }']
    })

    codeHighlight().code(selection).should.eql(
      dom.create('code')
        .class('quantum-code-highlight-code')
        .text('<span class="hljs-keyword">function</span> <span class="hljs-title"></span>(x) { <span class="hljs-keyword">return</span> <span class="hljs-type">x</span> * x }', {escape: false})
        .add(dom.asset({
          url: '/assets/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight a codeblock', () => {
    const selection = quantum.select({
      type: 'code',
      params: ['js'],
      content: ['function (x) { return x * x }']
    })

    codeHighlight().codeblock(selection).should.eql(
      dom.create('div')
        .class('quantum-code-highlight-codeblock language-js')
        .add(dom.create('pre')
          .text('<span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">x</span>) </span>{ <span class="hljs-keyword">return</span> x * x }', {escape: false}))
        .add(dom.asset({
          url: '/assets/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })

  it('highlight a codeblock (auto highlight)', () => {
    const selection = quantum.select({
      type: 'code',
      params: [],
      content: ['function (x) { return x * x }']
    })

    codeHighlight().codeblock(selection).should.eql(
      dom.create('div')
        .class('quantum-code-highlight-codeblock')
        .add(dom.create('pre')
          .text('<span class="hljs-keyword">function</span> <span class="hljs-title"></span>(x) { <span class="hljs-keyword">return</span> <span class="hljs-type">x</span> * x }', {escape: false}))
        .add(dom.asset({
          url: '/assets/quantum-code-highlight.css',
          file: path.join(__dirname, '../assets/quantum-code-highlight.css'),
          shared: true
        }))
    )
  })
})
